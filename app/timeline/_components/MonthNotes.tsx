'use client'

import { useMemo } from 'react'
import { NotebookPen } from 'lucide-react'
import NoteCard from './NoteCard'
import type { Event } from '@/hooks/useEvents'

interface MonthNotesProps {
  events: Event[]
  year?: number
  month?: number
  loading?: boolean
}

export default function MonthNotes({ events, loading = false }: MonthNotesProps) {
  const grouped = useMemo(() => {
    const map = new Map<string, Event[]>()
    for (const e of events) {
      const key = new Date(e.startAt).toDateString()
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(e)
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([key, evs]) => ({
        date: new Date(key),
        events: evs.sort((a, b) => {
          if (a.isAllDay && !b.isAllDay) return -1
          if (!a.isAllDay && b.isAllDay) return 1
          return new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
        }),
      }))
  }, [events])

  if (grouped.length === 0) {
    if (loading) return null
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-6">
        <NotebookPen size={40} className="text-text-disabled" />
        <p className="text-base font-semibold text-text-secondary">이번 달 기록이 없어요</p>
        <p className="text-sm text-text-disabled">일정을 추가하면 노트로 볼 수 있어요</p>
      </div>
    )
  }

  return (
    <div className="px-4 py-4 space-y-3 max-w-2xl mx-auto">
      {grouped.map(({ date, events }) => (
        <NoteCard key={date.toDateString()} date={date} events={events} />
      ))}
    </div>
  )
}
