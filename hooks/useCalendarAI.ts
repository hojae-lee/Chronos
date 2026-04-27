'use client'

import { useState, useCallback } from 'react'
import { format } from 'date-fns'
import { useQueryClient } from '@tanstack/react-query'
import { eventKeys } from '@/hooks/queries/eventQueries'
import type { Event } from '@/hooks/useEvents'
import { API } from '@/lib/constants/api'
import type { AIResponse } from '@/lib/ai'
import { ACTION } from '@/lib/ai/constants'

export type { AIResponse as AIActionResult }

export interface CalendarAICallbacks {
  onNavigateTo: (date: Date) => void
  onOpenEvent: (id: number) => void
  onToast: (message: string, type?: 'success' | 'error' | 'undo' | 'info', onUndo?: () => void) => void
  onOpenRetrospective?: (year: number, month: number) => void
}

export interface ChatResult {
  message: string
  events?: Event[]
  isRetro?: boolean
  retroYear?: number
  retroMonth?: number
}

export function useCalendarAI({
  onNavigateTo,
  onOpenEvent,
  onToast,
  onOpenRetrospective,
}: CalendarAICallbacks) {
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)

  const invalidateEvents = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
  }, [queryClient])

  const handleResult = useCallback(
    (result: AIResponse): ChatResult => {
      switch (result.action) {
        case ACTION.CREATE_EVENT:
          invalidateEvents()
          onToast(result.message, 'success')
          return { message: result.message }

        case ACTION.UPDATE_EVENT:
          invalidateEvents()
          onToast(result.message, 'success')
          return { message: result.message }

        case ACTION.DELETE_EVENT: {
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
          return { message: result.message }
        }

        case ACTION.FIND_EVENT:
          return { message: result.message, events: result.events }

        case ACTION.NAVIGATE_TO_DATE:
          return { message: result.message }

        case ACTION.CLARIFY:
          return { message: result.message }

        case ACTION.RETROSPECTIVE:
          onOpenRetrospective?.(result.year, result.month)
          return { message: result.message, isRetro: true, retroYear: result.year, retroMonth: result.month }

        case ACTION.ORCHESTRATED: {
          const { sideEffects } = result
          if (sideEffects.refresh) invalidateEvents()
          onToast(result.message, 'success')
          return { message: result.message }
        }
      }
    },
    [invalidateEvents, onNavigateTo, onOpenEvent, onToast, onOpenRetrospective]
  )

  const send = useCallback(
    async (text: string): Promise<ChatResult | null> => {
      if (!text.trim()) return null
      setLoading(true)

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
          return null
        }

        const result: AIResponse = await res.json()
        return handleResult(result)
      } catch {
        onToast('오류가 발생했어요. 다시 시도해주세요.', 'error')
        return null
      } finally {
        setLoading(false)
      }
    },
    [handleResult, onToast]
  )

  return { send, loading }
}
