'use client'

import { useState, useCallback } from 'react'
import { API } from '@/lib/constants/api'

export interface Event {
  id: number
  userId: number
  title: string
  description?: string | null
  startAt: string
  endAt?: string | null
  isAllDay: boolean
  location?: string | null
  color: string
  status: string
  shareToken?: string | null
  createdAt: string
  updatedAt: string
  photos: Array<{
    id: number
    eventId: number
    filePath: string
    caption?: string | null
    createdAt: string
  }>
}

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = useCallback(async (start: string, end: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API.EVENTS.BASE}?start=${start}&end=${end}`)
      if (!res.ok) throw new Error('일정을 불러오지 못했어요.')
      const data = await res.json()
      setEvents(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했어요.')
    } finally {
      setLoading(false)
    }
  }, [])

  const createEvent = useCallback(
    async (data: Partial<Event>): Promise<Event | null> => {
      try {
        const res = await fetch(API.EVENTS.BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!res.ok) return null
        const event = await res.json()
        setEvents((prev) => [...prev, event])
        return event
      } catch {
        return null
      }
    },
    []
  )

  const updateEvent = useCallback(
    async (id: number, data: Partial<Event>): Promise<Event | null> => {
      try {
        const res = await fetch(API.EVENTS.DETAIL(id), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!res.ok) return null
        const event = await res.json()
        setEvents((prev) => prev.map((e) => (e.id === id ? event : e)))
        return event
      } catch {
        return null
      }
    },
    []
  )

  const deleteEvent = useCallback(async (id: number): Promise<boolean> => {
    try {
      const res = await fetch(API.EVENTS.DETAIL(id), { method: 'DELETE' })
      if (!res.ok) return false
      setEvents((prev) => prev.filter((e) => e.id !== id))
      return true
    } catch {
      return false
    }
  }, [])

  const cancelEvent = useCallback(async (id: number): Promise<boolean> => {
    try {
      const res = await fetch(API.EVENTS.CANCEL(id), { method: 'PATCH' })
      if (!res.ok) return false
      const event = await res.json()
      setEvents((prev) => prev.map((e) => (e.id === id ? event : e)))
      return true
    } catch {
      return false
    }
  }, [])

  return {
    events,
    loading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    cancelEvent,
    setEvents,
  }
}
