'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import DateInput from '@/components/ui/DateInput'
import TimeInput from '@/components/ui/TimeInput'
import type { Event } from '@/hooks/useEvents'
import { EVENT, EVENT_COLORS } from '@/lib/constants/event'

interface EventFormProps {
  initialData?: Partial<Event>
  onSubmit: (data: Partial<Event>) => Promise<void>
  onCancel: () => void
}


function addOneHour(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const totalMin = h * 60 + m + 60
  // Cap at 23:59
  if (totalMin >= 24 * 60) return '23:59'
  return `${String(Math.floor(totalMin / 60)).padStart(2, '0')}:${String(totalMin % 60).padStart(2, '0')}`
}

export default function EventForm({ initialData, onSubmit, onCancel }: EventFormProps) {
  const today = format(new Date(), 'yyyy-MM-dd')

  const [title, setTitle] = useState(initialData?.title ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [isAllDay, setIsAllDay] = useState(initialData?.isAllDay ?? true)

  const [startDate, setStartDate] = useState(
    initialData?.startAt
      ? format(new Date(initialData.startAt), 'yyyy-MM-dd')
      : today
  )
  const [endDate, setEndDate] = useState(
    initialData?.endAt
      ? format(new Date(initialData.endAt), 'yyyy-MM-dd')
      : initialData?.startAt
        ? format(new Date(initialData.startAt), 'yyyy-MM-dd')
        : today
  )
  const [startTime, setStartTime] = useState(
    initialData?.startAt && !initialData?.isAllDay
      ? format(new Date(initialData.startAt), 'HH:mm')
      : '09:00'
  )
  const [endTime, setEndTime] = useState(
    initialData?.endAt && !initialData?.isAllDay
      ? format(new Date(initialData.endAt), 'HH:mm')
      : '10:00'
  )

  const [location, setLocation] = useState(initialData?.location ?? '')
  const [color, setColor] = useState(initialData?.color ?? EVENT.DEFAULT_COLOR)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleStartDateChange(val: string) {
    setStartDate(val)
    // keep endDate >= startDate
    if (val > endDate) setEndDate(val)
  }

  function handleStartTimeChange(val: string) {
    setStartTime(val)
    // on same day, auto-bump endTime
    if (startDate === endDate && val >= endTime) {
      setEndTime(addOneHour(val))
    }
  }

  function handleEndDateChange(val: string) {
    if (val >= startDate) setEndDate(val)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!title.trim()) { setError('제목을 입력해주세요.'); return }
    if (endDate < startDate) { setError('종료일은 시작일 이후여야 해요.'); return }
    if (!isAllDay && startDate === endDate && startTime >= endTime) {
      setError('종료 시간은 시작 시간보다 늦어야 해요.'); return
    }

    setLoading(true)
    try {
      const startAt = isAllDay
        ? new Date(`${startDate}T00:00:00`).toISOString()
        : new Date(`${startDate}T${startTime}:00`).toISOString()

      const endAt = isAllDay
        ? new Date(`${endDate}T23:59:59`).toISOString()
        : new Date(`${endDate}T${endTime}:00`).toISOString()

      await onSubmit({
        title: title.trim(),
        description: description || null,
        startAt,
        endAt,
        isAllDay,
        location: location || null,
        color,
      })
    } catch {
      setError('저장 중 문제가 생겼어요. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  const isMultiDay = startDate !== endDate

  return (
    <form onSubmit={handleSubmit} className="px-5 py-4 space-y-5">
      {error && (
        <div className="bg-danger-subtle border border-danger/30 rounded-xl px-4 py-2.5 text-sm text-danger">
          {error}
        </div>
      )}

      {/* Title */}
      <Input
        label="제목"
        id="event-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="일정 제목을 입력해주세요"
        required
      />

      {/* All-day toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-secondary">종일</span>
        <button
          type="button"
          role="switch"
          aria-checked={isAllDay}
          onClick={() => setIsAllDay((v) => !v)}
          className={[
            'relative inline-flex w-11 h-6 rounded-full transition-colors duration-200',
            isAllDay ? 'bg-brand-primary' : 'bg-border-default',
          ].join(' ')}
        >
          <span className={[
            'absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200',
            isAllDay ? 'translate-x-5' : 'translate-x-0',
          ].join(' ')} />
        </button>
      </div>

      {/* Date & Time section */}
      <div className="space-y-3">
        {/* Start */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-text-disabled">시작</p>
          <div className={['grid gap-2', !isAllDay ? 'grid-cols-2' : 'grid-cols-1'].join(' ')}>
            <DateInput value={startDate} onChange={handleStartDateChange} />
            {!isAllDay && (
              <TimeInput value={startTime} onChange={handleStartTimeChange} />
            )}
          </div>
        </div>

        {/* End */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-text-disabled">
            종료{isMultiDay && <span className="ml-1.5 text-brand-primary font-semibold">· 여러 날</span>}
          </p>
          <div className={['grid gap-2', !isAllDay ? 'grid-cols-2' : 'grid-cols-1'].join(' ')}>
            <DateInput value={endDate} min={startDate} onChange={handleEndDateChange} />
            {!isAllDay && (
              <TimeInput
                value={endTime}
                min={startDate === endDate ? startTime : undefined}
                onChange={setEndTime}
              />
            )}
          </div>
        </div>
      </div>

      {/* Color picker */}
      <div>
        <p className="text-xs font-medium text-text-disabled mb-2.5">색상</p>
        <div className="flex gap-2.5 flex-wrap">
          {EVENT_COLORS.map((c) => (
            <button
              key={c.hex}
              type="button"
              onClick={() => setColor(c.hex)}
              className="w-7 h-7 rounded-full transition-transform duration-150 hover:scale-110"
              style={{
                backgroundColor: c.hex,
                outline: color === c.hex ? `3px solid ${c.hex}` : 'none',
                outlineOffset: '2px',
              }}
              aria-label={c.label}
            />
          ))}
        </div>
      </div>

      {/* Location */}
      <Input
        label="장소"
        id="event-location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="장소를 입력해주세요"
      />

      {/* Description */}
      <Input
        label="메모"
        id="event-description"
        value={description ?? ''}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="메모를 입력해주세요"
      />

      <div className="flex justify-end gap-2 pt-2 border-t border-border-subtle">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit" variant="primary" size="sm" loading={loading} disabled={!title.trim()}>
          {loading ? '저장 중...' : '일정 저장하기'}
        </Button>
      </div>
    </form>
  )
}
