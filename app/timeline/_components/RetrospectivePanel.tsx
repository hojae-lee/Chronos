'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Sparkles, RefreshCw } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { API } from '@/lib/constants/api'

const HIGHLIGHT_COLORS = [
  'bg-info-subtle border-info/30 text-info',
  'bg-event-health-subtle border-event-health/30 text-event-health',
  'bg-event-social-subtle border-event-social/30 text-event-social',
  'bg-event-work-subtle border-event-work/30 text-event-work',
  'bg-event-personal-subtle border-event-personal/30 text-event-personal',
]

interface CategoryBreakdown {
  category: string
  percentage: number
}

interface RetrospectivePanelProps {
  year: number
  month: number
  isOpen: boolean
  onClose: () => void
}

export default function RetrospectivePanel({ year, month, isOpen, onClose }: RetrospectivePanelProps) {
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState<string | null>(null)
  const [breakdown, setBreakdown] = useState<CategoryBreakdown[]>([])
  const [highlights, setHighlights] = useState<string[]>([])
  const [totalEvents, setTotalEvents] = useState(0)
  const [generated, setGenerated] = useState(false)

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setVisible(true))
    }
  }, [isOpen])

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, 280)
  }

  async function generate() {
    setLoading(true)
    try {
      const res = await fetch(API.AI.RETROSPECTIVE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month }),
      })
      if (res.ok) {
        const data = await res.json()
        setContent(data.content)
        setBreakdown(data.summary?.categoryBreakdown ?? [])
        setHighlights(data.summary?.highlights ?? [])
        setTotalEvents(data.summary?.totalEvents ?? 0)
        setGenerated(true)
      }
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const topCategory = breakdown.length > 0
    ? breakdown.reduce((a, b) => a.percentage > b.percentage ? a : b)
    : null

  return (
    <div
      className={[
        'fixed inset-0 z-modal bg-background-base flex flex-col transition-transform duration-300 ease-out',
        visible ? 'translate-y-0' : 'translate-y-full',
      ].join(' ')}
    >
      {/* Header */}
      <header className="h-[56px] shrink-0 flex items-center gap-3 px-4 border-b border-border-subtle bg-background-surface/80 backdrop-blur-md">
        <button
          onClick={handleClose}
          className="p-2 -ml-2 rounded-md text-text-secondary hover:text-text-primary transition-colors duration-150"
          aria-label="뒤로"
        >
          <ArrowLeft size={20} />
        </button>
        <span className="text-xs font-semibold text-brand-primary uppercase tracking-widest">
          AI 월간 회고록
        </span>
      </header>

      {/* Body */}
      <main className="flex-1 overflow-y-auto">
        {!generated ? (
          <div className="flex flex-col items-center justify-center min-h-full gap-8 px-6 py-12 text-center">
            {loading ? (
              <div className="flex flex-col items-center gap-6">
                <div className="w-16 h-16 rounded-3xl bg-brand-subtle flex items-center justify-center">
                  <Sparkles size={28} className="text-brand-primary" />
                </div>
                <div>
                  <p className="text-xl font-bold text-text-primary mb-2">이번 달을 돌아보고 있어요</p>
                  <p className="text-sm text-text-disabled">잠시만 기다려주세요...</p>
                </div>
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-2.5 h-2.5 rounded-full bg-brand-primary"
                      style={{ animation: `thinking-dot 1.2s ease-in-out ${i * 0.2}s infinite` }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-sm font-semibold text-brand-primary uppercase tracking-widest mb-4">
                    AI 월간 회고록
                  </p>
                  <h2 className="text-4xl md:text-5xl font-bold text-text-primary leading-tight mb-4">
                    {month}월, 어땠나요?
                  </h2>
                  <p className="text-base text-text-secondary leading-relaxed">
                    {year}년 {month}월의 일정을 분석해<br />
                    나만의 회고록을 만들어드려요.
                  </p>
                </div>
                <button
                  onClick={generate}
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-brand-primary text-white font-bold text-base hover:bg-brand-hover transition-colors duration-150 shadow-lg"
                >
                  <Sparkles size={18} />
                  회고록 생성하기
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto px-5 py-10 space-y-6">
            {/* Heading */}
            <div>
              <p className="text-sm font-semibold text-brand-primary uppercase tracking-widest mb-3">
                {year}년 {month}월 — AI 분석 리포트
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary leading-tight">
                {month}월이 이런 달이었군요.
              </h2>
            </div>

            {/* Glass content card */}
            {content && (
              <div className="bg-background-surface border border-border-subtle rounded-2xl px-6 py-6">
                <div className="text-text-secondary text-base leading-relaxed space-y-3">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <p className="mb-3 last:mb-0">{children}</p>
                      ),
                      strong: ({ children }) => (
                        <strong className="text-brand-primary font-semibold">{children}</strong>
                      ),
                      em: ({ children }) => (
                        <em className="text-text-primary not-italic">{children}</em>
                      ),
                      h1: ({ children }) => (
                        <h1 className="text-xl font-bold text-text-primary mb-2 mt-4 first:mt-0">{children}</h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-lg font-bold text-text-primary mb-2 mt-4 first:mt-0">{children}</h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-base font-semibold text-text-primary mb-1 mt-3 first:mt-0">{children}</h3>
                      ),
                      ul: ({ children }) => (
                        <ul className="space-y-1.5 my-2">{children}</ul>
                      ),
                      li: ({ children }) => (
                        <li className="flex items-start gap-2.5">
                          <span className="mt-[9px] w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
                          <span>{children}</span>
                        </li>
                      ),
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                </div>

                {/* Stats */}
                {totalEvents > 0 && (
                  <div className="grid grid-cols-3 gap-4 pt-5 mt-5 border-t border-border-subtle">
                    <div className="text-center">
                      <div className="text-2xl font-extrabold text-brand-primary">{totalEvents}</div>
                      <div className="text-[11px] text-text-disabled mt-1 leading-tight">이번 달 일정</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-extrabold text-brand-primary truncate">
                        {topCategory?.category ?? '-'}
                      </div>
                      <div className="text-[11px] text-text-disabled mt-1 leading-tight">가장 많은 유형</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-extrabold text-brand-primary">
                        {topCategory ? `${Math.round(topCategory.percentage)}%` : '-'}
                      </div>
                      <div className="text-[11px] text-text-disabled mt-1 leading-tight">비중</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Highlights timeline */}
            {highlights.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-text-disabled uppercase tracking-widest mb-3">
                  주요 하이라이트
                </p>
                <div className="flex flex-col gap-2.5">
                  {highlights.map((h, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-4 rounded-xl border px-4 py-3 ${HIGHLIGHT_COLORS[i % HIGHLIGHT_COLORS.length]}`}
                      style={{ opacity: 1 - i * 0.1 }}
                    >
                      <span className="text-xs font-bold w-5 shrink-0 tabular-nums">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div className="w-px h-4 bg-current opacity-30" />
                      <span className="text-sm font-medium">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Regenerate */}
            <button
              onClick={generate}
              disabled={loading}
              className="flex items-center gap-1.5 text-sm text-text-disabled hover:text-text-secondary transition-colors duration-150 disabled:opacity-30"
            >
              <RefreshCw size={13} />
              다시 생성하기
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
