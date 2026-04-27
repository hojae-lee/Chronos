import type { ChatCompletionTool } from 'openai/resources'
import { TOOL_NAME } from './constants'

/**
 * OpenAI function calling schemas.
 * Used by both the single function-caller and the orchestrator.
 */
export const calendarTools: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: TOOL_NAME.CREATE_EVENT,
      description: 'Create a new calendar event when user wants to add or schedule something',
      parameters: {
        type: 'object',
        properties: {
          title:       { type: 'string',  description: 'Event title in Korean' },
          startAt:     { type: 'string',  description: 'ISO 8601 local datetime e.g. 2026-04-15T14:00:00' },
          endAt:       { type: 'string',  description: 'ISO 8601 local datetime, omit if not specified' },
          isAllDay:    { type: 'boolean', description: 'true if no specific time mentioned' },
          location:    { type: 'string',  description: 'Location, omit if not specified' },
          description: { type: 'string',  description: 'Note or memo, omit if not specified' },
        },
        required: ['title', 'startAt', 'isAllDay'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: TOOL_NAME.UPDATE_EVENT,
      description: 'Update an existing calendar event. Use event IDs from the provided event list.',
      parameters: {
        type: 'object',
        properties: {
          eventId:     { type: 'number', description: 'The ID of the event to update' },
          title:       { type: 'string' },
          startAt:     { type: 'string', description: 'ISO 8601 local datetime' },
          endAt:       { type: 'string', description: 'ISO 8601 local datetime' },
          isAllDay:    { type: 'boolean' },
          location:    { type: 'string' },
          description: { type: 'string' },
        },
        required: ['eventId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: TOOL_NAME.DELETE_EVENT,
      description: 'Permanently delete a calendar event. Use the event ID from the provided event list.',
      parameters: {
        type: 'object',
        properties: {
          eventId: { type: 'number', description: 'The ID of the event to delete' },
        },
        required: ['eventId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: TOOL_NAME.FIND_EVENT,
      description: 'Search for events by keyword. Use when user asks where/when an event is, or when you need the event ID before updating/deleting and the ID is not in the context.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search keyword (event title or keyword)' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: TOOL_NAME.NAVIGATE_TO_DATE,
      description: 'Navigate the calendar to a specific date or month',
      parameters: {
        type: 'object',
        properties: {
          date: { type: 'string', description: 'Target date in YYYY-MM-DD format' },
        },
        required: ['date'],
      },
    },
  },
]
