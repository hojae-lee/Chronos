'use client'

import { format, isToday, isSameDay } from 'date-fns'
import { ko } from 'date-fns/locale'
import { X, Plus, Clock, List } from 'lucide-react'
import type { Event } from '@/hooks/useEvents'
import { EVENT } from '@/lib/constants/event'

function toDay(d: Date | string): Date {
  const date = new Date(d)
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

interface DayPanelProps {
  date: Date
  events: Event[]
  viewMode: 'list' | 'day'
  onViewModeChange: (mode: 'list' | 'day') => void
  onEventClick: (event: Event) => void
  onAddEvent: () => void
  onClose: () => void
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)

export default function DayPanel({
  date,
  events,
  viewMode,
  onViewModeChange,
  onEventClick,
  onAddEvent,
  onClose,
}: DayPanelProps) {
  const dayEvents = events.filter((e) => {
    const start = toDay(e.startAt)
    const end = e.endAt ? toDay(e.endAt) : start
    const target = toDay(date)
    return start <= target && target <= end
  })

  const today = isToday(date)
  const dateLabel = format(date, 'M월 d일 (E)', { locale: ko })

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-panel-backdrop bg-black/30 animate-fade-in" />

      {/* Panel */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl z-panel bg-background-surface rounded-t-2xl shadow-2xl border-t border-border-subtle flex flex-col animate-slide-up" style={{ top: '8px' }}>
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-border-default" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-text-primary">{dateLabel}</span>
            {today && (
              <span className="text-xs font-medium text-brand-primary bg-brand-subtle px-1.5 py-0.5 rounded-full">
                오늘
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {/* View mode toggle */}
            <button
              onClick={() => onViewModeChange(viewMode === 'list' ? 'day' : 'list')}
              className={[
                'p-2 rounded-lg transition-colors duration-150',
                viewMode === 'day' ? 'bg-brand-subtle text-brand-primary' : 'text-text-disabled hover:text-text-secondary',
              ].join(' ')}
              aria-label={viewMode === 'list' ? '시간대 보기' : '목록 보기'}
              title={viewMode === 'list' ? '시간대 보기' : '목록 보기'}
            >
              {viewMode === 'list' ? <Clock size={18} /> : <List size={18} />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-text-disabled hover:text-text-secondary transition-colors duration-150"
              aria-label="닫기"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {viewMode === 'list' ? (
            <ListContent
              events={dayEvents}
              onEventClick={onEventClick}
            />
          ) : (
            <HourlyContent
              events={dayEvents}
              onEventClick={onEventClick}
            />
          )}
        </div>

        {/* Add event button (list mode only) */}
        {viewMode === 'list' && (
          <div className="px-4 py-3 shrink-0 border-t border-border-subtle">
            <button
              onClick={onAddEvent}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-medium hover:bg-brand-hover transition-colors duration-150"
            >
              <Plus size={16} />
              일정 추가하기
            </button>
          </div>
        )}
      </div>
    </>
  )
}

function ListContent({
  events,
  onEventClick,
}: {
  events: Event[]
  onEventClick: (e: Event) => void
}) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
        <p className="text-sm text-text-disabled">이날은 일정이 없어요</p>
      </div>
    )
  }

  return (
    <ul className="px-4 py-2 space-y-2">
      {events.map((e) => {
        const cancelled = e.status === 'cancelled'
        const isSpanning = e.endAt && !isSameDay(new Date(e.startAt), new Date(e.endAt))
        const startTime = !e.isAllDay ? format(new Date(e.startAt), 'HH:mm') : null
        const endTime = !e.isAllDay && e.endAt ? format(new Date(e.endAt), 'HH:mm') : null

        let timeLabel: string
        if (isSpanning) {
          const s = format(new Date(e.startAt), 'M월 d일', { locale: ko })
          const en = format(new Date(e.endAt!), 'M월 d일', { locale: ko })
          timeLabel = e.isAllDay
            ? `${s} ~ ${en}`
            : `${s} ${startTime} ~ ${en} ${endTime}`
        } else if (e.isAllDay) {
          timeLabel = '종일'
        } else {
          timeLabel = `${startTime}${endTime ? ` ~ ${endTime}` : ''}`
        }

        return (
          <li key={e.id}>
            <button
              onClick={() => onEventClick(e)}
              className={[
                'w-full text-left flex items-start gap-3 px-3 py-3 rounded-xl',
                'bg-background-elevated hover:bg-background-base transition-colors duration-150',
                cancelled ? 'opacity-50' : '',
              ].join(' ')}
            >
              <div className="w-1 self-stretch rounded-full shrink-0 mt-0.5" style={{ backgroundColor: e.color || EVENT.DEFAULT_COLOR }} />
              <div className="flex-1 min-w-0">
                <p className={['text-sm font-medium text-text-primary truncate', cancelled ? 'line-through' : ''].join(' ')}>
                  {e.title}
                </p>
                <p className="text-xs text-text-disabled mt-0.5">{timeLabel}</p>
                {e.location && (
                  <p className="text-xs text-text-disabled mt-0.5 truncate">{e.location}</p>
                )}
              </div>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

function layoutEvents(events: Event[]) {
  const sorted = [...events].sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
  )
  const cols: { event: Event; endMs: number }[][] = []
  const placed: { event: Event; col: number }[] = []

  for (const e of sorted) {
    const startMs = new Date(e.startAt).getTime()
    const endMs = e.endAt
      ? new Date(e.endAt).getTime()
      : e.isAllDay
      ? startMs + 86400000
      : startMs + 3600000

    let col = 0
    while (cols[col]?.some(({ endMs: end }) => startMs < end)) col++
    if (!cols[col]) cols[col] = []
    cols[col].push({ event: e, endMs })
    placed.push({ event: e, col })
  }

  return placed.map(({ event, col }) => {
    const startMs = new Date(event.startAt).getTime()
    const endMs = event.endAt
      ? new Date(event.endAt).getTime()
      : event.isAllDay
      ? startMs + 86400000
      : startMs + 3600000

    let totalCols = col + 1
    for (const other of placed) {
      if (other.event.id === event.id) continue
      const oStart = new Date(other.event.startAt).getTime()
      const oEnd = other.event.endAt
        ? new Date(other.event.endAt).getTime()
        : other.event.isAllDay
        ? oStart + 86400000
        : oStart + 3600000
      if (startMs < oEnd && endMs > oStart) totalCols = Math.max(totalCols, other.col + 1)
    }

    return { event, col, totalCols }
  })
}

function HourlyContent({
  events,
  onEventClick,
}: {
  events: Event[]
  onEventClick: (e: Event) => void
}) {
  const laid = layoutEvents(events)

  return (
    <div className="relative overflow-hidden">
      {HOURS.map((h) => (
        <div key={h} className="h-14 border-b border-border-subtle flex">
          <span className="text-xs text-text-disabled w-12 pt-1 px-2 shrink-0">
            {h > 0 ? `${h}시` : ''}
          </span>
        </div>
      ))}
      {laid.map(({ event: e, col, totalCols }) => {
        const isAllDay = e.isAllDay
        const top = isAllDay ? 0 : (new Date(e.startAt).getHours() + new Date(e.startAt).getMinutes() / 60) * 56
        const endMs = e.endAt ? new Date(e.endAt).getTime() : new Date(e.startAt).getTime() + (isAllDay ? 86400000 : 3600000)
        const height = isAllDay ? 24 * 56 : Math.max(((endMs - new Date(e.startAt).getTime()) / 3600000) * 56, 28)

        const leftExpr = `calc(3rem + ${col} * (100% - 3rem - 0.75rem) / ${totalCols})`
        const widthExpr = `calc((100% - 3rem - 0.75rem) / ${totalCols} - 3px)`

        return (
          <button
            key={e.id}
            onClick={() => onEventClick(e)}
            className={[
              'absolute rounded-lg px-2 py-1 text-xs text-left text-white cursor-pointer',
              isAllDay ? 'opacity-50' : '',
              e.status === 'cancelled' ? 'line-through opacity-50' : '',
            ].join(' ')}
            style={{ top: `${top}px`, height: `${height}px`, left: leftExpr, width: widthExpr, backgroundColor: e.color || EVENT.DEFAULT_COLOR }}
          >
            <span className="font-medium truncate block">{e.title}</span>
            {isAllDay
              ? <span className="opacity-80">종일</span>
              : <span className="opacity-80">{format(new Date(e.startAt), 'HH:mm')}</span>
            }
          </button>
        )
      })}
    </div>
  )
}
