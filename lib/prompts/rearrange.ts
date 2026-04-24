// 에너지 기반 일정 재배치 — 사용자 컨디션(1~10)에 맞춰 하루 일정 순서 최적화 제안
export function buildRearrangePrompt(
  date: string,
  energyLevel: number,
  events: Array<{ id: number; title: string; startAt: string; endAt: string }>
): string {
  const energyDesc =
    energyLevel <= 3
      ? '매우 낮음 (많이 지쳐있음)'
      : energyLevel <= 5
        ? '보통 이하 (약간 피곤함)'
        : energyLevel <= 7
          ? '보통 (평소와 같음)'
          : '높음 (컨디션 좋음)'

  return `You are a Korean AI assistant helping optimize a user's schedule based on their energy level.

Date: ${date}
Energy Level: ${energyLevel}/10 (${energyDesc})

Current schedule:
${JSON.stringify(events, null, 2)}

Suggest a rearranged schedule that matches the user's energy level. For low energy, move demanding tasks to later. For high energy, keep demanding tasks early.

Respond with a JSON object (no markdown):
{
  "rearrangedEvents": [
    { "id": number, "title": string, "startAt": string, "endAt": string }
  ],
  "reason": string (Korean, friendly tone, 1-2 sentences)
}`
}
