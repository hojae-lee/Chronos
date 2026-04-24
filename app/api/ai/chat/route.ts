import { NextRequest, NextResponse } from 'next/server'
import { SINGLE_USER_ID } from '@/lib/auth'
import { runOrchestrator } from '@/lib/ai'
import { eventRepository } from '@/lib/event/event.repository'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { text, currentDate } = body

  if (!text?.trim()) {
    return NextResponse.json({ error: 'text is required' }, { status: 422 })
  }

  try {
    const allEvents = await eventRepository.findAllForContext(SINGLE_USER_ID)

    const response = await runOrchestrator(
      text,
      currentDate ?? new Date().toISOString().split('T')[0],
      allEvents.map(e => ({
        id: e.id,
        title: e.title,
        startAt: e.startAt.toISOString(),
        endAt: e.endAt?.toISOString() ?? null,
        isAllDay: e.isAllDay,
      }))
    )

    return NextResponse.json(response)
  } catch (e) {
    console.error('[ai/chat]', e)
    return NextResponse.json({ error: 'AI service error' }, { status: 500 })
  }
}
