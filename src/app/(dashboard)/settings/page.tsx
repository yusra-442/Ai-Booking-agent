'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

interface SettingsData {
  name: string
  phone: string
  email: string
  website: string
  whatsappNumber: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  timezone: string
  appointmentDuration: number
  bufferMinutes: number
  slotInterval: number
  workingHours: Array<{ dayOfWeek: number; startTime: string; endTime: string; isAvailable: boolean }>
  blockedDates: Array<{ id: string; date: string; reason: string }>
  notificationSettings: {
    confirmationEnabled: boolean
    reminder24hEnabled: boolean
    reminder1hEnabled: boolean
    followUpEnabled: boolean
  }
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [newHoliday, setNewHoliday] = useState({ date: '', reason: '' })
  const [copied, setCopied] = useState(false)
  const [settings, setSettings] = useState<SettingsData>({
    name: '',
    phone: '',
    email: '',
    website: '',
    whatsappNumber: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Pakistan',
    timezone: 'Asia/Karachi',
    appointmentDuration: 30,
    bufferMinutes: 0,
    slotInterval: 30,
    workingHours: DAYS.map((_, i) => ({ dayOfWeek: i, startTime: '09:00', endTime: '17:00', isAvailable: i !== 0 })),
    blockedDates: [],
    notificationSettings: {
      confirmationEnabled: true,
      reminder24hEnabled: true,
      reminder1hEnabled: true,
      followUpEnabled: true,
    },
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      if (res.ok) {
        const data = await res.json()
        setSettings({
          ...settings,
          ...data,
          workingHours: data.workingHours?.length ? data.workingHours : settings.workingHours,
          blockedDates: data.blockedDates || [],
          notificationSettings: data.notificationSettings || settings.notificationSettings,
          appointmentDuration: data.businessSettings?.appointmentDuration || 30,
          bufferMinutes: data.businessSettings?.bufferMinutes || 0,
          slotInterval: data.businessSettings?.slotInterval || 30,
        })
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
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

  const addHoliday = async () => {
    if (!newHoliday.date) return
    try {
      const res = await fetch('/api/blocked-dates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHoliday),
      })
      if (res.ok) {
        const data = await res.json()
        setSettings({ ...settings, blockedDates: [...settings.blockedDates, data] })
        setNewHoliday({ date: '', reason: '' })
      }
    } catch (error) {
      console.error('Failed to add holiday:', error)
    }
  }

  const removeHoliday = async (id: string) => {
    try {
      await fetch('/api/blocked-dates', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setSettings({ ...settings, blockedDates: settings.blockedDates.filter((h) => h.id !== id) })
    } catch (error) {
      console.error('Failed to remove holiday:', error)
    }
  }

  const updateWorkingHour = (dayOfWeek: number, field: string, value: string | boolean) => {
    setSettings({
      ...settings,
      workingHours: settings.workingHours.map((wh) =>
        wh.dayOfWeek === dayOfWeek ? { ...wh, [field]: value } : wh
      ),
    })
  }

  const generateWidgetCode = () => {
    const businessSlug = settings.name.toLowerCase().replace(/\s+/g, '-')
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    return `<script src="${origin}/widget.js" data-business="${businessSlug}" async></script>`
  }

  const copyWidgetCode = () => {
    navigator.clipboard.writeText(generateWidgetCode())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const tabs = [
    { id: 'profile', label: 'Business Profile' },
    { id: 'hours', label: 'Working Hours' },
    { id: 'holidays', label: 'Holidays' },
    { id: 'appointments', label: 'Appointment Settings' },
    { id: 'connect', label: 'Connect' },
    { id: 'notifications', label: 'Notifications' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your business profile and preferences.</p>
      </div>

      {message && (
        <div
          className={`rounded-md p-3 text-sm ${
            message.includes('success') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
          }`}
        >
          {message}
        </div>
      )}

      <div className="flex gap-2 border-b pb-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
              activeTab === tab.id
           ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <Card>
          <CardHeader>
            <CardTitle>Business Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Business Name</Label>
                <Input value={settings.name} onChange={(e) => setSettings({ ...settings, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input value={settings.website} onChange={(e) => setSettings({ ...settings, website: e.target.value })} placeholder="https://" />
              </div>
   <div className="space-y-2">
             <Label>WhatsApp Number</Label>
                <Input value={settings.whatsappNumber} onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })} placeholder="+92 300 1234567" />
              </div>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Input value={settings.timezone} onChange={(e) => setSettings({ ...settings, timezone: e.target.value })} />
              </div>
         <div className="space-y-2">
      <Label>Address</Label>
         <Input value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} />
              </div>
           <div className="space-y-2">
    <Label>City</Label>
                <Input value={settings.city} onChange={(e) => setSettings({ ...settings, city: e.target.value })} />
              </div>
     <div className="space-y-2">
                <Label>State/Province</Label>
                <Input value={settings.state} onChange={(e) => setSettings({ ...settings, state: e.target.value })} />
              </div>
    <div className="space-y-2">
                <Label>ZIP Code</Label>
            <Input value={settings.zipCode} onChange={(e) => setSettings({ ...settings, zipCode: e.target.value })} />
  </div>
     <div className="space-y-2">
                <Label>Country</Label>
                <Input value={settings.country} onChange={(e) => setSettings({ ...settings, country: e.target.value })} />
        </div>
            </div>
   <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          </CardContent>
        </Card>
      )}

      {activeTab === 'hours' && (
        <Card>
<CardHeader><CardTitle>Working Hours</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {DAYS.map((day, i) => {
         const wh = settings.workingHours.find((w) => w.dayOfWeek === i)
       return (
   <div key={day} className="flex items-center gap-4 p-3 border rounded-lg">
        <div className="w-28 flex items-center gap-2">
         <input
   type="checkbox"
        checked={wh?.isAvailable || false}
       onChange={(e) => updateWorkingHour(i, 'isAvailable', e.target.checked)}
           />
      <span className="text-sm font-medium">{day}</span>
    </div>
           {wh?.isAvailable && (
    <div className="flex items-center gap-2">
           <Input type="time" value={wh.startTime} onChange={(e) => updateWorkingHour(i, 'startTime', e.target.value)} className="w-32" />
    <span>-</span>
         <Input type="time" value={wh.endTime} onChange={(e) => updateWorkingHour(i, 'endTime', e.target.value)} className="w-32" />
          </div>
         )}
      </div>
        )
  })}
            <Button onClick={handleSave} disabled={saving}>
    {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
        </Card>
      )}

      {activeTab === 'holidays' && (
        <Card>
          <CardHeader><CardTitle>Holidays / Days Off</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
         <Input type="date" value={newHoliday.date} onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })} />
       <Input placeholder="Reason (optional)" value={newHoliday.reason} onChange={(e) => setNewHoliday({ ...newHoliday, reason: e.target.value })} />
           <Button onClick={addHoliday}>Add</Button>
            </div>
        {settings.blockedDates.length > 0 && (
  <div className="space-y-2">
           {settings.blockedDates.map((holiday) => (
        <div key={holiday.id} className="flex items-center justify-between p-3 border rounded-lg">
  <div>
          <span className="font-medium">{new Date(holiday.date).toLocaleDateString()}</span>
        {holiday.reason && <span className="text-sm text-muted-foreground ml-2">({holiday.reason})</span>}
          </div>
       <Button variant="destructive" size="sm" onClick={() => removeHoliday(holiday.id)}>Remove</Button>
      </div>
    ))}
       </div>
 )}
            <Button onClick={handleSave} disabled={saving}>
       {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>
      )}

      {activeTab === 'appointments' && (
        <Card>
          <CardHeader><CardTitle>Appointment Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
   <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
       <Label>Default Duration (minutes)</Label>
                  <Input type="number" value={settings.appointmentDuration} onChange={(e) => setSettings({ ...settings, appointmentDuration: parseInt(e.target.value) || 30 })} />
  </div>
              <div className="space-y-2">
                <Label>Buffer Between (minutes)</Label>
         <Input type="number" value={settings.bufferMinutes} onChange={(e) => setSettings({ ...settings, bufferMinutes: parseInt(e.target.value) || 0 })} />
        </div>
            <div className="space-y-2">
   <Label>Slot Interval (minutes)</Label>
         <Input type="number" value={settings.slotInterval} onChange={(e) => setSettings({ ...settings, slotInterval: parseInt(e.target.value) || 30 })} />
           </div>
          </div>
      <Button onClick={handleSave} disabled={saving}>
       {saving ? 'Saving...' : 'Save Changes'}
            </Button>
        </CardContent>
        </Card>
      )}

      {activeTab === 'connect' && (
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Connect Website</CardTitle></CardHeader>
            <CardContent className="space-y-4">
         <p className="text-sm text-muted-foreground">
                Add this code to your website to enable AI-powered appointment booking directly from your site.
      </p>
       <div className="space-y-2">
      <Label>Your Website URL</Label>
                <Input value={settings.website} onChange={(e) => setSettings({ ...settings, website: e.target.value })} placeholder="https://yourwebsite.com" />
              </div>
           <div className="space-y-2">
         <Label>Embed Code</Label>
    <div className="relative">
      <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto">
                 {generateWidgetCode()}
            </pre>
         <Button size="sm" variant="outline" className="absolute top-2 right-2" onClick={copyWidgetCode}>
                {copied ? 'Copied!' : 'Copy'}
           </Button>
         </div>
         </div>
              <Button onClick={handleSave} disabled={saving}>
    {saving ? 'Saving...' : 'Save'}
       </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Connect WhatsApp</CardTitle></CardHeader>
            <CardContent className="space-y-4">
       <p className="text-sm text-muted-foreground">
                Connect your WhatsApp Business number to allow customers to book appointments via WhatsApp.
           </p>
    <div className="space-y-2">
        <Label>WhatsApp Business Number</Label>
     <Input value={settings.whatsappNumber} onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })} placeholder="+92 300 1234567" />
           </div>
           <p className="text-xs text-muted-foreground">
            Note: WhatsApp integration requires WhatsApp Business API setup (Meta Cloud API or Twilio). Contact support for assistance.
          </p>
    <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </CardContent>
          </Card>
   </div>
      )}

      {activeTab === 'notifications' && (
        <Card>
          <CardHeader><CardTitle>Notification Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
   <div className="space-y-3">
         <div className="flex items-center justify-between p-3 border rounded-lg">
    <div>
        <p className="font-medium">Booking Confirmations</p>
       <p className="text-sm text-muted-foreground">Send email when appointment is booked</p>
      </div>
      <input
 type="checkbox"
         checked={settings.notificationSettings.confirmationEnabled}
         onChange={(e) =>
    setSettings({
        ...settings,
      notificationSettings: { ...settings.notificationSettings, confirmationEnabled: e.target.checked },
     })
      }
          />
         </div>
         <div className="flex items-center justify-between p-3 border rounded-lg">
         <div>
      <p className="font-medium">24h Reminders</p>
      <p className="text-sm text-muted-foreground">Remind customers 24 hours before</p>
           </div>
             <input
    type="checkbox"
         checked={settings.notificationSettings.reminder24hEnabled}
          onChange={(e) =>
      setSettings({
    ...settings,
     notificationSettings: { ...settings.notificationSettings, reminder24hEnabled: e.target.checked },
  })
              }
       />
              </div>
        <div className="flex items-center justify-between p-3 border rounded-lg">
       <div>
     <p className="font-medium">1h Reminders</p>
             <p className="text-sm text-muted-foreground">Remind customers 1 hour before</p>
           </div>
           <input
          type="checkbox"
            checked={settings.notificationSettings.reminder1hEnabled}
     onChange={(e) =>
      setSettings({
   ...settings,
        notificationSettings: { ...settings.notificationSettings, reminder1hEnabled: e.target.checked },
   })
              }
     />
       </div>
           <div className="flex items-center justify-between p-3 border rounded-lg">
         <div>
          <p className="font-medium">Follow-up Messages</p>
                <p className="text-sm text-muted-foreground">Send follow-up after appointment</p>
  </div>
          <input
      type="checkbox"
         checked={settings.notificationSettings.followUpEnabled}
          onChange={(e) =>
      setSettings({
  ...settings,
        notificationSettings: { ...settings.notificationSettings, followUpEnabled: e.target.checked },
   })
      }
          />
     </div>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
