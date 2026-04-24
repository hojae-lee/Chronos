// 자연어 → 일정 구조 파싱 — "담주 화요일 점심" 같은 문장을 JSON 이벤트로 변환
export function buildParsePrompt(text: string, referenceDate?: string): string {
  const today = referenceDate ?? new Date().toISOString().split('T')[0]
  return `You are a Korean calendar assistant. Parse the following natural language input into a structured event.

Today's date: ${today}

Input: "${text}"

Respond with a JSON object (no markdown) with these fields:
- title: string (event title in Korean)
- startAt: string (ISO 8601 datetime, infer from relative expressions like "다음 주 화요일")
- endAt: string | null (ISO 8601 datetime, null if not specified)
- isAllDay: boolean (true if no time specified)
- location: string | null
- confidence: number (0 to 1, how confident you are in the parsing)

If you cannot parse the input, return {"error": "cannot_parse"}.`
}
