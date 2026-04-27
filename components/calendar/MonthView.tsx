'use client'

import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isToday, format,
} from 'date-fns'
import type { Event } from '@/hooks/useEvents'
import EventCard from './EventCard'
import { EVENT } from '@/lib/constants/event'

interface MonthViewProps {
  currentDate: Date
  events: Event[]
  loading?: boolean
  onEventClick: (event: Event) => void
  onEventDetailClick: (event: Event) => void
  onDateClick: (date: Date) => void
}

const DAYS = ['일', '월', '화', '수', '목', '금', '토']
const ROW_H = 22 // px per banner row
const DAY_NUM_H = 28 // px reserved for day-number chip (h-6 + pt-1)

function toDay(d: Date | string): Date {
  const date = new Date(d)
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function isMultiDay(e: Event): boolean {
  return !!e.endAt && !isSameDay(new Date(e.startAt), new Date(e.endAt))
}

interface ColInfo {
  startCol: number  // 1-based
  span: number
  continuesLeft: boolean
  continuesRight: boolean
  showTitle: boolean
}

function getColInfo(e: Event, week: Date[]): ColInfo {
  const eStart = toDay(e.startAt)
  const eEnd = toDay(e.endAt!)
  const weekStart = toDay(week[0])
  const weekEnd = toDay(week[6])

  const clippedStart = eStart < weekStart ? weekStart : eStart
  const clippedEnd = eEnd > weekEnd ? weekEnd : eEnd

  const startIdx = week.findIndex(d => isSameDay(d, clippedStart))
  const endIdx = week.findIndex(d => isSameDay(d, clippedEnd))

  return {
    startCol: startIdx + 1,
    span: endIdx - startIdx + 1,
    continuesLeft: eStart < weekStart,
    continuesRight: eEnd > weekEnd,
    showTitle: !( eStart < weekStart ),
  }
}

/** 각 이벤트가 CSS grid에서 몇 번째 행에 배치되는지 계산 */
function assignBannerRows(mdEvents: Event[], week: Date[]): Map<Event, number> {
  const rows: Array<{ start: number; end: number }[]> = []
  const assignment = new Map<Event, number>()
  for (const e of mdEvents) {
    const { startCol, span } = getColInfo(e, week)
    const endCol = startCol + span - 1
    let ri = 0
    while (true) {
      if (!rows[ri]) { rows[ri] = []; break }
      if (!rows[ri].some(p => !(endCol < p.start || startCol > p.end))) break
      ri++
    }
    rows[ri].push({ start: startCol, end: endCol })
    assignment.set(e, ri)
  }
  return assignment
}

export default function MonthView({
  currentDate,
  events,
  loading = false,
  onEventClick,
  onEventDetailClick,
  onDateClick,
}: MonthViewProps) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calStart = startOfWeek(monthStart)
  const calEnd = endOfWeek(monthEnd)
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  const weeks: Date[][] = []
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7))

  const multiDayEvents = events.filter(isMultiDay)
  const singleDayEvents = events.filter(e => !isMultiDay(e))

  return (
    <div>
      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-xs text-text-disabled tracking-wide text-center uppercase py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Week rows */}
      {weeks.map((week, wi) => {
        const weekStart = toDay(week[0])
        const weekEnd = toDay(week[6])

        const weekMD = multiDayEvents.filter(e => {
          const s = toDay(e.startAt)
          const en = toDay(e.endAt!)
          return s <= weekEnd && en >= weekStart
        })

        const bannerRowAssignment = weekMD.length > 0 ? assignBannerRows(weekMD, week) : new Map<Event, number>()

        return (
          <div key={wi} className="relative">
            {/* Day cells ------------------------------------------------- */}
            <div className="grid grid-cols-7">
              {week.map((day, dayIdx) => {
                const inMonth = isSameMonth(day, currentDate)
                const today = isToday(day)
                const daySingles = singleDayEvents.filter(e => isSameDay(new Date(e.startAt), day))

                // 이 날짜를 실제로 지나가는 배너들만 계산
                const col = dayIdx + 1 // 1-based
                const eventsOnDay = weekMD.filter(e => {
                  const { startCol, span } = getColInfo(e, week)
                  return col >= startCol && col <= startCol + span - 1
                })
                const maxRow = eventsOnDay.reduce(
                  (max, e) => Math.max(max, bannerRowAssignment.get(e) ?? -1),
                  -1
                )
                const cellBannerH = maxRow >= 0 ? (maxRow + 1) * ROW_H : 0

                return (
                  <div
                    key={toDay(day).getTime()}
                    onClick={() => onDateClick(day)}
                    className={[
                      'min-h-[96px] p-1 text-left border-b border-r border-border-subtle flex flex-col cursor-pointer',
                      'hover:bg-background-elevated transition-colors duration-150',
                      today ? 'bg-brand-subtle' : '',
                      !inMonth ? 'opacity-40' : '',
                    ].join(' ')}
                  >
                    {/* Day number */}
                    <span className={[
                      'inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold self-start shrink-0',
                      today ? 'bg-brand-primary text-text-inverse' : 'text-text-primary',
                    ].join(' ')}>
                      {format(day, 'd')}
                    </span>

                    {/* 이 날짜에 실제 배너가 있는 경우에만 공간 예약 */}
                    {cellBannerH > 0 && (
                      <div style={{ height: `${cellBannerH}px` }} className="shrink-0" />
                    )}

                    {/* Single-day events */}
                    <div className={[
                      'mt-0.5 space-y-0.5 w-full transition-opacity duration-300',
                      loading ? 'opacity-0' : 'opacity-100',
                    ].join(' ')}>
                      {daySingles.slice(0, 2).map(e => (
                        <EventCard
                          key={e.id}
                          event={e}
                          onClick={ev => { ev?.stopPropagation(); onEventClick(e) }}
                        />
                      ))}
                      {daySingles.length > 2 && !loading && (
                        <p className="text-xs text-text-disabled pl-1">+{daySingles.length - 2}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Multi-day banner overlay ------------------------------------ */}
            {weekMD.length > 0 && (
              <div
                className={[
                  'absolute left-0 right-0 grid grid-cols-7 pointer-events-none transition-opacity duration-300',
                  loading ? 'opacity-0' : 'opacity-100',
                ].join(' ')}
                style={{ top: `${DAY_NUM_H}px` }}
              >
                {weekMD.map(e => {
                  const { startCol, span, continuesLeft, continuesRight, showTitle } = getColInfo(e, week)
                  const cancelled = e.status === 'cancelled'

                  return (
                    <button
                      key={e.id}
                      onClick={ev => { ev.stopPropagation(); onEventDetailClick(e) }}
                      className={[
                        'text-xs text-white truncate h-5 my-0.5 text-left px-2 cursor-pointer pointer-events-auto',
                        continuesLeft  ? 'rounded-l-none ml-0' : 'rounded-l-full ml-1',
                        continuesRight ? 'rounded-r-none mr-0' : 'rounded-r-full mr-1',
                        cancelled ? 'opacity-40 line-through' : '',
                      ].join(' ')}
                      style={{
                        gridColumn: `${startCol} / span ${span}`,
                        backgroundColor: e.color || EVENT.DEFAULT_COLOR,
                      }}
                    >
                      {showTitle ? e.title : ''}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
