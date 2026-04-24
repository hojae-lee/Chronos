import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import { buildTimelineNotePrompt } from '@/lib/prompts'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { date, events } = body

  if (!date || !events?.length) {
    return NextResponse.json({ error: 'date and events are required' }, { status: 422 })
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-5.4-mini',
      messages: [{ role: 'user', content: buildTimelineNotePrompt(date, events) }],
      temperature: 0.8,
      max_tokens: 100,
    })

    const note = completion.choices[0].message.content?.trim() ?? ''
    return NextResponse.json({ note })
  } catch (e) {
    console.error('[ai/timeline-note]', e)
    return NextResponse.json({ error: 'AI error' }, { status: 500 })
  }
}
