'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SettingsPage() {
  const [businessName, setBusinessName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [timezone, setTimezone] = useState('Asia/Karachi')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      if (res.ok) {
   const data = await res.json()
     setBusinessName(data.name || '')
        setEmail(data.email || '')
      setPhone(data.phone || '')
  setTimezone(data.timezone || 'America/New_York')
      }
    } catch (error) {
    console.error('Failed to fetch settings:', error)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch('/api/settings', {
   method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName, email, phone, timezone }),
      })
      if (res.ok) {
     setMessage('Settings saved successfully!')
      } else {
        const data = await res.json()
        setMessage(data.error || 'Failed to save')
      }
    } catch (error) {
      setMessage('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your business profile and preferences.</p>
      </div>

   {message && (
  <div className={`rounded-md p-3 text-sm ${message.includes('success') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
    {message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Business Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
         <Label>Business Name</Label>
    <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Your Business Name" />
            </div>
            <div className="space-y-2">
    <Label>Email</Label>
       <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@business.com" />
            </div>
            <div className="space-y-2">
         <Label>Phone</Label>
         <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
            </div>
            <div className="space-y-2">
         <Label>Timezone</Label>
    <Input value={timezone} onChange={(e) => setTimezone(e.target.value)} />
            </div>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
     <div>
                <p className="font-medium">Booking Confirmations</p>
                <p className="text-sm text-muted-foreground">Send email when appointment is booked</p>
              </div>
              <div className="h-6 w-11 rounded-full bg-primary relative cursor-pointer">
                <div className="absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">24h Reminders</p>
                <p className="text-sm text-muted-foreground">Remind customers 24 hours before</p>
              </div>
              <div className="h-6 w-11 rounded-full bg-primary relative cursor-pointer">
                <div className="absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">1h Reminders</p>
                <p className="text-sm text-muted-foreground">Remind customers 1 hour before</p>
              </div>
              <div className="h-6 w-11 rounded-full bg-primary relative cursor-pointer">
                <div className="absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Follow-up Messages</p>
                <p className="text-sm text-muted-foreground">Send follow-up after appointment</p>
              </div>
              <div className="h-6 w-11 rounded-full bg-primary relative cursor-pointer">
                <div className="absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}