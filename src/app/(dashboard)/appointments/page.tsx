'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAppointments()
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
        <Button>New Appointment</Button>
      </div>

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
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-medium">
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
