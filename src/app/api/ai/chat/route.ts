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

SERVICES AND PRICING:
${business.services.map(s => `- ${s.name}: ${s.duration} minutes, $${s.price || 'Contact for price'}${s.description ? ' - ' + s.description : ''}`).join('\n')}

WORKING HOURS:
${business.workingHours?.length ? business.workingHours.map((h: any) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return `- ${days[h.dayOfWeek]}: ${h.startTime}-${h.endTime}${h.isAvailable ? '' : ' (Closed)'}`
}).join('\n') : '- Monday-Friday: 9:00 AM - 5:00 PM'}

Your role:
1. Answer questions about services and pricing accurately
2. Help customers book appointments
3. Check availability and suggest time slots
4. Help reschedule or cancel appointments
5. Be friendly, professional, and helpful

IMPORTANT:
- Always mention prices when asked about services
- Never book appointments outside working hours
- Confirm all booking details before finalizing
- Ask for customer name, service, date, and time when booking`

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
