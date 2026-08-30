import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

// GET all knowledge items
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

    const items = await db.knowledgeItem.findMany({
      where: { businessId: payload.businessId },
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error('Knowledge fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST create knowledge item
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

    const { category, title, content, price, metadata, sortOrder } = await req.json()

    if (!category || !title || !content) {
      return NextResponse.json({ error: 'Category, title, and content are required' }, { status: 400 })
    }

    const item = await db.knowledgeItem.create({
      data: {
        businessId: payload.businessId,
        category,
        title,
        content,
        price,
        metadata,
        sortOrder: sortOrder || 0,
      },
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Knowledge create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT update knowledge item
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

    const { id, category, title, content, price, metadata, sortOrder, isActive } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const item = await db.knowledgeItem.update({
      where: { id, businessId: payload.businessId },
      data: { category, title, content, price, metadata, sortOrder, isActive },
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Knowledge update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE knowledge item
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
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await db.knowledgeItem.delete({
      where: { id, businessId: payload.businessId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Knowledge delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
