'use client'

import { format, isToday } from 'date-fns'
import { ko } from 'date-fns/locale'
import { CalendarDays } from 'lucide-react'
import type { Event } from '@/hooks/useEvents'
import Button from '@/components/ui/Button'

interface DayViewProps {
  currentDate: Date
  events: Event[]
  onEventClick: (event: Event) => void
  onAddEvent: () => void
}

export default function DayView({ currentDate, events, onEventClick, onAddEvent }: DayViewProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const dayEvents = events.filter((e) => {
    const d = new Date(e.startAt)
    return d.toDateString() === currentDate.toDateString()
  })

  if (dayEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center gap-3">
        <CalendarDays size={40} className="text-text-disabled" />
        <p className="text-base font-semibold text-text-secondary">
          오늘은 아직 일정이 없어요
        </p>
        <p className="text-sm text-text-disabled max-w-[240px]">
          하단 입력창에서 일정을 추가해보세요
        </p>
        <Button variant="primary" size="sm" onClick={onAddEvent} className="mt-2">
          일정 추가하기
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="px-4 py-2 text-sm font-semibold text-text-primary">
        {format(currentDate, 'M월 d일 (E)', { locale: ko })}
        {isToday(currentDate) && (
          <span className="ml-2 text-xs text-brand-primary">오늘</span>
        )}
      </div>
      <div className="relative">
        {hours.map((h) => (
          <div key={h} className="h-14 border-b border-border-subtle flex">
            <span className="text-xs text-text-disabled w-12 pt-1 px-2">
              {h > 0 ? `${h}시` : ''}
            </span>
          </div>
        ))}
        {dayEvents.map((e) => {
          const start = new Date(e.startAt)
          const top = (start.getHours() + start.getMinutes() / 60) * 56
          const end = e.endAt ? new Date(e.endAt) : new Date(start.getTime() + 3600000)
          const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
          const height = Math.max(duration * 56, 28)

          return (
            <button
              key={e.id}
              onClick={() => onEventClick(e)}
              className={[
                'absolute left-14 right-2 rounded-md px-2 py-1 text-sm text-left',
                'bg-event-work-subtle text-event-work border-l-2 border-event-work',
                e.status === 'cancelled' ? 'line-through opacity-50' : '',
              ].join(' ')}
              style={{ top: `${top}px`, height: `${height}px` }}
            >
              <span className="font-medium truncate block">{e.title}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
