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

    const services = await db.service.findMany({
      where: { businessId: payload.businessId },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(services)
  } catch (error) {
    console.error('Services fetch error:', error)
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

    const { name, description, duration, price, color } = await req.json()

    if (!name || !duration) {
      return NextResponse.json({ error: 'Name and duration are required' }, { status: 400 })
    }

    const service = await db.service.create({
      data: {
        businessId: payload.businessId,
        name,
        description,
        duration: parseInt(duration),
        price: price ? parseFloat(price) : null,
        color: color || '#3b82f6',
      },
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error('Service create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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

    const { id, name, description, duration, price, color } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 })
    }

    const service = await db.service.update({
      where: { id, businessId: payload.businessId },
      data: {
        name,
        description,
        duration: parseInt(duration),
        price: price ? parseFloat(price) : null,
        color: color || '#3b82f6',
    },
  })

    return NextResponse.json(service)
  } catch (error) {
    console.error('Service update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
  if (!payload?.businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await req.json()

    if (!id) {
    return NextResponse.json({ error: 'Service ID is required' }, { status: 400 })
    }

    await db.service.delete({
      where: { id, businessId: payload.businessId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Service delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
