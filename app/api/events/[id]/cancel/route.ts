import { NextRequest, NextResponse } from 'next/server'
import { eventService } from '@/lib/event/event.service'
import { toErrorResponse } from '@/lib/errors'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(_req: NextRequest, { params }: Params) {
  const { id } = await params
  try {
    const event = await eventService.cancel(Number(id))
    return NextResponse.json(event)
  } catch (e) {
    return toErrorResponse(e) ?? NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
