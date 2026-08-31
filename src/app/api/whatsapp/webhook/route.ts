import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { aiService } from '@/lib/ai/service'

// WhatsApp webhook - receives messages from Twilio/WhatsApp API
export async function POST(req: NextRequest) {
  try {
    const body = await req.formData()
    const from = body.get('From') as string // whatsapp:+1234567890
    const message = body.get('Body') as string

    if (!from || !message) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // Extract phone number
    const phone = from.replace('whatsapp:', '')

    // Find customer by phone
    let customer = await db.customer.findFirst({
      where: { phone },
    })

    // Auto-create customer if not found
    if (!customer) {
      const business = await db.business.findFirst()
      if (business) {
        customer = await db.customer.create({
          data: {
            businessId: business.id,
            firstName: 'WhatsApp',
            lastName: `User ${phone.slice(-4)}`,
            phone,
          },
        })
      }
    }

    // Get business info for AI context
    const business = await db.business.findFirst({
      include: {
        services: { where: { isActive: true } },
        workingHours: true,
      },
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Build system prompt
    const systemPrompt = `You are an AI assistant for ${business.name}.
Services: ${business.services?.map(s => `${s.name} ($${s.price || 'N/A'})`).join(', ') || 'N/A'}
Keep responses concise for WhatsApp. Be helpful and friendly.`

    // Get AI response
    const response = await aiService.chat([{ role: 'user', content: message }], systemPrompt)

    // Return TwiML (Twilio Markup Language) response
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${response.content}</Message>
</Response>`

    return new NextResponse(twiml, {
      headers: { 'Content-Type': 'text/xml' },
    })
  } catch (error) {
    console.error('WhatsApp webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
