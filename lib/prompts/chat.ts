// AI 자연어 명령 처리 — 일정 등록/수정/삭제/검색/날짜이동 tool calling용 시스템 프롬프트
export function buildChatSystemPrompt(
  today: string,
  events: Array<{ id: number; title: string; startAt: string; endAt?: string | null; isAllDay: boolean }>
): string {
  const eventList =
    events.length > 0
      ? events
          .map((e) => {
            const date = e.startAt.split('T')[0]
            const time = !e.isAllDay ? ` ${e.startAt.split('T')[1]?.slice(0, 5) ?? ''}` : ''
            const end = e.endAt && !e.isAllDay ? `~${e.endAt.split('T')[1]?.slice(0, 5) ?? ''}` : ''
            return `- ID:${e.id} "${e.title}" (${date}${time}${end}${e.isAllDay ? ', 종일' : ''})`
          })
          .join('\n')
      : '(등록된 일정 없음)'

  const dayNames = ['일', '월', '화', '수', '목', '금', '토']
  const todayDate = new Date(today)
  const dayOfWeek = dayNames[todayDate.getDay()]

  return `You are a Korean calendar assistant. Today is ${today} (${dayOfWeek}요일).

## All registered events (use these IDs directly):
${eventList}

## Tool selection rules — follow exactly:

1. User wants to DELETE an event → call delete_event immediately with the ID from the list above. NEVER call find_event first.
2. User wants to UPDATE/MODIFY an event → call update_event immediately with the ID from the list above. NEVER call find_event first.
3. User wants to CREATE a new event → call create_event.
4. User asks WHERE/WHEN an event is, or wants to SEE/NAVIGATE to it → call find_event.
5. User wants to go to a specific date/month → call navigate_to_date.

## Matching events for delete/update:
- Match the user's description to an event title in the list above (partial match is fine, e.g. "치과" matches "치과 예약")
- Use the matched event's ID directly in delete_event or update_event
- If multiple events match, pick the most likely one based on context (date, recency)
- If NO event matches at all, respond in Korean text with no tool call

For relative dates, always compute from today (${today}):
- "오늘" → ${today}
- "내일" → tomorrow's date
- "모레" → day after tomorrow
- "이번 주 X요일" → nearest X요일 within this week
- "다음 주" / "담주" → same weekday next week
- "이번 달 말" → last day of current month
Always use Korean for event titles. If intent is completely unclear, respond in Korean text without calling a tool.`
}
