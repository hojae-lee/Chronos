import { describe, test, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/auth', () => ({
  SINGLE_USER_ID: 1,
}))

vi.mock('@/lib/db', () => ({
  db: {
    event: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}))

vi.mock('nanoid', () => ({ nanoid: () => 'mock-token-123' }))

import { db } from '@/lib/db'

const mockEvent = {
  id: 1,
  userId: 1,
  title: 'Test Event',
  description: 'Test description',
  startAt: new Date('2025-04-15T09:00:00Z'),
  endAt: new Date('2025-04-15T10:00:00Z'),
  isAllDay: false,
  location: '서울',
  status: 'active',
  shareToken: null,
}

describe('POST /api/events/[id]/share', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('creates share token for event', async () => {
    vi.mocked(db.event.findUnique).mockResolvedValue(mockEvent as never)
    vi.mocked(db.event.update).mockResolvedValue({
      ...mockEvent,
      shareToken: 'mock-token-123',
    } as never)

    const { POST } = await import('@/app/api/events/[id]/share/route')
    const req = new Request('http://localhost/api/events/1/share', {
      method: 'POST',
    })
    const res = await POST(req as unknown as import("next/server").NextRequest, { params: Promise.resolve({ id: '1' }) })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.shareToken).toBe('mock-token-123')
    expect(body.shareUrl).toContain('mock-token-123')
  })

  test('returns existing token if already shared', async () => {
    vi.mocked(db.event.findUnique).mockResolvedValue({
      ...mockEvent,
      shareToken: 'existing-token',
    } as never)

    const { POST } = await import('@/app/api/events/[id]/share/route')
    const req = new Request('http://localhost/api/events/1/share', {
      method: 'POST',
    })
    const res = await POST(req as unknown as import("next/server").NextRequest, { params: Promise.resolve({ id: '1' }) })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.shareToken).toBe('existing-token')
    expect(vi.mocked(db.event.update)).not.toHaveBeenCalled()
  })
})

describe('GET /api/share/[token]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('returns shared event without sensitive fields', async () => {
    vi.mocked(db.event.findFirst).mockResolvedValue(mockEvent as never)

    const { GET } = await import('@/app/api/share/[token]/route')
    const req = new Request('http://localhost/api/share/abc123')
    const res = await GET(req as unknown as import("next/server").NextRequest, { params: Promise.resolve({ token: 'abc123' }) })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.title).toBe('Test Event')
    expect(body.userId).toBeUndefined()
    expect(body.shareToken).toBeUndefined()
  })

  test('returns 404 for invalid token', async () => {
    vi.mocked(db.event.findFirst).mockResolvedValue(null)

    const { GET } = await import('@/app/api/share/[token]/route')
    const req = new Request('http://localhost/api/share/invalid')
    const res = await GET(req as unknown as import("next/server").NextRequest, {
      params: Promise.resolve({ token: 'invalid' }),
    })
    expect(res.status).toBe(404)
  })
})
