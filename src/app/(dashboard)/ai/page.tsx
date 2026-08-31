'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function AIAgentPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm your AI assistant. I can help you with services, products, bookings, and more. What would you like to know?" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      })

      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.response || 'Sorry, I could not process your request.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Assistant</h1>
        <p className="text-muted-foreground">Your intelligent assistant for services, products, and bookings.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Chat Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col h-[500px]">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-lg px-4 py-2.5 ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-4 py-2.5">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  disabled={loading}
                />
                <Button onClick={sendMessage} disabled={loading}>Send</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">Status</p>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm text-muted-foreground">Active</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Provider</p>
              <p className="text-sm text-muted-foreground">{process.env.AI_PROVIDER || 'mock'}</p>
            </div>
            <div>
   <p className="text-sm font-medium mb-1">Capabilities</p>
   <ul className="text-sm text-muted-foreground space-y-1">
     <li>Services & products info</li>
     <li>Pricing & availability</li>
     <li>Book appointments</li>
     <li>Answer questions</li>
     <li>Business info</li>
   </ul>
            </div>
            <Button variant="outline" className="w-full">Configure AI</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
