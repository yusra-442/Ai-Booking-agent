'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">Manage your appointments and availability.</p>
        </div>
      </div>

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
              {days.map((day, i) => (
                <button
                  key={i}
                  onClick={() => day && setSelectedDate(new Date(year, month, day))}
                  className={`aspect-square rounded-lg p-2 text-sm transition-colors ${
                    day === null ? 'invisible' : ''
                  } ${isToday(day || 0) ? 'bg-primary text-primary-foreground font-bold' : ''} ${
                    selectedDate?.getDate() === day ? 'bg-primary/10 text-primary font-medium' : ''
                  } hover:bg-muted`}
                >
                  {day}
                </button>
              ))}
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
                <p className="text-sm text-muted-foreground">No appointments scheduled for this date.</p>
                <Button className="w-full">Add Appointment</Button>
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
