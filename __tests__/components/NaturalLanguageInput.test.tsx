import { render, screen, fireEvent } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import NaturalLanguageInput from '@/app/calendar/_components/NaturalLanguageInput'

vi.mock('@/hooks/useCalendarAI', () => ({
  useCalendarAI: () => ({
    send: vi.fn().mockResolvedValue(null),
    loading: false,
  }),
}))

const defaultProps = {
  onNavigateTo: vi.fn(),
  onOpenEvent: vi.fn(),
  onToast: vi.fn(),
  onOpenRetrospective: vi.fn(),
}

describe('NaturalLanguageInput', () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(() => vi.restoreAllMocks())

  test('renders toggle button by default', () => {
    render(<NaturalLanguageInput {...defaultProps} />)
    expect(screen.getByLabelText('AI 어시스턴트')).toBeDefined()
  })

  test('opens chat card on toggle button click', () => {
    render(<NaturalLanguageInput {...defaultProps} />)
    fireEvent.click(screen.getByLabelText('AI 어시스턴트'))
    expect(screen.getByRole('textbox')).toBeDefined()
  })

  test('updates input value on change', () => {
    render(<NaturalLanguageInput {...defaultProps} />)
    fireEvent.click(screen.getByLabelText('AI 어시스턴트'))
    const input = screen.getByRole('textbox') as HTMLInputElement
    fireEvent.change(input, { target: { value: '치과 예약' } })
    expect(input.value).toBe('치과 예약')
  })
})
