// 월간 AI 회고록 — 한 달 일정을 분석해 친근한 말투의 회고록 + 카테고리 분석 JSON 생성
export function buildRetrospectivePrompt(
  year: number,
  month: number,
  events: Array<{ title: string; startAt: string; description?: string | null }>
): string {
  return `You are a warm Korean AI assistant. Generate a monthly retrospective for ${year}년 ${month}월.

Events this month:
${JSON.stringify(events, null, 2)}

Write a retrospective in Korean with friendly "~해요" tone. Include:
1. A warm summary of the month
2. Key highlights (3-5 events)
3. Encouragement for next month

Also provide a JSON summary at the END with this exact format:
---JSON---
{
  "categoryBreakdown": [{"category": string, "percentage": number}],
  "highlights": [string],
  "totalEvents": number
}
---END---

The main text should be in markdown format, friendly and personal.`
}
