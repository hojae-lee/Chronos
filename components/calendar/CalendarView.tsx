'use client'

import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns'
import { RefreshCw } from 'lucide-react'
import CalendarHeader from './CalendarHeader'
import MonthView from './MonthView'
import DayPanel from './DayPanel'
import EventDetailModal from './EventDetailModal'
import Modal from '@/components/ui/Modal'
import EventForm from './EventForm'
import {
  useEventList,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
  useCancelEvent,
} from '@/hooks/queries/eventQueries'
import type { Event } from '@/hooks/useEvents'

export interface CalendarViewHandle {
  navigateTo: (date: Date) => void
  loadEvents: () => void
  openEventDetail: (eventId: number) => void
  getCurrentDate: () => Date
  getEvents: () => Event[]
}

interface CalendarViewProps {
  onCurrentDateChange?: (date: Date) => void
  onEventsLoaded?: (events: Event[]) => void
  onDayPanelChange?: (open: boolean) => void
}

const CalendarView = forwardRef<CalendarViewHandle, CalendarViewProps>(
  function CalendarView({ onCurrentDateChange, onEventsLoaded, onDayPanelChange }, ref) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [dayPanelMode, setDayPanelMode] = useState<'list' | 'day'>('list')
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [pendingOpenEventId, setPendingOpenEventId] = useState<number | null>(null)

    const start = format(startOfWeek(startOfMonth(currentDate)), 'yyyy-MM-dd')
    const end = format(endOfWeek(endOfMonth(currentDate)), 'yyyy-MM-dd')

    const { data: events = [], isLoading: loading, isError, refetch } = useEventList(start, end)
    const { mutateAsync: createEventMutation } = useCreateEvent()
    const { mutateAsync: updateEventMutation } = useUpdateEvent()
    const { mutateAsync: deleteEventMutation } = useDeleteEvent()
    const { mutateAsync: cancelEventMutation } = useCancelEvent()

    useEffect(() => { onCurrentDateChange?.(currentDate) }, [currentDate, onCurrentDateChange])
    useEffect(() => { onEventsLoaded?.(events) }, [events, onEventsLoaded])
    useEffect(() => { onDayPanelChange?.(!!selectedDate) }, [selectedDate, onDayPanelChange])

    useEffect(() => {
      if (pendingOpenEventId && events.length > 0) {
        const event = events.find((e) => e.id === pendingOpenEventId)
        if (event) {
          setSelectedEvent(event)
          setPendingOpenEventId(null)
        }
      }
    }, [events, pendingOpenEventId])

    const loadEvents = useCallback(() => { refetch() }, [refetch])

    useImperativeHandle(ref, () => ({
      navigateTo: (date: Date) => {
        setCurrentDate(date)
        setSelectedDate(date)
      },
      loadEvents,
      openEventDetail: (eventId: number) => {
        const event = events.find((e) => e.id === eventId)
        if (event) {
          setSelectedEvent(event)
        } else {
          setPendingOpenEventId(eventId)
        }
      },
      getCurrentDate: () => currentDate,
      getEvents: () => events,
    }), [loadEvents, events, currentDate])

    return (
      <div className="relative">
        <CalendarHeader
          currentDate={currentDate}
          onChange={(date) => { setCurrentDate(date); setSelectedDate(null) }}
        />

        {/* Month view — always mounted, events fade during load */}
        <div className="px-4">
          <div className={loading ? 'pointer-events-none' : ''}>
            <MonthView
              currentDate={currentDate}
              events={events}
              loading={loading}
              onEventClick={(event) => {
                setSelectedDate(new Date(event.startAt))
                setDayPanelMode('list')
              }}
              onEventDetailClick={(event) => setSelectedEvent(event)}
              onDateClick={(date) => {
                setSelectedDate(date)
                setDayPanelMode('list')
              }}
            />
          </div>
          {isError && (
            <div className="py-4 flex items-center justify-center gap-2">
              <p className="text-sm text-text-secondary">일정을 불러오지 못했어요.</p>
              <button onClick={loadEvents} className="flex items-center gap-1.5 text-sm text-brand-primary">
                <RefreshCw size={14} /> 다시 시도
              </button>
            </div>
          )}
        </div>

        {/* Day Panel */}
        {selectedDate && (
          <DayPanel
            date={selectedDate}
            events={events}
            viewMode={dayPanelMode}
            onViewModeChange={setDayPanelMode}
            onEventClick={(event) => { setSelectedEvent(event) }}
            onAddEvent={() => setShowCreateModal(true)}
            onClose={() => setSelectedDate(null)}
          />
        )}

        {/* Event Detail Modal */}
        <EventDetailModal
          event={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onUpdate={async (id, data) => { await updateEventMutation({ id, data }) }}
          onDelete={async (id) => { await deleteEventMutation(id) }}
          onCancel={async (id) => { await cancelEventMutation(id) }}
        />

        {/* Create Event Modal */}
        <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="일정 추가하기">
          <EventForm
            initialData={selectedDate ? { startAt: new Date(selectedDate).toISOString() } : undefined}
            onSubmit={async (data) => { await createEventMutation(data); setShowCreateModal(false) }}
            onCancel={() => setShowCreateModal(false)}
          />
        </Modal>
      </div>
    )
  }
)

export default CalendarView
