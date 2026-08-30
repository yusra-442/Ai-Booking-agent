import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { emailService } from '@/lib/email/service'
import { newAppointmentOwnerEmail, newAppointmentCustomerEmail, cancellationOwnerEmail, cancellationCustomerEmail } from '@/lib/email/templates'

// Helper to check if a date is blocked
async function isDateBlocked(businessId: string, date: Date): Promise<boolean> {
  const dateStr = date.toISOString().split('T')[0]
  const blocked = await db.blockedDate.findFirst({
 where: {
      businessId,
      date: {
        gte: new Date(dateStr + 'T00:00:00.000Z'),
        lt: new Date(dateStr + 'T23:59:59.999Z'),
      },
    },
  })
  return !!blocked
}

// Helper to check if time is within working hours
async function isWithinWorkingHours(businessId: string, date: Date, startTime: string): Promise<boolean> {
  const dayOfWeek = date.getDay()
  const workingHour = await db.workingHour.findFirst({
    where: { businessId, dayOfWeek, isAvailable: true },
  })

  if (!workingHour) return false

  const [hour, minute] = startTime.split(':').map(Number)
  const appointmentMinutes = hour * 60 + minute
  const [startHour, startMinute] = workingHour.startTime.split(':').map(Number)
  const [endHour, endMinute] = workingHour.endTime.split(':').map(Number)
  const startMinutes = startHour * 60 + startMinute
  const endMinutes = endHour * 60 + endMinute

  return appointmentMinutes >= startMinutes && appointmentMinutes < endMinutes
}

// GET all appointments
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload?.businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const appointments = await db.appointment.findMany({
      where: { businessId: payload.businessId },
      orderBy: { date: 'desc' },
      include: {
        customer: true,
        service: true,
      },
    })

    return NextResponse.json(appointments)
  } catch (error) {
    console.error('Appointments fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST create appointment
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload?.businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { customerId, serviceId, date, startTime, notes } = await req.json()

    // Validate working hours
    const appointmentDate = new Date(date)
    const withinHours = await isWithinWorkingHours(payload.businessId, appointmentDate, startTime)
    if (!withinHours) {
      return NextResponse.json({ error: 'Selected time is outside working hours or on a closed day' }, { status: 400 })
    }

    // Check if date is blocked
    const dateBlocked = await isDateBlocked(payload.businessId, appointmentDate)
    if (dateBlocked) {
      return NextResponse.json({ error: 'Selected date is not available (holiday/day off)' }, { status: 400 })
    }

    const service = await db.service.findUnique({ where: { id: serviceId } })
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    const start = new Date(`${date}T${startTime}`)
    const end = new Date(start.getTime() + service.duration * 60000)

    const appointment = await db.appointment.create({
      data: {
        businessId: payload.businessId,
        customerId,
        serviceId,
        date: new Date(date),
        startTime: start,
        endTime: end,
        notes,
        status: 'SCHEDULED',
      },
      include: { customer: true, service: true },
    })

    // Send email notifications (async, don't wait)
    const business = await db.business.findUnique({ where: { id: payload.businessId } })
    const emailData = {
      customerName: `${appointment.customer?.firstName} ${appointment.customer?.lastName}`,
      customerEmail: appointment.customer?.email || undefined,
      customerPhone: appointment.customer?.phone || undefined,
      date: appointmentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      time: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      serviceName: service.name,
      businessName: business?.name || 'Your Business',
    }

    if (business?.email) {
      emailService.send({
        to: business.email,
        subject: `New Appointment: ${emailData.customerName}`,
        html: newAppointmentOwnerEmail(emailData),
      })
    }

    if (appointment.customer?.email) {
      emailService.send({
        to: appointment.customer.email,
        subject: `Appointment Confirmed: ${emailData.serviceName}`,
        html: newAppointmentCustomerEmail(emailData),
      })
    }

    return NextResponse.json(appointment, { status: 201 })
  } catch (error) {
    console.error('Appointment create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH update appointment (cancel)
export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload?.businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, status, reason } = await req.json()

    const appointment = await db.appointment.findFirst({
      where: { id, businessId: payload.businessId },
      include: { customer: true, service: true },
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    const updated = await db.appointment.update({
      where: { id },
      data: { status },
      include: { customer: true, service: true },
    })

    // Send cancellation emails
    if (status === 'CANCELLED') {
      const business = await db.business.findUnique({ where: { id: payload.businessId } })
      const emailData = {
        customerName: `${appointment.customer?.firstName} ${appointment.customer?.lastName}`,
        customerEmail: appointment.customer?.email || undefined,
        customerPhone: appointment.customer?.phone || undefined,
        date: new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        time: new Date(appointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        serviceName: appointment.service?.name || 'Service',
        businessName: business?.name || 'Your Business',
        reason,
      }

      if (business?.email) {
        emailService.send({
          to: business.email,
          subject: `Appointment Cancelled: ${emailData.customerName}`,
          html: cancellationOwnerEmail(emailData),
        })
      }

      if (appointment.customer?.email) {
        emailService.send({
          to: appointment.customer.email,
          subject: `Appointment Cancelled: ${emailData.serviceName}`,
          html: cancellationCustomerEmail(emailData),
        })
      }
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Appointment update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
