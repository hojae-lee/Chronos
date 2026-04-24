import { Clock, MapPin, Share2, Link } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { formatDateRange } from '@/lib/utils'

interface SharedEvent {
  title: string
  description?: string | null
  startAt: string
  endAt?: string | null
  isAllDay: boolean
  location?: string | null
}

interface SharedEventViewProps {
  event: SharedEvent | null
  loading?: boolean
}

export default function SharedEventView({ event, loading }: SharedEventViewProps) {
  if (loading) {
    return (
      <div className="bg-background-surface rounded-xl shadow-lg p-6 w-full">
        <div className="h-6 bg-background-elevated rounded-sm animate-pulse mb-4" />
        <div className="h-4 bg-background-elevated rounded-sm animate-pulse mb-2" />
        <div className="h-4 w-3/4 bg-background-elevated rounded-sm animate-pulse mb-2" />
        <div className="h-4 w-1/2 bg-background-elevated rounded-sm animate-pulse" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="bg-background-surface rounded-xl shadow-lg p-6 w-full flex flex-col items-center text-center gap-3">
        <Link size={48} className="text-text-disabled" />
        <p className="text-base font-semibold text-text-secondary">잘못된 링크예요</p>
        <p className="text-sm text-text-disabled">링크를 다시 확인해주세요.</p>
      </div>
    )
  }

  return (
    <div className="bg-background-surface rounded-xl shadow-lg p-6 w-full">
      <Badge variant="info" className="mb-3">
        <Share2 size={12} className="mr-1" />
        공유된 일정
      </Badge>
      <h1 className="text-2xl font-bold text-text-primary mt-3">{event.title}</h1>
      <div className="flex items-center gap-1.5 text-base text-text-secondary mt-3">
        <Clock size={16} className="text-text-disabled" />
        {formatDateRange(event.startAt, event.endAt, event.isAllDay)}
      </div>
      {event.location && (
        <div className="flex items-center gap-1.5 text-base text-text-secondary mt-2">
          <MapPin size={16} className="text-text-disabled" />
          {event.location}
        </div>
      )}
      {event.description && (
        <p className="text-sm text-text-secondary leading-relaxed border-t border-border-subtle pt-4 mt-4">
          {event.description}
        </p>
      )}
    </div>
  )
}
