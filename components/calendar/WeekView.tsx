'use client'

import { startOfWeek, endOfWeek, eachDayOfInterval, isToday, format } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { Event } from '@/hooks/useEvents'

interface WeekViewProps {
  currentDate: Date
  events: Event[]
  onEventClick: (event: Event) => void
}

export default function WeekView({ currentDate, events, onEventClick }: WeekViewProps) {
  const weekStart = startOfWeek(currentDate)
  const weekEnd = endOfWeek(currentDate)
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const hours = Array.from({ length: 24 }, (_, i) => i)

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        {/* Header */}
        <div className="grid grid-cols-8 sticky top-0 bg-background-base z-raised">
          <div className="h-12" />
          {days.map((day) => (
            <div
              key={day.toISOString()}
              className="h-12 flex flex-col items-center justify-center border-b border-border-subtle"
            >
              <span className="text-xs text-text-disabled">
                {format(day, 'E', { locale: ko })}
              </span>
              <span
                className={[
                  'text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full',
                  isToday(day) ? 'bg-brand-primary text-text-inverse' : 'text-text-primary',
                ].join(' ')}
              >
                {format(day, 'd')}
              </span>
            </div>
          ))}
        </div>

        {/* Time grid */}
        <div className="grid grid-cols-8">
          {/* Hours column */}
          <div>
            {hours.map((h) => (
              <div key={h} className="h-14 border-b border-border-subtle flex items-start pt-1 pr-2">
                <span className="text-xs text-text-disabled text-right w-full">
                  {h > 0 ? `${h}시` : ''}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day) => {
            const dayEvents = events.filter((e) => {
              const d = new Date(e.startAt)
              return d.toDateString() === day.toDateString()
            })

            return (
              <div key={day.toISOString()} className="relative border-l border-border-subtle">
                {hours.map((h) => (
                  <div key={h} className="h-14 border-b border-border-subtle" />
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
                        'absolute left-0.5 right-0.5 rounded-md px-1 py-0.5 text-xs',
                        'bg-event-work-subtle text-event-work truncate text-left',
                        e.status === 'cancelled' ? 'line-through opacity-50' : '',
                      ].join(' ')}
                      style={{ top: `${top}px`, height: `${height}px` }}
                    >
                      {e.title}
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
