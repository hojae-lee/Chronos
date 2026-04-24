import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { API } from '@/lib/constants/api'
import type { Event } from '@/hooks/useEvents'

export const eventKeys = {
  all: () => ['events'] as const,
  lists: () => [...eventKeys.all(), 'list'] as const,
  list: (start: string, end: string) => [...eventKeys.lists(), start, end] as const,
  details: () => [...eventKeys.all(), 'detail'] as const,
  detail: (id: number) => [...eventKeys.details(), id] as const,
}

export function useEventList(start: string, end: string) {
  return useQuery({
    queryKey: eventKeys.list(start, end),
    queryFn: async () => {
      const res = await fetch(`${API.EVENTS.BASE}?start=${start}&end=${end}`)
      if (!res.ok) throw new Error('일정을 불러오지 못했어요.')
      return res.json() as Promise<Event[]>
    },
    enabled: !!start && !!end,
  })
}

export function useEvent(id: number) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: async () => {
      const res = await fetch(API.EVENTS.DETAIL(id))
      if (!res.ok) throw new Error('일정을 불러오지 못했어요.')
      return res.json() as Promise<Event>
    },
    enabled: !!id,
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Event>) => {
      const res = await fetch(API.EVENTS.BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('일정 생성에 실패했어요.')
      return res.json() as Promise<Event>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
    },
  })
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Event> }) => {
      const res = await fetch(API.EVENTS.DETAIL(id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('일정 수정에 실패했어요.')
      return res.json() as Promise<Event>
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(id) })
    },
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(API.EVENTS.DETAIL(id), { method: 'DELETE' })
      if (!res.ok) throw new Error('일정 삭제에 실패했어요.')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
    },
  })
}

export function useCancelEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(API.EVENTS.CANCEL(id), { method: 'PATCH' })
      if (!res.ok) throw new Error('일정 취소에 실패했어요.')
      return res.json() as Promise<Event>
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(id) })
    },
  })
}
