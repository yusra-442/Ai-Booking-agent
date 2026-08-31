import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature') || ''

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
  console.error('Webhook signature verification failed')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const businessId = session.metadata?.businessId
        const plan = session.metadata?.plan

        if (businessId) {
          await db.business.update({
            where: { id: businessId },
            data: {
              subscriptionPlan: plan,
              subscriptionStatus: 'active',
              stripeCustomerId: session.customer as string,
            },
          })
      }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const businessId = subscription.metadata?.businessId

        if (businessId) {
          await db.business.update({
            where: { id: businessId },
            data: {
              subscriptionStatus: subscription.status,
            },
          })
      }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const businessId = subscription.metadata?.businessId

        if (businessId) {
          await db.business.update({
            where: { id: businessId },
            data: {
              subscriptionStatus: 'canceled',
              subscriptionPlan: 'free',
            },
          })
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
