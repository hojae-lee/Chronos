'use client'

import { useRef, useState, useCallback } from 'react'
import { CalendarDays, Sparkles, User } from 'lucide-react'
import Link from 'next/link'
import CalendarView from '@/components/calendar/CalendarView'
import type { CalendarViewHandle } from '@/components/calendar/CalendarView'
import NaturalLanguageInput from './_components/NaturalLanguageInput'
import Toast from '@/components/ui/Toast'
import RetrospectivePanel from '@/app/timeline/_components/RetrospectivePanel'

interface ToastState {
  message: string
  type: 'success' | 'error' | 'undo' | 'info'
  onUndo?: () => void
  key: number
}

export default function CalendarPage() {
  const calendarRef = useRef<CalendarViewHandle>(null)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [dayPanelOpen, setDayPanelOpen] = useState(false)
  const [retroPanel, setRetroPanel] = useState<{ year: number; month: number } | null>(null)

  const showToast = useCallback(
    (message: string, type: ToastState['type'] = 'info', onUndo?: () => void) => {
      setToast({ message, type, onUndo, key: Date.now() })
    },
    []
  )

  return (
    <div className="min-h-screen bg-background-base">
      <main className="pt-4 pb-[80px] overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <CalendarView
            ref={calendarRef}
            onDayPanelChange={setDayPanelOpen}
          />
        </div>
      </main>

      {!dayPanelOpen && (
        <NaturalLanguageInput
          onNavigateTo={(date) => calendarRef.current?.navigateTo(date)}
          onOpenEvent={(id) => calendarRef.current?.openEventDetail(id)}
          onToast={showToast}
          onOpenRetrospective={(year, month) => setRetroPanel({ year, month })}
        />
      )}

      {retroPanel && (
        <RetrospectivePanel
          year={retroPanel.year}
          month={retroPanel.month}
          isOpen={!!retroPanel}
          onClose={() => setRetroPanel(null)}
        />
      )}

      {toast && (
        <Toast
          key={toast.key}
          message={toast.message}
          type={toast.type}
          onUndo={toast.onUndo}
          onClose={() => setToast(null)}
          duration={toast.type === 'undo' ? 5000 : 3000}
        />
      )}

      <nav className="fixed bottom-0 left-0 right-0 h-[64px] z-sticky bg-background-surface border-t border-border-default">
        <div className="max-w-2xl mx-auto h-full flex items-center justify-around px-4">
          <Link href="/calendar" className="flex flex-col items-center gap-1 px-3 py-2 rounded-md text-brand-primary">
            <CalendarDays size={22} />
            <span className="text-xs font-medium">캘린더</span>
          </Link>
          <Link href="/timeline" className="flex flex-col items-center gap-1 px-3 py-2 rounded-md text-text-disabled hover:text-text-secondary transition-colors duration-150">
            <Sparkles size={22} />
            <span className="text-xs font-medium">타임라인</span>
          </Link>
          <button
            onClick={() => alert('추후 공개 예정입니다 :)')}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-md text-text-disabled hover:text-text-secondary transition-colors duration-150"
          >
            <User size={22} />
            <span className="text-xs font-medium">프로필</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
