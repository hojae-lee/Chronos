import { NextRequest, NextResponse } from 'next/server'
import { SINGLE_USER_ID } from '@/lib/auth'
import { runOrchestrator } from '@/lib/ai'
import { eventRepository } from '@/lib/event/event.repository'

const RETROSPECTIVE_PATTERNS = [
  /이번\s*달.*(어때|어떻|회고|보냈|정리|요약)/,
  /지난\s*달.*(어때|어떻|회고|보냈)/,
  /이번\s*달\s*일정.*(어때|어떻|어땠)/,
  /회고록/,
  /월간\s*회고/,
  /한\s*달.*(어때|어떻|어땠)/,
]

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { text, currentDate } = body

  if (!text?.trim()) {
    return NextResponse.json({ error: 'text is required' }, { status: 422 })
  }

  // Retrospective intent detection — route to a dedicated response before hitting the orchestrator
  if (RETROSPECTIVE_PATTERNS.some((p) => p.test(text))) {
    const ref = new Date(currentDate ?? new Date())
    return NextResponse.json({
      action: 'retrospective',
      year: ref.getFullYear(),
      month: ref.getMonth() + 1,
      message: '이번 달 회고록을 만들어드릴게요.',
    })
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
