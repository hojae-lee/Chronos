'use client'

import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { Event } from '@/hooks/useEvents'
import { EVENT } from '@/lib/constants/event'

interface NoteCardProps {
  date: Date
  events: Event[]
}

export default function NoteCard({ date, events }: NoteCardProps) {
  const dateLabel = format(date, 'M월 d일 EEEE', { locale: ko })
  const isToday = new Date().toDateString() === date.toDateString()

  return (
    <div className="bg-background-surface rounded-2xl border border-border-subtle shadow-sm p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className={['text-sm font-bold', isToday ? 'text-brand-primary' : 'text-text-primary'].join(' ')}>
          {dateLabel}
        </span>
        {isToday && (
          <span className="text-xs font-medium text-brand-primary bg-brand-subtle px-1.5 py-0.5 rounded-full">
            오늘
          </span>
        )}
      </div>

      <ul className="space-y-1.5">
        {events.map((e) => {
          const timeLabel = e.isAllDay ? '종일' : format(new Date(e.startAt), 'HH:mm')
          return (
            <li key={e.id} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: e.color || EVENT.DEFAULT_COLOR }} />
              <span className="text-xs text-text-disabled w-8 shrink-0">{timeLabel}</span>
              <span className={['text-sm text-text-primary truncate', e.status === 'cancelled' ? 'line-through opacity-50' : ''].join(' ')}>
                {e.title}
              </span>
              {e.location && (
                <span className="text-xs text-text-disabled truncate hidden sm:block">· {e.location}</span>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
