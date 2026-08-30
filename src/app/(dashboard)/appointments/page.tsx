'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([])
 const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [customers, setCustomers] = useState([])
  const [services, setServices] = useState([])
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    customerId: '',
 serviceId: '',
    date: '',
    startTime: '',
    notes: '',
  })

  useEffect(() => {
    fetchAppointments()
    fetchCustomers()
    fetchServices()
  }, [])

  const fetchAppointments = async () => {
    try {
      const res = await fetch('/api/appointments')
      if (res.ok) {
        const data = await res.json()
        setAppointments(data)
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers')
      if (res.ok) {
        const data = await res.json()
        setCustomers(data)
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error)
    }
  }

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services')
      if (res.ok) {
        const data = await res.json()
        setServices(data)
      }
    } catch (error) {
 console.error('Failed to fetch services:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
     headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
  })
      if (res.ok) {
        setShowDialog(false)
        setFormData({ customerId: '', serviceId: '', date: '', startTime: '', notes: '' })
        fetchAppointments()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to create appointment')
      }
    } catch (error) {
      alert('Failed to create appointment')
    } finally {
      setSaving(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-500/10 text-blue-500'
      case 'CONFIRMED': return 'bg-green-500/10 text-green-500'
      case 'COMPLETED': return 'bg-gray-500/10 text-gray-500'
      case 'CANCELLED': return 'bg-red-500/10 text-red-500'
      case 'NO_SHOW': return 'bg-orange-500/10 text-orange-500'
      default: return 'bg-gray-500/10 text-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
  <div>
        <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
      <p className="text-muted-foreground">View and manage all appointments.</p>
        </div>
        <Button onClick={() => setShowDialog(true)}>New Appointment</Button>
      </div>

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
      <h2 className="text-lg font-semibold">New Appointment</h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label>Customer</Label>
                <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
   value={formData.customerId}
        onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  required
                >
      <option value="">Select customer</option>
        {customers.map((c: any) => (
         <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
 ))}
                </select>
              </div>
              <div className="space-y-2">
    <Label>Service</Label>
       <select
             className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        value={formData.serviceId}
        onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                required
                >
           <option value="">Select service</option>
            {services.map((s: any) => (
             <option key={s.id} value={s.id}>{s.name} ({s.duration} min)</option>
          ))}
                </select>
              </div>
       <div className="space-y-2">
                <Label>Date</Label>
                <Input
             type="date"
      value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
       <div className="space-y-2">
    <Label>Time</Label>
         <Input
          type="time"
        value={formData.startTime}
    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
      <Label>Notes (optional)</Label>
                <Input
    value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
         <div className="flex justify-end gap-2">
         <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
      Cancel
         </Button>
     <Button type="submit" disabled={saving}>
           {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
            </form>
        </div>
        </div>
      )}

      <Card>
        <CardHeader>
       <CardTitle>All Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : appointments.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
    <p>No appointments found. Create your first appointment to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
   {appointments.map((apt: any) => (
                <div key={apt.id} className="flex items-center justify-between rounded-lg border p-4">
           <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font medium">
           {apt.customer?.firstName?.[0]}{apt.customer?.lastName?.[0]}
              </div>
            <div>
        <p className="font-medium">{apt.customer?.firstName} {apt.customer?.lastName}</p>
   <p className="text-sm text-muted-foreground">{apt.service?.name}</p>
        </div>
       </div>
           <div className="flex items-center gap-4">
          <div className="text-right">
           <p className="text-sm font-medium">{new Date(apt.date).toLocaleDateString()}</p>
       <p className="text-xs text-muted-foreground">{new Date(apt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(apt.status)}`}>
          {apt.status}
         </span>
              </div>
           </div>
           ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}