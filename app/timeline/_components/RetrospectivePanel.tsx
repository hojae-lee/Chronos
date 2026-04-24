'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Sparkles, Briefcase, User, Heart, Users, Plane, RefreshCw } from 'lucide-react'
import { API } from '@/lib/constants/api'

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

const categoryIcons: Record<string, React.ReactNode> = {
  업무: <Briefcase size={13} />,
  개인: <User size={13} />,
  건강: <Heart size={13} />,
  소셜: <Users size={13} />,
  여행: <Plane size={13} />,
}

export default function RetrospectivePanel({ year, month, isOpen, onClose }: RetrospectivePanelProps) {
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState<string | null>(null)
  const [breakdown, setBreakdown] = useState<CategoryBreakdown[]>([])
  const [highlights, setHighlights] = useState<string[]>([])
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
        setGenerated(true)
      }
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className={[
        'fixed inset-0 z-modal bg-background-base flex flex-col transition-transform duration-300 ease-out',
        visible ? 'translate-y-0' : 'translate-y-full',
      ].join(' ')}
    >
      {/* Header */}
      <header className="h-[56px] shrink-0 flex items-center gap-2 px-4 border-b border-border-subtle bg-background-surface/90 backdrop-blur-md">
        <button
          onClick={handleClose}
          className="p-2 -ml-2 rounded-md text-text-secondary hover:bg-background-elevated hover:text-text-primary transition-colors duration-150"
          aria-label="뒤로"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-base font-semibold text-text-primary">
          {year}년 {month}월 회고록
        </h1>
      </header>

      {/* Body */}
      <main className="flex-1 overflow-y-auto">
        {!generated ? (
          /* Pre-generate state */
          <div className="flex flex-col items-center justify-center min-h-full gap-6 px-6 py-12 text-center">
            {loading ? (
              <div className="flex flex-col items-center gap-5">
                <div className="w-14 h-14 rounded-3xl bg-brand-subtle flex items-center justify-center">
                  <Sparkles size={24} className="text-brand-primary" />
                </div>
                <div>
                  <p className="text-base font-semibold text-text-primary mb-1">이번 달을 돌아보고 있어요</p>
                  <p className="text-sm text-text-disabled">잠시만 기다려주세요...</p>
                </div>
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-2 h-2 rounded-full bg-brand-primary"
                      style={{ animation: `thinking-dot 1.2s ease-in-out ${i * 0.2}s infinite` }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-3xl bg-brand-subtle flex items-center justify-center">
                  <Sparkles size={28} className="text-brand-primary" />
                </div>
                <div>
                  <p className="text-xl font-semibold text-text-primary mb-2">AI 회고록 만들기</p>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {year}년 {month}월의 일정을 분석해<br />
                    나만의 회고록을 작성해드려요
                  </p>
                </div>
                <button
                  onClick={generate}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-primary text-white font-medium text-sm hover:bg-brand-hover transition-colors duration-150"
                >
                  <Sparkles size={15} />
                  회고록 생성하기
                </button>
              </>
            )}
          </div>
        ) : (
          /* Generated content */
          <div className="max-w-2xl mx-auto px-5 py-6 space-y-6">
            {/* Category breakdown */}
            {breakdown.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {breakdown.map((item) => (
                  <span
                    key={item.category}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background-elevated text-xs font-medium text-text-secondary"
                  >
                    {categoryIcons[item.category] && (
                      <span className="text-text-disabled">{categoryIcons[item.category]}</span>
                    )}
                    {item.category} {Math.round(item.percentage)}%
                  </span>
                ))}
              </div>
            )}

            {/* Main content */}
            {content && (
              <div className="bg-background-surface rounded-2xl px-5 py-5 border border-border-subtle">
                <p className="text-sm text-text-secondary leading-[1.8] whitespace-pre-wrap">
                  {content}
                </p>
              </div>
            )}

            {/* Highlights */}
            {highlights.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-text-disabled uppercase tracking-widest mb-3">
                  주요 하이라이트
                </p>
                <ul className="space-y-2">
                  {highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-text-secondary">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Regenerate */}
            <button
              onClick={generate}
              disabled={loading}
              className="flex items-center gap-1.5 text-sm text-text-disabled hover:text-text-secondary transition-colors duration-150 disabled:opacity-50"
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
