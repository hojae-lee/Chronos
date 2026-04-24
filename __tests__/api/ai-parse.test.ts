import { describe, test, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/openai', () => ({
  openai: {
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  },
}))

import { openai } from '@/lib/openai'

describe('POST /api/ai/parse', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('parses Korean natural language into structured event', async () => {
    vi.mocked(openai.chat.completions.create).mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              title: '치과',
              startAt: '2025-04-15T14:00:00Z',
              endAt: null,
              isAllDay: false,
              location: null,
              confidence: 0.9,
            }),
          },
        },
      ],
    } as unknown as Awaited<ReturnType<typeof openai.chat.completions.create>>)

    const { POST } = await import('@/app/api/ai/parse/route')
    const req = new Request('http://localhost/api/ai/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '다음 주 화요일 오후 2시 치과' }),
    })
    const res = await POST(req as unknown as import("next/server").NextRequest)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.title).toBe('치과')
    expect(body.isAllDay).toBe(false)
  })

  test('returns isAllDay true when no time specified', async () => {
    vi.mocked(openai.chat.completions.create).mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              title: '생일',
              startAt: '2025-04-20T00:00:00Z',
              endAt: null,
              isAllDay: true,
              location: null,
              confidence: 0.85,
            }),
          },
        },
      ],
    } as unknown as Awaited<ReturnType<typeof openai.chat.completions.create>>)

    const { POST } = await import('@/app/api/ai/parse/route')
    const req = new Request('http://localhost/api/ai/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '다음 주 친구 생일' }),
    })
    const res = await POST(req as unknown as import("next/server").NextRequest)
    const body = await res.json()
    expect(body.isAllDay).toBe(true)
  })

  test('returns 422 for empty text', async () => {
    const { POST } = await import('@/app/api/ai/parse/route')
    const req = new Request('http://localhost/api/ai/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '' }),
    })
    const res = await POST(req as unknown as import("next/server").NextRequest)
    expect(res.status).toBe(422)
  })

  test('returns 500 on OpenAI API error', async () => {
    vi.mocked(openai.chat.completions.create).mockRejectedValue(
      new Error('API Error')
    )

    const { POST } = await import('@/app/api/ai/parse/route')
    const req = new Request('http://localhost/api/ai/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '치과' }),
    })
    const res = await POST(req as unknown as import("next/server").NextRequest)
    expect(res.status).toBe(500)
  })
})
