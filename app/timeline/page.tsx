'use client'

import { useState } from 'react'
import { CalendarDays, Sparkles, User } from 'lucide-react'
import Link from 'next/link'
import CalendarHeader from '@/components/calendar/CalendarHeader'
import MonthNotes from './_components/MonthNotes'
import RetrospectivePanel from './_components/RetrospectivePanel'
import { useEventList } from '@/hooks/queries/eventQueries'

export default function TimelinePage() {
  const now = new Date()
  const [currentDate, setCurrentDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1))
  const [showRetro, setShowRetro] = useState(false)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1
  const pad = (n: number) => String(n).padStart(2, '0')
  const lastDay = new Date(year, month, 0).getDate()
  const start = `${year}-${pad(month)}-01`
  const end = `${year}-${pad(month)}-${pad(lastDay)}`

  const { data: events = [], isLoading: loading } = useEventList(start, end)

  return (
    <div className="min-h-screen bg-background-base">
      {/* Content */}
      <main className="pb-[80px] overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <CalendarHeader
            currentDate={currentDate}
            onChange={setCurrentDate}
            rightAction={
              <button
                onClick={() => setShowRetro(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium bg-brand-primary text-white hover:bg-brand-hover transition-colors duration-150"
              >
                <Sparkles size={15} />
                회고 만들기
              </button>
            }
          />
        </div>
        <MonthNotes events={events} year={year} month={month} loading={loading} />
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 h-[64px] z-sticky bg-background-surface border-t border-border-default">
        <div className="max-w-2xl mx-auto h-full flex items-center justify-around px-4">
          <Link href="/calendar" className="flex flex-col items-center gap-1 px-3 py-2 rounded-md text-text-disabled hover:text-text-secondary transition-colors duration-150">
            <CalendarDays size={22} />
            <span className="text-xs font-medium">캘린더</span>
          </Link>
          <Link href="/timeline" className="flex flex-col items-center gap-1 px-3 py-2 rounded-md text-brand-primary">
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

      {showRetro && (
        <RetrospectivePanel
          year={year}
          month={month}
          isOpen={showRetro}
          onClose={() => setShowRetro(false)}
        />
      )}
    </div>
  )
}
