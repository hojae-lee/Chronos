'use client'

import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { MapPin, Clock } from 'lucide-react'
import type { Event } from '@/hooks/useEvents'
import { EVENT } from '@/lib/constants/event'

interface NoteCardProps {
  event: Event
}

export default function NoteCard({ event }: NoteCardProps) {
  const timeLabel = event.isAllDay ? '종일' : format(new Date(event.startAt), 'a h:mm', { locale: ko })
  const endLabel = event.endAt && !event.isAllDay ? format(new Date(event.endAt), '~ a h:mm', { locale: ko }) : null
  const isCancelled = event.status === 'cancelled'
  const color = event.color || EVENT.DEFAULT_COLOR

  return (
    <div className={['bg-background-surface rounded-2xl border border-border-subtle shadow-sm overflow-hidden', isCancelled ? 'opacity-50' : ''].join(' ')}>
      <div className="h-1 w-full" style={{ backgroundColor: color }} />
      <div className="p-4 space-y-2">
        <span className={['text-base font-semibold text-text-primary leading-snug', isCancelled ? 'line-through' : ''].join(' ')}>
          {event.title}
        </span>

        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <div className="flex items-center gap-1 text-xs text-text-secondary">
            <Clock size={12} className="shrink-0" />
            <span>{timeLabel}{endLabel ? ` ${endLabel}` : ''}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-1 text-xs text-text-secondary">
              <MapPin size={12} className="shrink-0" />
              <span className="truncate max-w-[160px]">{event.location}</span>
            </div>
          )}
        </div>

        {event.description && (
          <p className="text-xs text-text-disabled line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        )}
      </div>
    </div>
  )
}
