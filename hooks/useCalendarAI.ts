'use client'

import { useState, useCallback } from 'react'
import { format } from 'date-fns'
import { useQueryClient } from '@tanstack/react-query'
import { eventKeys } from '@/hooks/queries/eventQueries'
import type { Event } from '@/hooks/useEvents'
import { API } from '@/lib/constants/api'
import type { AIResponse } from '@/lib/ai'

// Re-export for consumers that still import from this hook
export type { AIResponse as AIActionResult }

export interface CalendarAICallbacks {
  onNavigateTo: (date: Date) => void
  onOpenEvent: (id: number) => void
  onToast: (message: string, type?: 'success' | 'error' | 'undo' | 'info', onUndo?: () => void) => void
}

export function useCalendarAI({
  onNavigateTo,
  onOpenEvent,
  onToast,
}: CalendarAICallbacks) {
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)
  const [resultMessage, setResultMessage] = useState<string | null>(null)
  const [resultEvents, setResultEvents] = useState<Event[] | null>(null)

  const invalidateEvents = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
  }, [queryClient])

  const handleResult = useCallback(
    (result: AIResponse) => {
      setResultMessage(result.message)

      switch (result.action) {
        case 'create_event':
          invalidateEvents()
          onNavigateTo(new Date(result.event.startAt))
          onToast(result.message, 'success')
          break

        case 'update_event':
          invalidateEvents()
          onToast(result.message, 'success')
          break

        case 'delete_event': {
          invalidateEvents()
          const snapshot = result.deletedEvent
          onToast(result.message, 'undo', async () => {
            await fetch(API.EVENTS.BASE, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: snapshot.title,
                startAt: snapshot.startAt,
                endAt: snapshot.endAt,
                isAllDay: snapshot.isAllDay,
                location: snapshot.location,
                description: snapshot.description,
              }),
            })
            invalidateEvents()
          })
          break
        }

        case 'find_event':
          if (result.events.length === 1) {
            onNavigateTo(new Date(result.events[0].startAt))
            onOpenEvent(result.events[0].id)
          } else if (result.events.length > 1) {
            setResultEvents(result.events)
          }
          break

        case 'navigate_to_date':
          onNavigateTo(new Date(result.date))
          onToast(result.message, 'info')
          break

        case 'clarify':
          // message shown inline in the input component
          break

        case 'orchestrated': {
          const { sideEffects } = result
          if (sideEffects.refresh) invalidateEvents()
          if (sideEffects.navigateTo) onNavigateTo(new Date(sideEffects.navigateTo))
          if (sideEffects.openEventId) onOpenEvent(sideEffects.openEventId)
          onToast(result.message, 'success')
          break
        }
      }
    },
    [invalidateEvents, onNavigateTo, onOpenEvent, onToast]
  )

  const send = useCallback(
    async (text: string) => {
      if (!text.trim()) return
      setLoading(true)
      setResultMessage(null)
      setResultEvents(null)

      try {
        const res = await fetch(API.AI.CHAT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            currentDate: format(new Date(), 'yyyy-MM-dd'),
          }),
        })

        if (!res.ok) {
          onToast('오류가 발생했어요. 다시 시도해주세요.', 'error')
          return
        }

        const result: AIResponse = await res.json()
        handleResult(result)
      } catch {
        onToast('오류가 발생했어요. 다시 시도해주세요.', 'error')
      } finally {
        setLoading(false)
      }
    },
    [handleResult, onToast]
  )

  return {
    send,
    loading,
    resultMessage,
    resultEvents,
    clearMessage: () => { setResultMessage(null); setResultEvents(null) },
  }
}
