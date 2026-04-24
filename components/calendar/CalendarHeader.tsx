'use client'

import { useState, type ReactNode } from 'react'
import { format } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ko } from 'date-fns/locale'
import { addMonths, subMonths } from 'date-fns'

const MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']

interface CalendarHeaderProps {
  currentDate: Date
  onChange: (date: Date) => void
  rightAction?: ReactNode
}

export default function CalendarHeader({ currentDate, onChange, rightAction }: CalendarHeaderProps) {
  const [showPicker, setShowPicker] = useState(false)
  const [pickerYear, setPickerYear] = useState(currentDate.getFullYear())

  function navigate(direction: 'prev' | 'next') {
    onChange(direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1))
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={() => navigate('prev')}
          className="p-2 rounded-md hover:bg-background-elevated transition-colors duration-150"
          aria-label="이전"
        >
          <ChevronLeft size={20} className="text-text-secondary" />
        </button>

        <button
          onClick={() => { setPickerYear(currentDate.getFullYear()); setShowPicker(v => !v) }}
          className={['text-xl font-semibold transition-colors duration-150', showPicker ? 'text-brand-primary' : 'text-text-primary hover:text-brand-primary'].join(' ')}
        >
          {format(currentDate, 'yyyy년 M월', { locale: ko })}
        </button>

        <div className="flex items-center gap-2">
          {rightAction}
          <button
            onClick={() => navigate('next')}
            className="p-2 rounded-md hover:bg-background-elevated transition-colors duration-150"
            aria-label="다음"
          >
            <ChevronRight size={20} className="text-text-secondary" />
          </button>
        </div>
      </div>

      {showPicker && (
        <>
          <div className="fixed inset-0 z-dropdown" onClick={() => setShowPicker(false)} />
          <div className="absolute top-[52px] left-1/2 -translate-x-1/2 z-dropdown w-64 bg-background-surface rounded-2xl shadow-xl border border-border-subtle p-4">
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => setPickerYear(y => y - 1)} className="p-1.5 rounded-md hover:bg-background-elevated">
                <ChevronLeft size={16} className="text-text-secondary" />
              </button>
              <span className="text-base font-bold text-text-primary">{pickerYear}년</span>
              <button onClick={() => setPickerYear(y => y + 1)} className="p-1.5 rounded-md hover:bg-background-elevated">
                <ChevronRight size={16} className="text-text-secondary" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {MONTHS.map((m, i) => {
                const isSelected = pickerYear === currentDate.getFullYear() && i === currentDate.getMonth()
                return (
                  <button
                    key={m}
                    onClick={() => { onChange(new Date(pickerYear, i, 1)); setShowPicker(false) }}
                    className={['py-2 rounded-xl text-sm font-medium transition-colors duration-150', isSelected ? 'bg-brand-primary text-white' : 'hover:bg-background-elevated text-text-primary'].join(' ')}
                  >
                    {m}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
