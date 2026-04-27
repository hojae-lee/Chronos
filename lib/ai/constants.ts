/**
 * OpenAI Function Calling에 전달하는 도구 이름.
 * tools.ts 스키마 선언, function-caller.ts switch, orchestrator.ts 분기에서 공통 사용.
 */
export const TOOL_NAME = {
  /** 새 일정 생성 — title, startAt, isAllDay 필수 */
  CREATE_EVENT:     'create_event',
  /** 기존 일정 수정 — eventId 필수, 나머지는 변경할 필드만 */
  UPDATE_EVENT:     'update_event',
  /** 일정 영구 삭제 — eventId 필수, 삭제 전 스냅샷 보존(실행취소용) */
  DELETE_EVENT:     'delete_event',
  /** 키워드로 일정 검색 — 부분 일치 허용, ID 모를 때 update/delete 전 사용 */
  FIND_EVENT:       'find_event',
  /** 캘린더 날짜 이동 — DB 조작 없이 클라이언트 뷰만 변경 */
  NAVIGATE_TO_DATE: 'navigate_to_date',
} as const

/**
 * 클라이언트(useCalendarAI)가 받는 action 타입.
 * TOOL_NAME을 모두 포함하며, 오케스트레이터 전용 액션을 추가로 정의.
 */
export const ACTION = {
  ...TOOL_NAME,
  /** LLM이 도구를 호출하지 않음 — 의도 불명확, 추가 입력 요청 */
  CLARIFY:       'clarify',
  /** 멀티스텝 실행 완료 — steps 배열과 sideEffects 포함 */
  ORCHESTRATED:  'orchestrated',
  /** 월간 AI 회고록 요청 — 오케스트레이터 바이패스, year/month 반환 */
  RETROSPECTIVE: 'retrospective',
} as const

export type ToolName   = typeof TOOL_NAME[keyof typeof TOOL_NAME]
export type ActionType = typeof ACTION[keyof typeof ACTION]
