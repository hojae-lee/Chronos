import { nanoid } from 'nanoid'
import { SINGLE_USER_ID } from '@/lib/auth'
import { EVENT } from '@/lib/constants/event'
import { NotFoundError, ForbiddenError, ValidationError } from '@/lib/errors'
import { eventRepository } from './event.repository'
import type { CreateEventInput, UpdateEventInput } from './event.types'

async function assertOwnership(id: number) {
  const event = await eventRepository.findByIdRaw(id)
  if (!event) throw new NotFoundError()
  if (event.userId !== SINGLE_USER_ID) throw new ForbiddenError()
  return event
}

export const eventService = {
  list: (start: string, end: string) =>
    eventRepository.findByRange(
      SINGLE_USER_ID,
      new Date(`${start}T00:00:00.000`),
      new Date(`${end}T23:59:59.999`)
    ),

  get: async (id: number) => {
    const event = await eventRepository.findById(id)
    if (!event) throw new NotFoundError()
    if (event.userId !== SINGLE_USER_ID) throw new ForbiddenError()
    return event
  },

  create: (input: CreateEventInput) => {
    if (!input.title?.trim()) throw new ValidationError('title is required')
    if (!input.startAt) throw new ValidationError('startAt is required')
    return eventRepository.create({
      userId: SINGLE_USER_ID,
      title: input.title.trim(),
      description: input.description ?? null,
      startAt: new Date(input.startAt),
      endAt: input.endAt ? new Date(input.endAt) : null,
      isAllDay: input.isAllDay ?? false,
      location: input.location ?? null,
      color: input.color ?? EVENT.DEFAULT_COLOR,
    })
  },

  update: async (id: number, input: UpdateEventInput) => {
    await assertOwnership(id)
    if (input.title !== undefined && !input.title.trim()) {
      throw new ValidationError('title cannot be empty')
    }
    return eventRepository.update(id, {
      ...(input.title !== undefined && { title: input.title.trim() }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.startAt !== undefined && { startAt: new Date(input.startAt) }),
      ...(input.endAt !== undefined && { endAt: input.endAt ? new Date(input.endAt) : null }),
      ...(input.isAllDay !== undefined && { isAllDay: input.isAllDay }),
      ...(input.location !== undefined && { location: input.location }),
      ...(input.color !== undefined && { color: input.color }),
    })
  },

  delete: async (id: number) => {
    const event = await eventRepository.findById(id)
    if (!event) throw new NotFoundError()
    if (event.userId !== SINGLE_USER_ID) throw new ForbiddenError()
    await eventRepository.delete(id)
    return event
  },

  cancel: async (id: number) => {
    await assertOwnership(id)
    return eventRepository.cancel(id)
  },

  share: async (id: number) => {
    const event = await assertOwnership(id)
    if (event.shareToken) return event.shareToken
    const token = nanoid()
    await eventRepository.setShareToken(id, token)
    return token
  },
}
