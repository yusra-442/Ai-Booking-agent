import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

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

    return NextResponse.json(appointment, { status: 201 })
  } catch (error) {
    console.error('Appointment create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
