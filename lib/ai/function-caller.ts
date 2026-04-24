import {
  execCreateEvent,
  execUpdateEvent,
  execDeleteEvent,
  execFindEvent,
} from './actions'
import type { SingleAIResponse, ToolExecution } from './types'
import type { Event } from '@/hooks/useEvents'

type PrismaEvent = Awaited<ReturnType<typeof execCreateEvent>>

function toEvent(e: PrismaEvent): Event {
  return {
    id: e.id,
    userId: e.userId,
    title: e.title,
    description: e.description,
    startAt: e.startAt.toISOString(),
    endAt: e.endAt?.toISOString() ?? null,
    isAllDay: e.isAllDay,
    location: e.location,
    color: e.color,
    status: e.status,
    shareToken: e.shareToken,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
    photos: e.photos.map(p => ({
      id: p.id,
      eventId: p.eventId,
      filePath: p.filePath,
      caption: p.caption,
      createdAt: p.createdAt.toISOString(),
    })),
  }
}

/**
 * Function Calling layer
 *
 * Executes a single tool call and returns:
 *   - response:   structured result the frontend understands
 *   - rawResult:  compact summary fed back into the OpenAI messages array
 *                 so the LLM can reason about what happened and plan next steps
 */
export async function executeSingleToolCall(
  name: string,
  args: Record<string, unknown>
): Promise<ToolExecution> {
  switch (name) {
    case 'create_event': {
      const raw = await execCreateEvent(args as Parameters<typeof execCreateEvent>[0])
      const event = toEvent(raw)
      return {
        response: { action: 'create_event', event, message: `"${event.title}" 일정을 추가했어요!` },
        rawResult: { success: true, eventId: event.id, title: event.title, startAt: event.startAt },
      }
    }

    case 'update_event': {
      const raw = await execUpdateEvent(args as Parameters<typeof execUpdateEvent>[0])
      const event = toEvent(raw)
      return {
        response: { action: 'update_event', event, message: `"${event.title}" 일정을 수정했어요!` },
        rawResult: { success: true, eventId: event.id, title: event.title, startAt: event.startAt },
      }
    }

    case 'delete_event': {
      const raw = await execDeleteEvent(args as Parameters<typeof execDeleteEvent>[0])
      const deleted = toEvent(raw)
      return {
        response: {
          action: 'delete_event',
          eventId: (args as { eventId: number }).eventId,
          deletedEvent: deleted,
          message: `"${deleted.title}" 일정을 삭제했어요.`,
        },
        rawResult: { success: true, deletedEventId: deleted.id, title: deleted.title },
      }
    }

    case 'find_event': {
      const raws = await execFindEvent(args as Parameters<typeof execFindEvent>[0])
      const events = raws.map(toEvent)
      const message = events.length > 0
        ? `"${events[0].title}" 일정을 찾았어요!`
        : `"${(args as { query: string }).query}"과 관련된 일정을 찾지 못했어요.`
      return {
        response: { action: 'find_event', events, message },
        // Include IDs so the LLM can use them in subsequent update/delete calls
        rawResult: {
          found: events.length,
          events: events.map(e => ({ id: e.id, title: e.title, startAt: e.startAt })),
        },
      }
    }

    case 'navigate_to_date': {
      const date = (args as { date: string }).date
      return {
        response: { action: 'navigate_to_date', date, message: `${date}로 이동할게요.` },
        rawResult: { success: true, date },
      }
    }

    default:
      throw new Error(`Unknown tool: ${name}`)
  }
}
