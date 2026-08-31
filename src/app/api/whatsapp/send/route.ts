import { NextRequest, NextResponse } from 'next/server'

// Send WhatsApp message using wa.me link (free, no API key needed)
export async function POST(req: NextRequest) {
  try {
    const { to, message } = await req.json()

    if (!to) {
      return NextResponse.json({ error: 'Phone number required' }, { status: 400 })
    }

    // Clean phone number
    const cleaned = to.replace(/[^0-9]/g, '')

    // Create WhatsApp wa.me link
    const encodedMessage = encodeURIComponent(message || 'Hi! I\'m interested in your services.')
    const whatsappUrl = `https://wa.me/${cleaned}?text=${encodedMessage}`

    return NextResponse.json({
      success: true,
      url: whatsappUrl,
      message: 'WhatsApp link generated. User will be redirected to WhatsApp.',
    })
  } catch (error) {
    console.error('WhatsApp send error:', error)
    return NextResponse.json({ error: 'Failed to generate WhatsApp link' }, { status: 500 })
  }
}
