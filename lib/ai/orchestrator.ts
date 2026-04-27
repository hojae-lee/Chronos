import type { ChatCompletionMessageParam } from 'openai/resources'
import { openai } from '@/lib/openai'
import { buildChatSystemPrompt } from '@/lib/prompts'
import { calendarTools } from './tools'
import { executeSingleToolCall } from './function-caller'
import type {
  AIResponse,
  OrchestratedStep,
  SideEffects,
  SingleAIResponse,
} from './types'
import { TOOL_NAME, ACTION } from './constants'

const MODEL = 'gpt-5.4-mini'
const MAX_ITERATIONS = 6  // safety cap to prevent runaway loops

type EventSummary = {
  id: number
  title: string
  startAt: string
  endAt?: string | null
  isAllDay: boolean
}

/**
 * Orchestrator
 *
 * Runs an agentic loop where the LLM can call multiple tools sequentially.
 * Each tool result is fed back into the conversation so the LLM can reason
 * about what happened and decide what to do next.
 *
 * Example multi-step flow:
 *   User: "치과 찾아서 다음 주 같은 시간으로 옮겨줘"
 *   → Step 1: find_event("치과")       → rawResult: { events: [{id:3, ...}] }
 *   → Step 2: update_event(3, newDate) → rawResult: { success: true, ... }
 *   → LLM text: "치과 일정을 다음 주 화요일 오후 3시로 옮겼어요!"
 */
export async function runOrchestrator(
  text: string,
  currentDate: string,
  allEvents: EventSummary[]
): Promise<AIResponse> {
  const systemPrompt = buildChatSystemPrompt(currentDate, allEvents)

  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user',   content: text },
  ]

  const steps: (OrchestratedStep & { response: SingleAIResponse })[] = []
  let finalMessage = '완료했어요.'

  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages,
      tools: calendarTools,
      tool_choice: 'auto',
      temperature: 0,
    })

    const assistantMsg = completion.choices[0].message
    messages.push(assistantMsg)

    // No tool calls → LLM decided it's done; use its text as the final message
    if (!assistantMsg.tool_calls?.length) {
      finalMessage = assistantMsg.content ?? finalMessage
      break
    }

    // Execute every tool call in this round
    for (const toolCall of assistantMsg.tool_calls) {
      if (toolCall.type !== 'function') continue

      const { name, arguments: rawArgs } = toolCall.function
      const args = JSON.parse(rawArgs) as Record<string, unknown>

      const { response, rawResult } = await executeSingleToolCall(name, args)

      steps.push({ tool: name, args, success: true, response })

      // Feed result back so the LLM knows what happened
      messages.push({
        role: 'tool',
        content: JSON.stringify(rawResult),
        tool_call_id: toolCall.id,
      })
    }
  }

  // ── Build final response ──────────────────────────────────────────────────

  if (steps.length === 0) {
    return { action: ACTION.CLARIFY, message: finalMessage }
  }

  if (steps.length === 1) {
    // Single-step: return as-is for full backward compatibility with the frontend
    return steps[0].response
  }

  return {
    action: ACTION.ORCHESTRATED,
    message: finalMessage,
    steps: steps.map(({ tool, args, success }) => ({ tool, args, success })),
    sideEffects: buildSideEffects(steps),
  }
}

/** Aggregate all side effects the frontend needs to apply after a multi-step run */
function buildSideEffects(
  steps: (OrchestratedStep & { response: SingleAIResponse })[]
): SideEffects {
  const mutatingTools = new Set<string>([
    TOOL_NAME.CREATE_EVENT,
    TOOL_NAME.UPDATE_EVENT,
    TOOL_NAME.DELETE_EVENT,
  ])

  const refresh = steps.some(s => mutatingTools.has(s.tool))

  const navigateStep = [...steps].reverse().find(s =>
    s.tool === TOOL_NAME.NAVIGATE_TO_DATE ||
    s.tool === TOOL_NAME.CREATE_EVENT ||
    s.tool === TOOL_NAME.UPDATE_EVENT
  )
  let navigateTo: string | undefined
  if (navigateStep) {
    if (navigateStep.response.action === ACTION.NAVIGATE_TO_DATE) {
      navigateTo = navigateStep.response.date
    } else if (
      navigateStep.response.action === ACTION.CREATE_EVENT ||
      navigateStep.response.action === ACTION.UPDATE_EVENT
    ) {
      navigateTo = navigateStep.response.event.startAt
    }
  }

  const findStep = steps.find(s => s.tool === TOOL_NAME.FIND_EVENT)
  const hadMutationAfterFind = steps
    .slice(steps.indexOf(findStep!) + 1)
    .some(s => mutatingTools.has(s.tool))

  let openEventId: number | undefined
  if (findStep && !hadMutationAfterFind && findStep.response.action === ACTION.FIND_EVENT) {
    if (findStep.response.events.length === 1) {
      openEventId = findStep.response.events[0].id
    }
  }

  return { refresh, navigateTo, openEventId }
}
