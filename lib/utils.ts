import { format, formatDistanceToNow, isSameDay } from 'date-fns'
import { ko } from 'date-fns/locale'

export function formatDate(date: Date | string): string {
  return format(new Date(date), 'M월 d일 (E)', { locale: ko })
}

export function formatTime(date: Date | string): string {
  const d = new Date(date)
  const hours = d.getHours()
  const minutes = d.getMinutes()
  const ampm = hours < 12 ? '오전' : '오후'
  const h = hours % 12 || 12
  const m = minutes > 0 ? ` ${String(minutes).padStart(2, '0')}분` : ''
  return `${ampm} ${h}시${m}`
}

export function formatDateRange(
  startAt: Date | string,
  endAt?: Date | string | null,
  isAllDay?: boolean
): string {
  const start = new Date(startAt)
  const end = endAt ? new Date(endAt) : null
  const sameDay = !end || isSameDay(start, end)

  if (sameDay) {
    if (isAllDay) return formatDate(start)
    const endTime = end ? ` ~ ${formatTime(end)}` : ''
    return `${formatDate(start)} ${formatTime(start)}${endTime}`
  }

  // Multi-day
  if (isAllDay) return `${formatDate(start)} ~ ${formatDate(end!)}`
  return `${formatDate(start)} ${formatTime(start)} ~ ${formatDate(end!)} ${formatTime(end!)}`
}

export function formatRelative(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ko })
}

export function getStartOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function getEnergyLabel(level: number): string {
  if (level <= 2) return '많이 힘드시겠어요'
  if (level <= 4) return '오늘은 좀 쉬어가는 날'
  if (level <= 6) return '평소처럼 해볼 수 있어요'
  if (level <= 8) return '오늘 컨디션이 좋네요'
  return '최고의 컨디션이에요'
}
