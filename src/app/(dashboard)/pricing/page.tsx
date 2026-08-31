'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$19',
    period: '/month',
    description: 'Perfect for small businesses',
    features: [
      '100 appointments/month',
      '5 services',
      'Email notifications',
      'Basic AI agent',
      '1 team member',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '$49',
    period: '/month',
    description: 'For growing businesses',
    popular: true,
    features: [
      'Unlimited appointments',
      'Unlimited services',
      'Email & SMS notifications',
      'Advanced AI agent',
      '5 team members',
      'Knowledge base',
      'Website widget',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$99',
    period: '/month',
    description: 'For large organizations',
    features: [
      'Everything in Professional',
      'WhatsApp integration',
      'Custom AI training',
      'Unlimited team members',
      'Priority support',
      'API access',
      'White-label',
    ],
  },
]

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (plan: string) => {
    setLoading(plan)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
    }
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Simple, Transparent Pricing</h1>
        <p className="text-muted-foreground mt-2">Choose the plan that fits your business</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {PLANS.map((plan) => (
          <Card
            key={plan.id}
            className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                Most Popular
              </div>
            )}
            <CardHeader>
              <CardTitle>
                <div className="text-2xl font-bold">
                  {plan.price}
                  <span className="text-sm font-normal text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                variant={plan.popular ? 'default' : 'outline'}
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading === plan.id}
              >
                {loading === plan.id ? 'Loading...' : 'Get Started'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
