import type { Event } from '@/hooks/useEvents'
import type { ACTION } from './constants'

type A = typeof ACTION

// ─────────────────────────────────────────────
// Single tool call → one action, one response
// ─────────────────────────────────────────────
export type SingleAIResponse =
  | { action: A['CREATE_EVENT'];     event: Event;        message: string }
  | { action: A['UPDATE_EVENT'];     event: Event;        message: string }
  | { action: A['DELETE_EVENT'];     eventId: number; deletedEvent: Event; message: string }
  | { action: A['FIND_EVENT'];       events: Event[];     message: string }
  | { action: A['NAVIGATE_TO_DATE']; date: string;        message: string }
  | { action: A['CLARIFY'];          message: string }
  | { action: A['RETROSPECTIVE'];    year: number; month: number; message: string }

// ─────────────────────────────────────────────
// Orchestrator → multi-step, multiple tools
// ─────────────────────────────────────────────
export interface SideEffects {
  refresh: boolean
  navigateTo?: string
  openEventId?: number
}

export interface OrchestratedStep {
  tool: string
  args: Record<string, unknown>
  success: boolean
}

export type OrchestratedResponse = {
  action: A['ORCHESTRATED']
  message: string
  steps: OrchestratedStep[]
  sideEffects: SideEffects
}

// Union used throughout the app
export type AIResponse = SingleAIResponse | OrchestratedResponse

// Internal: result of executing one tool call
export interface ToolExecution {
  response: SingleAIResponse
  rawResult: Record<string, unknown>
}
