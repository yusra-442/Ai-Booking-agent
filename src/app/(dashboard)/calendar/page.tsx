'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [customers, setCustomers] = useState([])
  const [services, setServices] = useState([])
  const [saving, setSaving] = useState(false)
  const [appointments, setAppointments] = useState([])
  const [formData, setFormData] = useState({
    customerId: '',
    serviceId: '',
    startTime: '',
    notes: '',
  })

  useEffect(() => {
    fetchCustomers()
    fetchServices()
    fetchAppointments()
  }, [])

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

  const fetchAppointments = async () => {
    try {
      const res = await fetch('/api/appointments')
      if (res.ok) {
        const data = await res.json()
        setAppointments(data)
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error)
    }
  }

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDate) return
    setSaving(true)
    try {
      const dateStr = selectedDate.toISOString().split('T')[0]
      const res = await fetch('/api/appointments', {
        method: 'POST',
   headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
       ...formData,
   date: dateStr,
        }),
      })
      if (res.ok) {
        setShowDialog(false)
        setFormData({ customerId: '', serviceId: '', startTime: '', notes: '' })
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

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const days = []
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const isToday = (day: number) => {
    const today = new Date()
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
  }

  const getAppointmentsForDay = (day: number) => {
    if (!day) return []
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return appointments.filter((apt: any) => apt.date.startsWith(dateStr))
  }

  const selectedDateAppointments = selectedDate ? getAppointmentsForDay(selectedDate.getDate()) : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">Manage your appointments and availability.</p>
        </div>
      </div>

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
            <h2 className="text-lg font-semibold">
              Add Appointment - {selectedDate?.toLocaleDateString()}
            </h2>
            <form onSubmit={handleAddAppointment} className="mt-4 space-y-4">
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

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{MONTHS[month]} {year}</CardTitle>
            <div className="flex gap-2">
   <Button variant="outline" size="sm" onClick={prevMonth}>Prev</Button>
              <Button variant="outline" size="sm" onClick={nextMonth}>Next</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
         {DAYS.map(day => (
        <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
      {day}
          </div>
              ))}
              {days.map((day, i) => {
      const dayAppointments = getAppointmentsForDay(day || 0)
           return (
            <button
    key={i}
    onClick={() => day && setSelectedDate(new Date(year, month, day))}
            className={`aspect-square rounded-lg p-2 text-sm transition-colors relative ${
          day === null ? 'invisible' : ''
        } ${isToday(day || 0) ? 'bg-primary text-primary-foreground font-bold' : ''} ${
            selectedDate?.getDate() === day ? 'bg-primary/10 text-primary font-medium' : ''
             } hover:bg-muted`}
          >
          {day}
        {dayAppointments.length > 0 && (
           <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />
          )}
          </button>
       )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
        {selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'Select a Date'}
            </CardTitle>
          </CardHeader>
          <CardContent>
  {selectedDate ? (
    <div className="space-y-4">
                {selectedDateAppointments.length > 0 ? (
   selectedDateAppointments.map((apt: any) => (
          <div key={apt.id} className="rounded-lg border p-3">
         <p className="font-medium">{apt.customer?.firstName} {apt.customer?.lastName}</p>
         <p className="text-sm text-muted-foreground">{apt.service?.name}</p>
         <p className="text-xs text-muted-foreground">{new Date(apt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
       </div>
                  ))
     ) : (
       <p className="text-sm text-muted-foreground">No appointments scheduled for this date.</p>
   )}
        <Button className="w-full" onClick={() => setShowDialog(true)}>Add Appointment</Button>
           </div>
            ) : (
     <p className="text-sm text-muted-foreground">Click on a date to view or create appointments.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
