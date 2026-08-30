import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { aiService } from '@/lib/ai/service'

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload?.businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message } = await req.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const business = await db.business.findUnique({
      where: { id: payload.businessId },
      include: {
        services: { where: { isActive: true } },
        workingHours: true,
        aiSettings: true,
      },
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const systemPrompt = `You are an AI booking assistant for ${business.name}. 
Available services: ${business.services.map(s => `${s.name} (${s.duration} min, $${s.price || 0})`).join(', ')}.
Working hours: ${business.workingHours?.map((h: any) => `Day ${h.dayOfWeek}: ${h.startTime}-${h.endTime}`).join(', ') || 'Mon-Fri 9AM-5PM'}.

Help customers book appointments, check availability, reschedule, or cancel. 
Be friendly and helpful. Ask for missing information (name, service, date, time).
Confirm all details before booking. Never book outside working hours.`

    const response = await aiService.chat(
      [{ role: 'user', content: message }],
      business.aiSettings?.systemPrompt || systemPrompt
    )

    return NextResponse.json({ response: response.content })
  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
