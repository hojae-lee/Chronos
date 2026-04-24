import { format } from 'date-fns'
import type { Event } from '@/hooks/useEvents'
import { EVENT } from '@/lib/constants/event'

interface EventCardProps {
  event: Event
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

export default function EventCard({ event, onClick }: EventCardProps) {
  const isCancelled = event.status === 'cancelled'
  const timeLabel = !event.isAllDay
    ? format(new Date(event.startAt), 'HH:mm')
    : null

  return (
    <button
      onClick={onClick}
      className={[
        'w-full text-left rounded-md px-1.5 py-1 text-xs font-medium cursor-pointer',
        'flex items-center gap-1 min-w-0',
        isCancelled ? 'line-through opacity-50' : '',
      ].join(' ')}
      style={{ backgroundColor: event.color || EVENT.DEFAULT_COLOR, color: '#fff' }}
    >
      {timeLabel && (
        <span className="shrink-0 opacity-80">{timeLabel}</span>
      )}
      <span className="truncate">{event.title}</span>
    </button>
  )
}
