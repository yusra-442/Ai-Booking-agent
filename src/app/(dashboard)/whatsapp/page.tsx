'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function WhatsAppConnectPage() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [message, setMessage] = useState('Hi! I\'d like to book an appointment.')
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleConnectWhatsApp = async () => {
    if (!phoneNumber) return

    setSending(true)
    setStatus('idle')

    try {
      // Option 1: Generate wa.me link (opens WhatsApp directly)
      const cleaned = phoneNumber.replace(/[^0-9]/g, '')
      const encodedMessage = encodeURIComponent(message)
      const whatsappUrl = `https://wa.me/${cleaned}?text=${encodedMessage}`

      // Open WhatsApp
      window.open(whatsappUrl, '_blank')
      setStatus('success')
    } catch {
      setStatus('error')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Connect WhatsApp</h1>
        <p className="text-muted-foreground">
          Enter your phone number to start a WhatsApp conversation with our AI assistant.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Connect */}
        <Card className="hover-lift border-2 border-green-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">📱</span>
              Quick WhatsApp Connect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-sm text-green-700">
                <strong>How it works:</strong> Enter your number and we'll open WhatsApp with a pre-filled message.
                Just tap send and our AI assistant will respond!
              </p>
            </div>

            <div className="space-y-2">
              <Label>Your Phone Number</Label>
              <Input
                type="tel"
                placeholder="+92 300 1234567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="text-lg h-12"
              />
              <p className="text-xs text-muted-foreground">
                Include country code (e.g., +92 for Pakistan, +1 for USA)
              </p>
            </div>

            <div className="space-y-2">
              <Label>Starting Message</Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                placeholder="Hi! I'd like to book an appointment."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <Button
              onClick={handleConnectWhatsApp}
              disabled={!phoneNumber || sending}
              className="w-full h-12 text-lg bg-green-600 hover:bg-green-700"
            >
              {sending ? (
                'Connecting...'
              ) : (
                <>
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Connect via WhatsApp
                </>
              )}
            </Button>

            {status === 'success' && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm text-green-700">
                  WhatsApp opened! Send the message and our AI will respond automatically.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Business WhatsApp Setup */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🏢</span>
              Business WhatsApp Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Connect your business WhatsApp so customers can chat with your AI assistant 24/7.
            </p>

            <div className="space-y-2">
              <Label>Your Business WhatsApp Number</Label>
              <Input
                type="tel"
                placeholder="+92 300 1234567"
              />
            </div>

            <div className="space-y-2">
              <Label>Webhook URL (for Twilio/360dialog)</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/api/whatsapp/webhook`}
                  className="bg-muted text-sm"
                />
                <Button
                  variant="outline"
                  onClick={() =>
                    navigator.clipboard.writeText(
                      `${typeof window !== 'undefined' ? window.location.origin : ''}/api/whatsapp/webhook`
                    )
                  }
                >
                  Copy
                </Button>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              Save Configuration
            </Button>

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                <strong>Recommended providers:</strong> Twilio (easiest), 360dialog (cheapest for volume), WATI (no-code)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* How it works */}
      <Card>
        <CardHeader>
          <CardTitle>How WhatsApp Integration Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4">
              <div className="text-3xl mb-2">📱</div>
              <div className="font-medium">1. Enter Number</div>
              <p className="text-xs text-muted-foreground mt-1">Customer enters their phone number</p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">🔗</div>
              <div className="font-medium">2. Auto Connect</div>
              <p className="text-xs text-muted-foreground mt-1">WhatsApp opens with pre-filled message</p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">💬</div>
              <div className="font-medium">3. AI Responds</div>
              <p className="text-xs text-muted-foreground mt-1">Our AI assistant replies instantly</p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">✅</div>
              <div className="font-medium">4. Book & Manage</div>
              <p className="text-xs text-muted-foreground mt-1">Book appointments, check prices, get info</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
