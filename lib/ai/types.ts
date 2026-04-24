import type { Event } from '@/hooks/useEvents'

// ─────────────────────────────────────────────
// Single tool call → one action, one response
// ─────────────────────────────────────────────
export type SingleAIResponse =
  | { action: 'create_event';     event: Event;        message: string }
  | { action: 'update_event';     event: Event;        message: string }
  | { action: 'delete_event';     eventId: number; deletedEvent: Event; message: string }
  | { action: 'find_event';       events: Event[];     message: string }
  | { action: 'navigate_to_date'; date: string;        message: string }
  | { action: 'clarify';          message: string }

// ─────────────────────────────────────────────
// Orchestrator → multi-step, multiple tools
// ─────────────────────────────────────────────
export interface SideEffects {
  refresh: boolean        // calendar should re-fetch events
  navigateTo?: string     // ISO date string to navigate to
  openEventId?: number    // event detail to open
}

export interface OrchestratedStep {
  tool: string
  args: Record<string, unknown>
  success: boolean
}

export type OrchestratedResponse = {
  action: 'orchestrated'
  message: string
  steps: OrchestratedStep[]
  sideEffects: SideEffects
}

// Union used throughout the app
export type AIResponse = SingleAIResponse | OrchestratedResponse

// Internal: result of executing one tool call
export interface ToolExecution {
  response: SingleAIResponse
  // Compact summary fed back to the LLM so it can plan next steps
  rawResult: Record<string, unknown>
}
