// AI Service Abstraction Layer
// Supports: OpenAI, Anthropic, Ollama, OpenRouter, Mock

export interface AIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface AIResponse {
  content: string
  tool_calls?: ToolCall[]
}

export interface ToolCall {
  name: string
  arguments: Record<string, unknown>
}

export interface AIService {
  chat(messages: AIMessage[], systemPrompt?: string): Promise<AIResponse>
}

// =====================
// OpenAI Provider
// =====================

class OpenAIService implements AIService {
  private apiKey: string
  private model: string

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || ''
    this.model = process.env.OPENAI_MODEL || 'gpt-4o-mini'
  }

  async chat(messages: AIMessage[], systemPrompt?: string): Promise<AIResponse> {
    const allMessages: AIMessage[] = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: allMessages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      content: data.choices[0].message.content,
    }
  }
}

// =====================
// Anthropic Provider
// =====================

class AnthropicService implements AIService {
  private apiKey: string
  private model: string

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY || ''
    this.model = process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307'
  }

  async chat(messages: AIMessage[], systemPrompt?: string): Promise<AIResponse> {
    const filteredMessages = messages.filter(m => m.role !== 'system')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2024-06-01',
      },
      body: JSON.stringify({
        model: this.model,
        messages: filteredMessages,
        system: systemPrompt,
        max_tokens: 500,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      content: data.content[0].text,
    }
  }
}

// =====================
// Ollama Provider
// =====================

class OllamaService implements AIService {
  private baseUrl: string
  private model: string

  constructor() {
    this.baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
    this.model = process.env.OLLAMA_MODEL || 'llama3'
  }

  async chat(messages: AIMessage[], systemPrompt?: string): Promise<AIResponse> {
    const allMessages = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages

    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages: allMessages,
        stream: false,
        options: { temperature: 0.7 },
      }),
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      content: data.message.content,
    }
  }
}

// =====================
// Mock Provider (for development/testing)
// =====================

class MockAIService implements AIService {
  async chat(messages: AIMessage[], systemPrompt?: string): Promise<AIResponse> {
    const lastMessage = messages[messages.length - 1]?.content.toLowerCase() || ''

    // Extract info from system prompt
    const businessNameMatch = systemPrompt?.match(/assistant for (.+?)\./)
    const businessName = businessNameMatch ? businessNameMatch[1] : 'our business'

    // Helper to extract section from system prompt
    const getSection = (name: string) => {
      const match = systemPrompt?.match(new RegExp(`${name}:([\\s\\S]*?)(?=\\n\\n|$)`))
      return match ? match[1].trim() : ''
    }

    const aboutSection = getSection('ABOUT US')
    const servicesSection = getSection('SERVICES')
    const productsSection = getSection('PRODUCTS')
    const pricingSection = getSection('PRICING INFORMATION')
    const hoursSection = getSection('WORKING HOURS')
    const contactSection = getSection('CONTACT')
    const policySection = getSection('POLICIES')
    const faqSection = getSection('FREQUENTLY ASKED QUESTIONS')

    // Greeting - short and natural
    if (lastMessage.match(/^(hi|hello|hey|salam|asalam|good morning|good evening)/)) {
      return { content: `Hi! How can I help you today?` }
    }

    // Services questions
    if (lastMessage.match(/(service|services|offer|provide|what do you do|what do you have)/)) {
      if (servicesSection) {
        return { content: `Here's what we offer:\n\n${servicesSection}\n\nWould you like to book an appointment or know more about any service?` }
      }
      return { content: `We offer various services. Would you like me to tell you about a specific one?` }
    }

    // Products questions
    if (lastMessage.match(/(product|products|item|items|sell|buy|purchase|inventory|stock)/)) {
      if (productsSection) {
        return { content: `Here are our products:\n\n${productsSection}\n\nWould you like to know more about any product?` }
      }
      return { content: `We have a range of products. What are you looking for?` }
    }

    // Pricing questions
    if (lastMessage.match(/(price|pricing|cost|how much|fee|charge|rate|expensive|cheap)/)) {
      if (pricingSection) {
        return { content: `${pricingSection}\n\nWould you like to know about anything else?` }
      }
      if (servicesSection) {
        const prices = servicesSection.split('\n').filter(l => l.includes('$'))
        if (prices.length) {
          return { content: `Here are our prices:\n\n${prices.join('\n')}\n\nWould you like to book an appointment?` }
        }
      }
      return { content: `Our prices vary by service. What are you interested in?` }
    }

    // Hours questions
    if (lastMessage.match(/(hour|hours|open|close|timing|when|schedule|available days)/)) {
      if (hoursSection) {
        return { content: `Our hours:\n\n${hoursSection}\n\nWould you like to book a slot?` }
      }
      return { content: `We're open Monday to Saturday. Want me to check availability for a specific day?` }
    }

    // Contact/location questions
    if (lastMessage.match(/(contact|phone|email|address|location|where|reach|whatsapp|call)/)) {
      if (contactSection) {
        return { content: `Here's how to reach us:\n\n${contactSection}\n\nIs there anything I can help you with?` }
      }
      return { content: `You can reach us by phone or email. Would you like our contact details?` }
    }

    // Booking questions
    if (lastMessage.match(/(book|booking|appointment|schedule|reserve)/)) {
      return { content: `I'd love to help you book! Just tell me:\n\n1. Which service or product\n2. Preferred date\n3. Preferred time` }
    }

    // Cancellation
    if (lastMessage.match(/(cancel|cancellation|refund)/)) {
      if (policySection) {
        return { content: `Here's our policy:\n\n${policySection}\n\nWould you like me to help with anything else?` }
      }
      return { content: `I can help with that. Please share your appointment details.` }
    }

    // About questions
    if (lastMessage.match(/(about|who are you|tell me about|what is|describe)/)) {
      if (aboutSection) {
        return { content: aboutSection }
      }
      return { content: `${businessName} is here to serve you. What would you like to know?` }
    }

    // FAQ-style questions
    if (lastMessage.match(/(policy|policies|rules|terms|condition|warranty|guarantee|return|exchange)/)) {
      if (policySection) {
        return { content: policySection }
      }
      return { content: `I can help with that. Could you be more specific about what you'd like to know?` }
    }

    // Availability
    if (lastMessage.match(/(available|slot|slots|free|opening)/)) {
      return { content: `We have openings this week:\n\n• Monday 10:00 AM\n• Tuesday 2:00 PM\n• Wednesday 11:00 AM\n• Thursday 3:00 PM\n• Friday 9:00 AM\n\nWhich works for you?` }
    }

    // Default - natural helpful response
    return { content: `I can help you with:\n\n• Services & pricing\n• Products & availability\n• Booking appointments\n• Business hours & location\n• Policies & FAQs\n\nWhat would you like to know?` }
  }
}

// =====================
// Factory
// =====================

export function createAIService(): AIService {
  const provider = process.env.AI_PROVIDER || 'mock'

  switch (provider) {
    case 'openai':
      return new OpenAIService()
    case 'anthropic':
      return new AnthropicService()
    case 'ollama':
      return new OllamaService()
    case 'mock':
    default:
      return new MockAIService()
  }
}

export const aiService = createAIService()
