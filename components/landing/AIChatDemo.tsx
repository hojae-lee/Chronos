'use client'

import { useState, useEffect } from 'react'

const SCENARIOS = [
  {
    user: '담주 화요일 점심 약속 잡아줘',
    ai: '✓ 수요일 12:00 점심 약속을 추가했어요',
  },
  {
    user: '치과 예약 목요일로 옮겨줘',
    ai: '✓ 치과 예약을 목요일로 이동했어요',
  },
  {
    user: '이번 달 회고록 써줘',
    ai: '✓ 23개 일정 분석 완료, 회고록을 작성했어요.',
  },
]

type Phase = 'typing-user' | 'thinking' | 'typing-ai' | 'done'

function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

export default function AIChatDemo() {
  const [scenarioIdx, setScenarioIdx] = useState(0)
  const [userText, setUserText] = useState('')
  const [aiText, setAiText] = useState('')
  const [phase, setPhase] = useState<Phase>('typing-user')

  useEffect(() => {
    const scenario = SCENARIOS[scenarioIdx]
    let cancelled = false

    async function run() {
      setUserText('')
      setAiText('')
      setPhase('typing-user')

      for (let i = 1; i <= scenario.user.length; i++) {
        if (cancelled) return
        setUserText(scenario.user.slice(0, i))
        await sleep(55)
      }

      await sleep(500)
      if (cancelled) return
      setPhase('thinking')
      await sleep(900)

      if (cancelled) return
      setPhase('typing-ai')
      for (let i = 1; i <= scenario.ai.length; i++) {
        if (cancelled) return
        setAiText(scenario.ai.slice(0, i))
        await sleep(38)
      }

      if (cancelled) return
      setPhase('done')
      await sleep(2800)
      if (cancelled) return
      setScenarioIdx(prev => (prev + 1) % SCENARIOS.length)
    }

    run()
    return () => {
      cancelled = true
    }
  }, [scenarioIdx])

  return (
    <div className="bg-background-surface/90 backdrop-blur-sm rounded-2xl border border-border-default shadow-xl p-5 w-full max-w-sm">
      {/* Window chrome */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border-subtle">
        <span className="text-brand-primary text-xs font-bold">✦</span>
        <span className="text-xs font-semibold text-text-secondary">Chronos AI</span>
        <div className="ml-auto flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-danger/50" />
          <span className="w-2.5 h-2.5 rounded-full bg-warning/50" />
          <span className="w-2.5 h-2.5 rounded-full bg-success/50" />
        </div>
      </div>

      {/* User bubble */}
      <div className="flex justify-end mb-3">
        <div className="bg-brand-primary/10 border border-brand-primary/20 rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[88%]">
          <p className="text-sm text-text-primary leading-relaxed min-h-[20px]">
            {userText}
            {phase === 'typing-user' && (
              <span className="inline-block w-[2px] h-[1em] bg-text-primary ml-0.5 align-middle animate-pulse" />
            )}
          </p>
        </div>
      </div>

      {/* Thinking dots */}
      {phase === 'thinking' && (
        <div className="flex justify-start mb-3">
          <div className="bg-background-elevated rounded-2xl rounded-tl-sm px-4 py-3">
            <div className="flex gap-1.5 items-center h-4">
              <span className="w-1.5 h-1.5 rounded-full bg-text-disabled [animation:thinking-dot_1.2s_ease-in-out_infinite_0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-text-disabled [animation:thinking-dot_1.2s_ease-in-out_infinite_200ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-text-disabled [animation:thinking-dot_1.2s_ease-in-out_infinite_400ms]" />
            </div>
          </div>
        </div>
      )}

      {/* AI bubble */}
      {(phase === 'typing-ai' || phase === 'done') && (
        <div className="flex justify-start">
          <div className="bg-background-elevated rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[88%]">
            <p className="text-sm text-text-primary leading-relaxed min-h-[20px]">
              {aiText}
              {phase === 'typing-ai' && (
                <span className="inline-block w-[2px] h-[1em] bg-text-primary ml-0.5 align-middle animate-pulse" />
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
