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
  blockedDates: true,
      },
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Get knowledge base items
    const knowledgeItems = await db.knowledgeItem.findMany({
      where: { businessId: payload.businessId, isActive: true },
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    })

    // Build comprehensive system prompt with all business info
    const systemPrompt = buildSystemPrompt(business, knowledgeItems)

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

function buildSystemPrompt(business: any, knowledgeItems: any[]): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  // Group knowledge items by category
  const grouped = knowledgeItems.reduce((acc: any, item: any) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  let prompt = `You are an AI assistant for ${business.name}.\n\n`

  // About section
  if (grouped.ABOUT?.length) {
    prompt += `ABOUT US:\n${grouped.ABOUT.map((item: any) => item.content).join('\n')}\n\n`
  } else if (business.description) {
    prompt += `ABOUT US:\n${business.description}\n\n`
  }

  // Services section
  const servicesList = business.services?.map((s: any) =>
    `- ${s.name}: ${s.duration} minutes, $${s.price || 'Contact for price'}${s.description ? ' - ' + s.description : ''}`
  ).join('\n') || 'Contact us for service details'

  if (grouped.SERVICE?.length) {
    prompt += `SERVICES:\n${grouped.SERVICE.map((item: any) =>
      `- ${item.title}: ${item.content}${item.price ? ' - $' + item.price : ''}`
    ).join('\n')}\n\n`
  } else {
    prompt += `SERVICES:\n${servicesList}\n\n`
  }

  // Products section
  if (grouped.PRODUCT?.length) {
    prompt += `PRODUCTS:\n${grouped.PRODUCT.map((item: any) =>
      `- ${item.title}: ${item.content}${item.price ? ' - $' + item.price : ''}`
    ).join('\n')}\n\n`
  }

  // Pricing section
  if (grouped.PRICING?.length) {
    prompt += `PRICING INFORMATION:\n${grouped.PRICING.map((item: any) => item.content).join('\n')}\n\n`
  }

  // Working Hours
  const workingHoursList = business.workingHours?.length
    ? business.workingHours.map((h: any) =>
        `- ${days[h.dayOfWeek]}: ${h.isAvailable ? `${h.startTime}-${h.endTime}` : 'Closed'}`
      ).join('\n')
    : '- Contact us for hours'
  prompt += `WORKING HOURS:\n${workingHoursList}\n\n`

  // Contact info
  if (grouped.CONTACT?.length) {
    prompt += `CONTACT INFORMATION:\n${grouped.CONTACT.map((item: any) => item.content).join('\n')}\n\n`
  } else {
    prompt += `CONTACT:\n`
    if (business.phone) prompt += `- Phone: ${business.phone}\n`
    if (business.email) prompt += `- Email: ${business.email}\n`
    if (business.website) prompt += `- Website: ${business.website}\n`
    if (business.whatsappNumber) prompt += `- WhatsApp: ${business.whatsappNumber}\n`
    if (business.address) prompt += `- Address: ${business.address}, ${business.city}, ${business.state} ${business.zipCode}, ${business.country}\n`
    prompt += '\n'
  }

  // Holidays
  if (business.blockedDates?.length) {
    prompt += `DAYS OFF / HOLIDAYS:\n${business.blockedDates.map((d: any) =>
      `- ${new Date(d.date).toLocaleDateString()}${d.reason ? ': ' + d.reason : ''}`
    ).join('\n')}\n\n`
  }

  // Policies
  if (grouped.POLICY?.length) {
    prompt += `POLICIES:\n${grouped.POLICY.map((item: any) => `- ${item.title}: ${item.content}`).join('\n')}\n\n`
  }

  // FAQs
  if (grouped.FAQ?.length) {
    prompt += `FREQUENTLY ASKED QUESTIONS:\n${grouped.FAQ.map((item: any) => `Q: ${item.title}\nA: ${item.content}`).join('\n\n')}\n\n`
  }

  // Other info
  if (grouped.OTHER?.length) {
    prompt += `ADDITIONAL INFORMATION:\n${grouped.OTHER.map((item: any) => `- ${item.title}: ${item.content}`).join('\n')}\n\n`
  }

  prompt += `YOUR ROLE:
1. Answer customer questions accurately using ONLY the information above
2. Help customers book appointments for services
3. Provide product information and pricing when asked
4. If you don't know the answer, say "I don't have that information. Please contact us directly."
5. Be friendly, professional, and helpful
6. Never make up information that isn't provided above`

  return prompt
}
