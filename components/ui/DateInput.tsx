'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { toDateStr } from '@/lib/utils'

interface DateInputProps {
  label?: string
  value: string       // 'YYYY-MM-DD'
  onChange: (value: string) => void
  min?: string
  max?: string
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function buildCells(year: number, month: number) {
  const firstDow = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const cells: { date: Date; inMonth: boolean }[] = []

  for (let i = firstDow - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, daysInPrevMonth - i), inMonth: false })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), inMonth: true })
  }
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    cells.push({ date: new Date(year, month + 1, d), inMonth: false })
  }

  return cells
}

export default function DateInput({ label, value, onChange, min, max }: DateInputProps) {
  const today = toDateStr(new Date())

  const [isOpen, setIsOpen] = useState(false)
  const [viewYear, setViewYear] = useState(() =>
    value ? parseInt(value.slice(0, 4)) : new Date().getFullYear()
  )
  const [viewMonth, setViewMonth] = useState(() =>
    value ? parseInt(value.slice(5, 7)) - 1 : new Date().getMonth()
  )
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({})
  const [mounted, setMounted] = useState(false)

  const triggerRef = useRef<HTMLDivElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  const formatted = value
    ? format(new Date(value + 'T12:00:00'), 'M월 d일 (E)', { locale: ko })
    : '날짜 선택'

  function open() {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (!rect) return

    const POPUP_W = 288
    const POPUP_H = 320
    const left = Math.min(rect.left, window.innerWidth - POPUP_W - 16)
    const spaceBelow = window.innerHeight - rect.bottom - 8
    const top = spaceBelow >= POPUP_H ? rect.bottom + 8 : rect.top - POPUP_H - 8

    setPopupStyle({ position: 'fixed', top, left, zIndex: 450 })

    if (value) {
      setViewYear(parseInt(value.slice(0, 4)))
      setViewMonth(parseInt(value.slice(5, 7)) - 1)
    }
    setIsOpen(true)
  }

  function close() { setIsOpen(false) }

  useEffect(() => {
    if (!isOpen) return
    function onMouseDown(e: MouseEvent) {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        popupRef.current?.contains(e.target as Node)
      ) return
      close()
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen])

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  function selectDate(dateStr: string) {
    onChange(dateStr)
    close()
  }

  function goToday() {
    onChange(today)
    setViewYear(new Date().getFullYear())
    setViewMonth(new Date().getMonth())
    close()
  }

  const cells = buildCells(viewYear, viewMonth)

  const popup = (
    <div
      ref={popupRef}
      style={popupStyle}
      className="bg-background-surface border border-border-subtle rounded-2xl shadow-xl p-4 w-72"
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={prevMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-background-elevated text-text-secondary transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-semibold text-text-primary">
          {viewYear}년 {viewMonth + 1}월
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-background-elevated text-text-secondary transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="h-8 flex items-center justify-center text-xs text-text-disabled font-medium">
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 셀 */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map(({ date, inMonth }, i) => {
          const dateStr = toDateStr(date)
          const isSelected = dateStr === value
          const isToday = dateStr === today
          const isDisabled = !!(min && dateStr < min) || !!(max && dateStr > max)

          let cls = 'h-9 w-full flex items-center justify-center text-sm rounded-full transition-colors '

          if (isSelected) {
            cls += 'bg-brand-primary text-text-inverse font-semibold'
          } else if (isDisabled) {
            cls += 'text-text-disabled opacity-40 cursor-not-allowed'
          } else if (isToday) {
            cls += 'border-2 border-brand-primary text-brand-primary font-medium cursor-pointer hover:bg-brand-subtle'
          } else if (!inMonth) {
            cls += 'text-text-disabled opacity-30 cursor-pointer hover:bg-background-elevated'
          } else {
            cls += 'text-text-primary cursor-pointer hover:bg-background-elevated'
          }

          return (
            <button
              key={i}
              type="button"
              disabled={isDisabled}
              onClick={() => { if (!isDisabled) selectDate(dateStr) }}
              className={cls}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>

      {/* 푸터 */}
      <div className="mt-3 pt-3 border-t border-border-subtle flex justify-end">
        <button
          type="button"
          onClick={goToday}
          className="text-xs text-brand-primary font-medium hover:text-brand-hover transition-colors px-2 py-1 rounded-md hover:bg-brand-subtle"
        >
          오늘
        </button>
      </div>
    </div>
  )

  return (
    <div className="w-full">
      {label && (
        <p className="text-xs font-medium text-text-disabled mb-1.5">{label}</p>
      )}
      <div
        ref={triggerRef}
        className="relative flex items-center gap-2.5 px-3.5 py-3 bg-background-elevated rounded-xl border border-border-subtle cursor-pointer hover:border-brand-primary/50 transition-colors duration-150 select-none"
        onClick={open}
      >
        <Calendar size={14} className="text-brand-primary shrink-0" />
        <span className={['text-sm flex-1 font-medium', value ? 'text-text-primary' : 'text-text-disabled'].join(' ')}>
          {formatted}
        </span>
      </div>
      {mounted && isOpen && createPortal(popup, document.body)}
    </div>
  )
}
