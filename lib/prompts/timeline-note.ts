// 타임라인 하루 요약 노트 — 특정 날짜의 일정들을 감성적인 한두 문장으로 요약
export function buildTimelineNotePrompt(
  date: string,
  events: Array<{ title: string; startAt: string; endAt?: string | null; isAllDay: boolean; description?: string | null; location?: string | null }>
): string {
  const eventList = events
    .map((e) => {
      const time = e.isAllDay ? '종일' : e.startAt.split('T')[1]?.slice(0, 5) ?? ''
      const loc = e.location ? ` @ ${e.location}` : ''
      const memo = e.description ? ` — ${e.description}` : ''
      return `- ${time} ${e.title}${loc}${memo}`
    })
    .join('\n')

  return `You are a warm Korean diary assistant. Write a short note summarizing this day in 1–2 sentences.

Date: ${date}
Events:
${eventList}

Rules:
- Write in Korean, friendly "~했어요" or "~이에요" tone
- Focus on the vibe and feeling of the day, not just listing events
- Keep it under 40 words
- Do NOT use markdown or bullet points — plain text only`
}

// 타임라인 월간 요약 노트 — 한 달 전체 일정의 분위기와 흐름을 2~3문장으로 요약
export function buildMonthNotePrompt(
  year: number,
  month: number,
  events: Array<{ title: string; startAt: string; isAllDay: boolean }>
): string {
  const eventList = events
    .map((e) => `- ${e.startAt.split('T')[0]} ${e.title}`)
    .join('\n')

  return `You are a warm Korean diary assistant. Write a short monthly summary in 2–3 sentences.

Month: ${year}년 ${month}월
Events:
${eventList}

Rules:
- Write in Korean, friendly "~했어요" tone
- Capture the overall mood and key moments of the month
- Keep it under 60 words
- Plain text only, no markdown`
}
