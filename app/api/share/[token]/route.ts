import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

type Params = { params: Promise<{ token: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { token } = await params

  const event = await db.event.findFirst({
    where: { shareToken: token },
  })

  if (!event) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Return only non-sensitive fields
  return NextResponse.json({
    title: event.title,
    description: event.description,
    startAt: event.startAt,
    endAt: event.endAt,
    isAllDay: event.isAllDay,
    location: event.location,
  })
}
