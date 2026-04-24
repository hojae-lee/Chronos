import { NextRequest, NextResponse } from 'next/server'
import { eventService } from '@/lib/event/event.service'
import { toErrorResponse } from '@/lib/errors'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const start = searchParams.get('start')
  const end = searchParams.get('end')

  if (!start || !end) {
    return NextResponse.json(
      { error: 'start and end query params are required' },
      { status: 422 }
    )
  }

  const events = await eventService.list(start, end)
  return NextResponse.json(events)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { title, description, startAt, endAt, isAllDay, location, color } = body

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return NextResponse.json({ error: 'title is required' }, { status: 422 })
  }
  if (!startAt) {
    return NextResponse.json({ error: 'startAt is required' }, { status: 422 })
  }

  try {
    const event = await eventService.create({ title, description, startAt, endAt, isAllDay, location, color })
    return NextResponse.json(event, { status: 201 })
  } catch (e) {
    return toErrorResponse(e) ?? NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
