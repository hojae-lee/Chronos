import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import { buildRetrospectivePrompt } from '@/lib/prompts'
import { SINGLE_USER_ID } from '@/lib/auth'
import { eventRepository } from '@/lib/event/event.repository'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { year, month } = body

  if (!year || !month || month < 1 || month > 12) {
    return NextResponse.json(
      { error: 'valid year and month (1-12) are required' },
      { status: 422 }
    )
  }

  const userId = SINGLE_USER_ID
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59, 999)

  const events = await eventRepository.findActiveByMonth(userId, startDate, endDate)

  let content: string
  let summaryObj: {
    categoryBreakdown: Array<{ category: string; percentage: number }>
    highlights: string[]
    totalEvents: number
  }

  if (events.length === 0) {
    content = '이번 달은 기록된 일정이 없어요. 다음 달엔 더 많은 추억을 만들어봐요!'
    summaryObj = { categoryBreakdown: [], highlights: [], totalEvents: 0 }
  } else {
    try {
      const prompt = buildRetrospectivePrompt(
        year,
        month,
        events.map((e) => ({
          title: e.title,
          startAt: e.startAt.toISOString(),
          description: e.description,
        }))
      )

      const completion = await openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      })

      const raw = completion.choices[0]?.message?.content ?? ''
      const jsonMatch = raw.match(/---JSON---\s*([\s\S]*?)\s*---END---/)
      const mainText = raw.replace(/---JSON---[\s\S]*?---END---/, '').trim()

      content = mainText || raw
      if (jsonMatch) {
        summaryObj = JSON.parse(jsonMatch[1])
      } else {
        summaryObj = {
          categoryBreakdown: [{ category: '기타', percentage: 100 }],
          highlights: events.slice(0, 3).map((e) => e.title),
          totalEvents: events.length,
        }
      }
    } catch {
      return NextResponse.json({ error: 'AI service error' }, { status: 500 })
    }
  }

  await eventRepository.upsertRetrospective(userId, year, month, content, JSON.stringify(summaryObj))

  return NextResponse.json({ content, summary: summaryObj })
}
