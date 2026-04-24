import { describe, test, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/auth', () => ({
  SINGLE_USER_ID: 1,
}))

vi.mock('@/lib/db', () => ({
  db: {
    event: { findMany: vi.fn() },
    retrospective: { upsert: vi.fn() },
  },
}))

vi.mock('@/lib/openai', () => ({
  openai: { chat: { completions: { create: vi.fn() } } },
}))

import { db } from '@/lib/db'
import { openai } from '@/lib/openai'

describe('POST /api/ai/retrospective', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('generates retrospective for valid year/month', async () => {
    vi.mocked(db.event.findMany).mockResolvedValue([
      {
        id: 1,
        title: '클라이언트 미팅',
        startAt: new Date('2025-03-10T09:00:00Z'),
        description: null,
      },
    ] as never)
    vi.mocked(openai.chat.completions.create).mockResolvedValue({
      choices: [
        {
          message: {
            content: `이번 달은 활발한 한 달이었어요.
---JSON---
{"categoryBreakdown":[{"category":"업무","percentage":100}],"highlights":["클라이언트 미팅"],"totalEvents":1}
---END---`,
          },
        },
      ],
    } as unknown as Awaited<ReturnType<typeof openai.chat.completions.create>>)
    vi.mocked(db.retrospective.upsert).mockResolvedValue({} as never)

    const { POST } = await import('@/app/api/ai/retrospective/route')
    const req = new Request('http://localhost/api/ai/retrospective', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year: 2025, month: 3 }),
    })
    const res = await POST(req as unknown as import("next/server").NextRequest)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.content).toBeTruthy()
    expect(body.summary.totalEvents).toBe(1)
  })

  test('returns empty message when no events this month', async () => {
    vi.mocked(db.event.findMany).mockResolvedValue([])
    vi.mocked(db.retrospective.upsert).mockResolvedValue({} as never)

    const { POST } = await import('@/app/api/ai/retrospective/route')
    const req = new Request('http://localhost/api/ai/retrospective', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year: 2025, month: 1 }),
    })
    const res = await POST(req as unknown as import("next/server").NextRequest)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.content).toContain('없어요')
  })

  test('returns 422 when invalid month', async () => {
    const { POST } = await import('@/app/api/ai/retrospective/route')
    const req = new Request('http://localhost/api/ai/retrospective', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year: 2025, month: 13 }),
    })
    const res = await POST(req as unknown as import("next/server").NextRequest)
    expect(res.status).toBe(422)
  })
})
