import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

function startOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() + (6 - day))
  d.setHours(23, 59, 59, 999)
  return d
}

function startOfMonth(date: Date): Date {
  const d = new Date(date)
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfMonth(date: Date): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + 1)
  d.setDate(0)
  d.setHours(23, 59, 59, 999)
  return d
}

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

    const businessId = payload.businessId
    const now = new Date()
    const today = startOfDay(now)
    const todayEnd = endOfDay(now)
    const weekStart = startOfWeek(now)
    const weekEnd = endOfWeek(now)
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    const [
      todayAppointments,
      upcomingAppointments,
      totalCustomers,
      totalServices,
      weeklyAppointments,
      monthlyAppointments,
      cancelledAppointments,
      completedAppointments,
      recentAppointments,
    ] = await Promise.all([
      db.appointment.count({
        where: { businessId, date: { gte: today, lte: todayEnd }, status: { not: 'CANCELLED' } },
      }),
      db.appointment.count({
        where: { businessId, date: { gte: now }, status: { not: 'CANCELLED' } },
      }),
      db.customer.count({ where: { businessId } }),
      db.service.count({ where: { businessId, isActive: true } }),
      db.appointment.count({
        where: { businessId, date: { gte: weekStart, lte: weekEnd } },
      }),
      db.appointment.count({
        where: { businessId, date: { gte: monthStart, lte: monthEnd } },
      }),
      db.appointment.count({
        where: { businessId, status: 'CANCELLED' },
      }),
      db.appointment.count({
        where: { businessId, status: 'COMPLETED' },
      }),
      db.appointment.findMany({
        where: { businessId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { customer: true, service: true },
      }),
    ])

    const totalAppointmentsCount = monthlyAppointments || 1
    const conversionRate = Math.round((completedAppointments / totalAppointmentsCount) * 100)
    const cancellationRate = Math.round((cancelledAppointments / totalAppointmentsCount) * 100)

    return NextResponse.json({
      stats: {
        todayAppointments,
        upcomingAppointments,
        totalCustomers,
        totalServices,
        weeklyAppointments,
        monthlyAppointments,
        conversionRate: isNaN(conversionRate) ? 0 : conversionRate,
        cancellationRate: isNaN(cancellationRate) ? 0 : cancellationRate,
      },
      recentAppointments,
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
