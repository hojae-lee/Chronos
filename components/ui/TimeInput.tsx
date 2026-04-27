'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Clock } from 'lucide-react'

interface TimeInputProps {
  label?: string
  value: string       // 'HH:MM'
  onChange: (value: string) => void
  min?: string
  max?: string
}

const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2).toString().padStart(2, '0')
  const m = i % 2 === 0 ? '00' : '30'
  return `${h}:${m}`
})

export default function TimeInput({ label, value, onChange, min, max }: TimeInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({})
  const [mounted, setMounted] = useState(false)

  const triggerRef = useRef<HTMLDivElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const selectedRef = useRef<HTMLButtonElement>(null)

  useEffect(() => { setMounted(true) }, [])

  function open() {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (!rect) return

    const POPUP_H = 224
    const spaceBelow = window.innerHeight - rect.bottom - 8
    const top = spaceBelow >= POPUP_H ? rect.bottom + 8 : rect.top - POPUP_H - 8

    setPopupStyle({
      position: 'fixed',
      top,
      left: rect.left,
      width: rect.width,
      minWidth: 120,
      zIndex: 450,
    })
    setIsOpen(true)
  }

  function close() { setIsOpen(false) }

  useEffect(() => {
    if (!isOpen) return

    // 선택된 슬롯으로 스크롤
    setTimeout(() => {
      selectedRef.current?.scrollIntoView({ block: 'center', behavior: 'instant' })
    }, 0)

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

  function selectTime(slot: string) {
    onChange(slot)
    close()
  }

  const popup = (
    <div
      ref={popupRef}
      style={popupStyle}
      className="bg-background-surface border border-border-subtle rounded-xl shadow-xl overflow-hidden"
    >
      <div className="max-h-56 overflow-y-auto">
        {TIME_SLOTS.map((slot) => {
          const isSelected = slot === value
          const isDisabled = !!(min && slot < min) || !!(max && slot > max)

          return (
            <button
              key={slot}
              ref={isSelected ? selectedRef : undefined}
              type="button"
              disabled={isDisabled}
              onClick={() => { if (!isDisabled) selectTime(slot) }}
              className={[
                'w-full px-4 py-2 text-sm text-left transition-colors',
                isSelected
                  ? 'bg-brand-primary text-text-inverse font-medium'
                  : isDisabled
                  ? 'text-text-disabled opacity-40 cursor-not-allowed'
                  : 'text-text-primary hover:bg-background-elevated cursor-pointer',
              ].join(' ')}
            >
              {slot}
            </button>
          )
        })}
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
        <Clock size={14} className="text-brand-primary shrink-0" />
        <span className={['text-sm flex-1 font-medium', value ? 'text-text-primary' : 'text-text-disabled'].join(' ')}>
          {value || '시간 선택'}
        </span>
      </div>
      {mounted && isOpen && createPortal(popup, document.body)}
    </div>
  )
}
