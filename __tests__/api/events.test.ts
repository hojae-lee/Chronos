import { describe, test, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/auth', () => ({
  SINGLE_USER_ID: 1,
}))

vi.mock('@/lib/db', () => ({
  db: {
    event: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

import { db } from '@/lib/db'

const mockEvent = {
  id: 1,
  userId: 1,
  title: 'Test Event',
  description: null,
  startAt: new Date('2025-04-01T09:00:00Z'),
  endAt: new Date('2025-04-01T10:00:00Z'),
  isAllDay: false,
  location: null,
  status: 'active',
  color: '#2ECC8F',
  shareToken: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  photos: [],
}

describe('GET /api/events', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('returns event list with valid date range', async () => {
    vi.mocked(db.event.findMany).mockResolvedValue([mockEvent])

    const { GET } = await import('@/app/api/events/route')
    const req = new Request(
      'http://localhost/api/events?start=2025-04-01&end=2025-04-30'
    )
    const res = await GET(req as unknown as import("next/server").NextRequest)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveLength(1)
    expect(body[0].title).toBe('Test Event')
  })

  test('returns 422 when start/end params missing', async () => {
    const { GET } = await import('@/app/api/events/route')
    const req = new Request('http://localhost/api/events')
    const res = await GET(req as unknown as import("next/server").NextRequest)
    expect(res.status).toBe(422)
  })
})

describe('POST /api/events', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('creates event with valid data', async () => {
    vi.mocked(db.event.create).mockResolvedValue(mockEvent)

    const { POST } = await import('@/app/api/events/route')
    const req = new Request('http://localhost/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test Event',
        startAt: '2025-04-01T09:00:00Z',
      }),
    })
    const res = await POST(req as unknown as import("next/server").NextRequest)
    expect(res.status).toBe(201)
  })

  test('returns 422 when title is missing', async () => {
    const { POST } = await import('@/app/api/events/route')
    const req = new Request('http://localhost/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startAt: '2025-04-01T09:00:00Z' }),
    })
    const res = await POST(req as unknown as import("next/server").NextRequest)
    expect(res.status).toBe(422)
  })
})
