'use client'

import { useState, useRef, useEffect } from 'react'
import { Wand2, ArrowUp, X, CalendarDays } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useCalendarAI } from '@/hooks/useCalendarAI'
import type { CalendarAICallbacks } from '@/hooks/useCalendarAI'
import type { Event } from '@/hooks/useEvents'
import { NL_PLACEHOLDERS } from '@/lib/constants/event'

type Props = CalendarAICallbacks


export default function NaturalLanguageInput(props: Props) {
  const [open, setOpen] = useState(true)
  const [text, setText] = useState('')
  const [placeholderIdx, setPlaceholderIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const id = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % NL_PLACEHOLDERS.length)
    }, 3000)
    return () => clearInterval(id)
  }, [])

  const { send, loading, resultMessage, resultEvents, clearMessage } = useCalendarAI(props)

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150)
  }, [open])

  function handleCollapse() {
    setOpen(false)
    setText('')
    clearMessage()
  }

  async function handleSend() {
    if (!text.trim() || loading) return
    const value = text
    setText('')
    await send(value)
  }

  return (
    <div className="fixed bottom-[76px] left-0 right-0 z-sticky px-4 pointer-events-none">
      <div className="max-w-2xl mx-auto pointer-events-auto">

        {/* Event list result card */}
        {resultEvents && resultEvents.length > 0 && (
          <div className="mb-2 bg-background-surface rounded-2xl shadow-lg border border-border-subtle overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between px-4 pt-3 pb-2">
              <p className="text-sm font-medium text-text-primary">{resultMessage}</p>
              <button onClick={clearMessage} className="text-text-disabled hover:text-text-secondary transition-colors">
                <X size={15} />
              </button>
            </div>
            <ul className="pb-2">
              {resultEvents.map((e) => {
                const dateLabel = format(new Date(e.startAt), 'M월 d일 (E)', { locale: ko })
                const timeLabel = e.isAllDay ? '종일' : format(new Date(e.startAt), 'HH:mm')
                return (
                  <li key={e.id}>
                    <button
                      onClick={() => {
                        props.onNavigateTo(new Date(e.startAt))
                        props.onOpenEvent(e.id)
                        clearMessage()
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-background-elevated transition-colors duration-150 text-left"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-brand-subtle shrink-0">
                        <CalendarDays size={15} className="text-brand-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={['text-sm font-medium text-text-primary truncate', e.status === 'cancelled' ? 'line-through opacity-50' : ''].join(' ')}>
                          {e.title}
                        </p>
                        <p className="text-xs text-text-disabled mt-0.5">{dateLabel} · {timeLabel}</p>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {/* Clarify message */}
        {resultMessage && !resultEvents && (
          <div className="mb-2 bg-background-surface rounded-2xl shadow-lg border border-border-subtle px-4 py-3 flex items-start justify-between gap-2 animate-fade-in">
            <p className="text-sm text-text-secondary">{resultMessage}</p>
            <button onClick={clearMessage} className="text-text-disabled hover:text-text-secondary transition-colors shrink-0 mt-0.5">
              <X size={15} />
            </button>
          </div>
        )}

        <div className="relative h-12">
          {/* Collapsed — icon only, anchored to right edge */}
          <button
            onClick={() => setOpen(true)}
            className={[
              'absolute right-0 top-0 flex items-center justify-center w-11 h-11 rounded-full bg-background-surface shadow-lg border border-border-subtle transition-all duration-300',
              open ? 'opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100',
            ].join(' ')}
            aria-label="일정 추가"
          >
            <Wand2 size={18} className="text-brand-primary" />
          </button>

          {/* Expanded — full pill */}
          <div className={[
            'absolute inset-0 flex items-center gap-3 px-4 bg-background-surface rounded-full shadow-lg border transition-all duration-300',
            loading ? 'border-brand-primary animate-glow-pulse' : 'border-border-subtle',
            open ? 'opacity-100' : 'opacity-0 pointer-events-none',
          ].join(' ')}>
            <Wand2 size={17} className={['shrink-0 transition-colors duration-300', loading ? 'text-brand-primary' : 'text-brand-primary opacity-60'].join(' ')} />

            {loading ? (
              <div className="flex-1 flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-brand-primary"
                    style={{ animation: `thinking-dot 1.2s ease-in-out ${i * 0.2}s infinite` }}
                  />
                ))}
                <span className="ml-2 text-xs text-text-disabled">AI가 처리 중이에요...</span>
              </div>
            ) : (
              <input
                ref={inputRef}
                type="text"
                autoComplete="off"
                value={text}
                onChange={(e) => { setText(e.target.value); clearMessage() }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend()
                  if (e.key === 'Escape') handleCollapse()
                }}
                placeholder={NL_PLACEHOLDERS[placeholderIdx]}
                className="flex-1 bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-disabled min-w-0"
              />
            )}

            {!loading && text.trim() ? (
              <button
                onClick={handleSend}
                className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-primary text-white hover:bg-brand-hover transition-colors duration-150 shrink-0"
              >
                <ArrowUp size={15} />
              </button>
            ) : !loading ? (
              <button onClick={handleCollapse} className="text-text-disabled hover:text-text-secondary shrink-0 transition-colors duration-150">
                <X size={16} />
              </button>
            ) : null}
          </div>
        </div>

      </div>
    </div>
  )
}
