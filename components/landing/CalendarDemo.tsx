'use client'

import { useEffect, useState } from 'react'

const DAYS = ['월', '화', '수', '목', '금', '토', '일']

// April 2026: April 1 = Wednesday (index 2 in Mon-Sun)
const START_DAY = 2
const TOTAL_DAYS = 30
const TODAY = 29

const EVENTS = [
  { date: 1,  title: '팀 스프린트',  color: '#2ECC8F' },
  { date: 5,  title: '독서 모임',    color: '#9B59B6' },
  { date: 7,  title: '헬스장',       color: '#E74C3C' },
  { date: 11, title: '점심 약속',    color: '#F39C12' },
  { date: 14, title: '코드 리뷰',    color: '#3498DB' },
  { date: 19, title: '생일 파티',    color: '#9B59B6' },
  { date: 22, title: '가족 나들이',  color: '#F39C12' },
  { date: 26, title: '병원 검진',    color: '#2ECC8F' },
  { date: 29, title: '월간 회고',    color: '#3498DB' },
]

export default function CalendarDemo() {
  const [step, setStep] = useState(0)
  const [adding, setAdding] = useState<number | null>(null)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    if (step < EVENTS.length) {
      setAdding(EVENTS[step].date)
      timer = setTimeout(() => {
        setAdding(null)
        setStep(s => s + 1)
      }, 500)
    } else {
      timer = setTimeout(() => setStep(0), 3000)
    }

    return () => clearTimeout(timer)
  }, [step])

  const cells: (number | null)[] = []
  for (let i = 0; i < START_DAY; i++) cells.push(null)
  for (let d = 1; d <= TOTAL_DAYS; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  const visibleDates = new Set(EVENTS.slice(0, step).map(e => e.date))
  const eventMap = new Map(EVENTS.map(e => [e.date, e]))

  return (
    <div className="bg-background-surface/90 backdrop-blur-sm rounded-2xl border border-border-default shadow-xl p-5 w-full max-w-sm select-none">
      {/* Window chrome */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <span className="text-brand-primary text-xs font-bold">✦</span>
          <span className="text-sm font-bold text-text-primary">4월 2026</span>
        </div>
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-0.5">
        {DAYS.map(day => (
          <div key={day} className="text-center text-[10px] font-semibold text-text-disabled py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {cells.map((date, idx) => {
          if (!date) return <div key={`e-${idx}`} className="h-9" />

          const event = eventMap.get(date)
          const isVisible = visibleDates.has(date)
          const isAdding = adding === date
          const isToday = date === TODAY

          return (
            <div key={date} className="relative flex flex-col items-center gap-0.5 py-0.5 rounded-md">
              {isAdding && (
                <div className="absolute inset-0 rounded-md bg-brand-primary/10 animate-pulse" />
              )}
              <span
                className={`relative z-10 w-6 h-6 flex items-center justify-center rounded-full text-[11px] font-medium transition-colors ${
                  isToday ? 'bg-brand-primary text-white font-bold' : 'text-text-primary'
                }`}
              >
                {date}
              </span>
              {event && (
                <div
                  className="relative z-10 w-4/5 h-[3px] rounded-full"
                  style={{
                    backgroundColor: event.color,
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'scaleX(1)' : 'scaleX(0)',
                    transition: 'opacity 0.2s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    transformOrigin: 'left',
                  }}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Upcoming events list */}
      <div className="mt-3 pt-3 border-t border-border-subtle space-y-1.5">
        {EVENTS.slice(0, 4).map((event, i) => (
          <div
            key={event.date}
            className="flex items-center gap-2"
            style={{
              opacity: step > i ? 1 : 0,
              transform: step > i ? 'translateX(0)' : 'translateX(-8px)',
              transition: 'opacity 0.3s ease, transform 0.3s ease',
            }}
          >
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: event.color }}
            />
            <span className="text-xs text-text-primary flex-1 truncate">{event.title}</span>
            <span className="text-[10px] text-text-disabled tabular-nums">{event.date}일</span>
          </div>
        ))}

        <div className="flex items-center gap-1.5 pt-0.5">
          <span className={`text-brand-primary text-[10px] ${step < EVENTS.length ? 'animate-pulse' : ''}`}>
            ✦
          </span>
          <span className="text-[11px] text-text-secondary">
            {step < EVENTS.length
              ? `AI가 일정 추가 중... (${step}/${EVENTS.length})`
              : `${EVENTS.length}개 일정 완료 ✓`}
          </span>
        </div>
      </div>
    </div>
  )
}
