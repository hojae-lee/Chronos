import { render, screen, fireEvent } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import NaturalLanguageInput from '@/app/calendar/_components/NaturalLanguageInput'

vi.mock('@/hooks/useCalendarAI', () => ({
  useCalendarAI: () => ({
    send: vi.fn(),
    loading: false,
    resultMessage: null,
    resultEvents: null,
    clearMessage: vi.fn(),
  }),
}))

const defaultProps = {
  onNavigateTo: vi.fn(),
  onOpenEvent: vi.fn(),
  onToast: vi.fn(),
}

describe('NaturalLanguageInput', () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(() => vi.restoreAllMocks())

  test('renders text input when expanded', () => {
    render(<NaturalLanguageInput {...defaultProps} />)
    expect(screen.getByRole('textbox')).toBeDefined()
  })

  test('updates input value on change', () => {
    render(<NaturalLanguageInput {...defaultProps} />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    fireEvent.change(input, { target: { value: '치과 예약' } })
    expect(input.value).toBe('치과 예약')
  })

  test('clears input on Escape key', () => {
    render(<NaturalLanguageInput {...defaultProps} />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    fireEvent.change(input, { target: { value: '치과' } })
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(input.value).toBe('')
  })
})
