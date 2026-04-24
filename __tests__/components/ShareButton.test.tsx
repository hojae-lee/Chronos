import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import ShareButton from '@/components/share/ShareButton'

describe('ShareButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  test('renders share button', () => {
    render(<ShareButton eventId={1} />)
    expect(screen.getByRole('button', { name: /공유/i })).toBeDefined()
  })

  test('calls share API on click', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          shareToken: 'abc123',
          shareUrl: 'http://localhost:3000/share/abc123',
        }),
    })
    global.fetch = mockFetch

    render(<ShareButton eventId={1} />)
    fireEvent.click(screen.getByRole('button', { name: /공유/i }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/events/1/share', {
        method: 'POST',
      })
    })
  })

  test('copies link to clipboard after share', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          shareToken: 'abc123',
          shareUrl: 'http://localhost:3000/share/abc123',
        }),
    })
    global.fetch = mockFetch

    render(<ShareButton eventId={1} />)
    fireEvent.click(screen.getByRole('button', { name: /공유/i }))

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        'http://localhost:3000/share/abc123'
      )
    })
  })
})
