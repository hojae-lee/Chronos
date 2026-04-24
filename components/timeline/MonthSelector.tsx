'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface MonthSelectorProps {
  year: number
  month: number
  onChange: (year: number, month: number) => void
}

export default function MonthSelector({ year, month, onChange }: MonthSelectorProps) {
  function prev() {
    if (month === 1) onChange(year - 1, 12)
    else onChange(year, month - 1)
  }

  function next() {
    if (month === 12) onChange(year + 1, 1)
    else onChange(year, month + 1)
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={prev}
        className="p-1 rounded-md hover:bg-background-elevated transition-colors duration-150"
        aria-label="이전 달"
      >
        <ChevronLeft size={20} className="text-text-secondary" />
      </button>
      <span className="text-base font-semibold text-text-primary min-w-[100px] text-center">
        {year}년 {month}월
      </span>
      <button
        onClick={next}
        className="p-1 rounded-md hover:bg-background-elevated transition-colors duration-150"
        aria-label="다음 달"
      >
        <ChevronRight size={20} className="text-text-secondary" />
      </button>
    </div>
  )
}
