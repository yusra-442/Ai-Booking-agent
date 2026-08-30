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

    // Simulate AI responses based on keywords
    if (lastMessage.includes('book') || lastMessage.includes('appointment')) {
      return {
        content: "I'd be happy to help you book an appointment! Could you please tell me:\n\n1. What service are you looking for?\n2. What date works best for you?\n3. Do you have a preferred time?",
      }
    }

    if (lastMessage.includes('cancel')) {
      return {
        content: "I can help you cancel your appointment. Could you please provide your name and the date of your appointment so I can locate it?",
      }
    }

    if (lastMessage.includes('reschedule')) {
      return {
        content: "I'd be happy to help you reschedule. What's your name, and what new date/time would work better for you?",
      }
    }

    if (lastMessage.includes('available') || lastMessage.includes('time')) {
      return {
        content: "We have the following slots available this week:\n\n• Monday 2:00 PM\n• Tuesday 10:00 AM\n• Wednesday 3:00 PM\n• Friday 11:00 AM\n\nWhich works best for you?",
      }
    }

    return {
      content: "Hello! I'm the AI booking assistant. I can help you:\n\n• Book a new appointment\n• Reschedule an existing appointment\n• Cancel an appointment\n• Check availability\n\nHow can I help you today?",
    }
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
