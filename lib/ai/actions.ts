import { SINGLE_USER_ID } from '@/lib/auth'
import { EVENT } from '@/lib/constants/event'
import { eventRepository } from '@/lib/event/event.repository'

export async function execCreateEvent(args: {
  title: string
  startAt: string
  endAt?: string
  isAllDay: boolean
  location?: string
  description?: string
}) {
  return eventRepository.create({
    userId: SINGLE_USER_ID,
    title: args.title,
    startAt: new Date(args.startAt),
    endAt: args.endAt ? new Date(args.endAt) : null,
    isAllDay: args.isAllDay,
    location: args.location ?? null,
    description: args.description ?? null,
    color: EVENT.DEFAULT_COLOR,
  })
}

export async function execUpdateEvent(args: {
  eventId: number
  title?: string
  startAt?: string
  endAt?: string
  isAllDay?: boolean
  location?: string
  description?: string
}) {
  const { eventId, title, startAt, endAt, isAllDay, location, description } = args
  return eventRepository.update(eventId, {
    ...(title       !== undefined && { title }),
    ...(startAt     !== undefined && { startAt: new Date(startAt) }),
    ...(endAt       !== undefined && { endAt: endAt ? new Date(endAt) : null }),
    ...(isAllDay    !== undefined && { isAllDay }),
    ...(location    !== undefined && { location }),
    ...(description !== undefined && { description }),
  })
}

export async function execDeleteEvent(args: { eventId: number }) {
  const event = await eventRepository.findById(args.eventId)
  if (!event) throw new Error(`Event ${args.eventId} not found`)
  await eventRepository.delete(args.eventId)
  return event
}

export async function execFindEvent(args: { query: string }) {
  return eventRepository.findByTitleSearch(SINGLE_USER_ID, args.query)
}
