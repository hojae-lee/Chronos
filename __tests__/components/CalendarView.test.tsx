import { render, screen, waitFor } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import CalendarView from '@/components/calendar/CalendarView'

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

beforeEach(() => {
  vi.clearAllMocks()
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve([]),
  })
})

describe('CalendarView', () => {
  test('renders month/year header', async () => {
    render(<CalendarView />, { wrapper })
    await waitFor(() => {
      expect(document.querySelector('button[aria-label="이전"]')).not.toBeNull()
      expect(document.querySelector('button[aria-label="다음"]')).not.toBeNull()
    })
  })

  test('renders day-of-week headers', async () => {
    render(<CalendarView />, { wrapper })
    await waitFor(() => {
      expect(screen.getByText('일')).toBeDefined()
      expect(screen.getByText('월')).toBeDefined()
      expect(screen.getByText('토')).toBeDefined()
    })
  })

  test('fetches events on mount', async () => {
    render(<CalendarView />, { wrapper })
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/events')
      )
    })
  })
})
