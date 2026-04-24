import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import { buildParsePrompt } from '@/lib/prompts'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { text, referenceDate } = body

  if (!text || typeof text !== 'string' || text.trim() === '') {
    return NextResponse.json({ error: 'text is required' }, { status: 422 })
  }

  try {
    const prompt = buildParsePrompt(text.trim(), referenceDate)
    const completion = await openai.chat.completions.create({
      model: 'gpt-5.4-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
    })

    const content = completion.choices[0]?.message?.content ?? ''
    const parsed = JSON.parse(content)

    if (parsed.error === 'cannot_parse') {
      return NextResponse.json({ error: 'Cannot parse input' }, { status: 422 })
    }

    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json(
      { error: 'AI service error' },
      { status: 500 }
    )
  }
}
