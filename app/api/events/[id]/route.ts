import { NextRequest, NextResponse } from 'next/server'
import { eventService } from '@/lib/event/event.service'
import { toErrorResponse } from '@/lib/errors'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  try {
    const event = await eventService.get(Number(id))
    return NextResponse.json(event)
  } catch (e) {
    return toErrorResponse(e) ?? NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params
  const body = await request.json()
  const { title, description, startAt, endAt, isAllDay, location, color } = body

  if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
    return NextResponse.json({ error: 'title cannot be empty' }, { status: 422 })
  }

  try {
    const event = await eventService.update(Number(id), { title, description, startAt, endAt, isAllDay, location, color })
    return NextResponse.json(event)
  } catch (e) {
    return toErrorResponse(e) ?? NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params
  try {
    await eventService.delete(Number(id))
    return NextResponse.json({ success: true })
  } catch (e) {
    return toErrorResponse(e) ?? NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
