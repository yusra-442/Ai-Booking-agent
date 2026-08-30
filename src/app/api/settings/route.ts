import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

// GET all settings
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

    const business = await db.business.findUnique({
      where: { id: payload.businessId },
      include: {
        workingHours: true,
        blockedDates: true,
        businessSettings: true,
        notificationSettings: true,
      },
    })

    return NextResponse.json(business)
  } catch (error) {
    console.error('Settings fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT update all settings
export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload?.businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      name,
      phone,
      email,
      website,
      whatsappNumber,
      address,
      city,
      state,
      zipCode,
      country,
      timezone,
      appointmentDuration,
      bufferMinutes,
      slotInterval,
      workingHours,
      notificationSettings,
    } = await req.json()

    // Update business profile
    const business = await db.business.update({
      where: { id: payload.businessId },
      data: {
        name,
        phone,
        email,
        website,
        whatsappNumber,
        address,
        city,
        state,
        zipCode,
        country,
        timezone,
      },
    })

    // Update or create business settings
    await db.businessSettings.upsert({
      where: { businessId: payload.businessId },
      update: {
        appointmentDuration,
        bufferMinutes,
        slotInterval,
      },
      create: {
        businessId: payload.businessId,
        appointmentDuration,
        bufferMinutes,
        slotInterval,
      },
    })

    // Update working hours
    if (workingHours && Array.isArray(workingHours)) {
      for (const wh of workingHours) {
        await db.workingHour.upsert({
          where: {
            businessId_dayOfWeek: {
              businessId: payload.businessId,
              dayOfWeek: wh.dayOfWeek,
            },
          },
          update: {
            startTime: wh.startTime,
            endTime: wh.endTime,
            isAvailable: wh.isAvailable,
          },
          create: {
            businessId: payload.businessId,
            dayOfWeek: wh.dayOfWeek,
            startTime: wh.startTime,
            endTime: wh.endTime,
            isAvailable: wh.isAvailable,
          },
        })
      }
    }

    // Update notification settings
    if (notificationSettings) {
      await db.notificationSetting.upsert({
        where: { businessId: payload.businessId },
        update: notificationSettings,
        create: {
          businessId: payload.businessId,
          ...notificationSettings,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
