'use client'

import { useRef } from 'react'
import { Clock } from 'lucide-react'

interface TimeInputProps {
  label?: string
  value: string       // 'HH:MM'
  onChange: (value: string) => void
  min?: string
  max?: string
}

export default function TimeInput({ label, value, onChange, min, max }: TimeInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function open() {
    const el = inputRef.current
    if (!el) return
    if (typeof el.showPicker === 'function') el.showPicker()
    else el.click()
  }

  return (
    <div className="w-full">
      {label && (
        <p className="text-xs font-medium text-text-disabled mb-1.5">{label}</p>
      )}
      <div
        className="relative flex items-center gap-2.5 px-3.5 py-3 bg-background-elevated rounded-xl border border-border-subtle cursor-pointer hover:border-brand-primary/50 transition-colors duration-150 select-none"
        onClick={open}
      >
        <Clock size={14} className="text-brand-primary shrink-0" />
        <span className={['text-sm flex-1 font-medium', value ? 'text-text-primary' : 'text-text-disabled'].join(' ')}>
          {value || '시간 선택'}
        </span>
        {/* Hidden native input — positioned over the div for click/touch */}
        <input
          ref={inputRef}
          type="time"
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          tabIndex={-1}
        />
      </div>
    </div>
  )
}
