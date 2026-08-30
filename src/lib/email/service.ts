// Email Service Abstraction Layer
// Supports: Resend, Mock (for development)

export interface EmailMessage {
  to: string
  subject: string
  html: string
  from?: string
}

export interface EmailService {
  send(message: EmailMessage): Promise<boolean>
}

// =====================
// Resend Provider
// =====================

class ResendService implements EmailService {
  private apiKey: string
  private from: string

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY || ''
    this.from = process.env.EMAIL_FROM || 'noreply@example.com'
  }

  async send(message: EmailMessage): Promise<boolean> {
    if (!this.apiKey) {
      console.log('[Mock Email]', message)
      return true
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          from: message.from || this.from,
          to: message.to,
          subject: message.subject,
          html: message.html,
        }),
      })

      return response.ok
    } catch (error) {
      console.error('Email send error:', error)
      return false
    }
  }
}

// =====================
// Mock Provider (for development)
// =====================

class MockEmailService implements EmailService {
  async send(message: EmailMessage): Promise<boolean> {
    console.log('📧 [Mock Email]')
    console.log('To:', message.to)
    console.log('Subject:', message.subject)
    console.log('---')
    return true
  }
}

// =====================
// Factory
// =====================

export function createEmailService(): EmailService {
  const provider = process.env.EMAIL_PROVIDER || 'mock'

  switch (provider) {
    case 'resend':
      return new ResendService()
    case 'mock':
    default:
      return new MockEmailService()
  }
}

export const emailService = createEmailService()
