import { MessageSquare, Sparkles, CalendarDays } from 'lucide-react'
import ScrollFade from './ScrollFade'
import type { ReactNode } from 'react'

const FEATURES: {
  icon: ReactNode
  number: string
  title: string
  description: string
  accent: string
  iconBg: string
  iconColor: string
}[] = [
  {
    icon: <MessageSquare size={22} />,
    number: '01',
    title: '그냥 말하면 됩니다',
    description:
      '"담주 화요일 점심 약속 잡아줘" 한 문장이면 날짜, 시간, 제목이 자동으로 캘린더에 등록됩니다. 수정, 삭제, 이동도 말 한 마디로.',
    accent: 'bg-info-subtle border-info/20',
    iconBg: 'bg-info/10',
    iconColor: 'text-info',
  },
  {
    icon: <CalendarDays size={22} />,
    number: '02',
    title: '가볍고 빠른 캘린더',
    description:
      '복잡한 설정 없이 열자마자 바로 씁니다. 다른 캘린더보다 가볍고 빠르게 일정을 확인하고, 필요한 것만 딱 보여줍니다.',
    accent: 'bg-event-travel-subtle border-event-travel/20',
    iconBg: 'bg-event-travel/10',
    iconColor: 'text-event-travel',
  },
  {
    icon: <Sparkles size={22} />,
    number: '03',
    title: 'AI가 한 달 회고록을 써줍니다',
    description:
      '"이번 달 어땠어?"라고 물어보세요. AI가 한 달 일정을 분석해 주요 패턴과 인사이트를 담은 나만의 회고록을 바로 작성해줍니다.',
    accent: 'bg-brand-subtle border-brand-primary/20',
    iconBg: 'bg-brand-subtle',
    iconColor: 'text-brand-primary',
  },
]

export default function FeaturesSection() {
  return (
    <section className="min-h-screen flex flex-col justify-center px-6 py-20 bg-background-surface">
      <div className="max-w-6xl mx-auto w-full">
        <ScrollFade className="text-center mb-16">
          <p className="text-sm font-semibold text-brand-primary uppercase tracking-widest mb-3">Features</p>
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary">세 가지가 다릅니다</h2>
        </ScrollFade>

        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <ScrollFade key={feature.number} delay={i * 120}>
              <div
                className={`rounded-2xl border p-8 h-full flex flex-col gap-5 hover:shadow-md transition-shadow duration-200 ${feature.accent}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${feature.iconBg} ${feature.iconColor}`}>
                    {feature.icon}
                  </div>
                  <span className="text-xs font-bold text-text-disabled tracking-widest">{feature.number}</span>
                </div>
                <h3 className="text-xl font-bold text-text-primary leading-snug">{feature.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed flex-1">{feature.description}</p>
              </div>
            </ScrollFade>
          ))}
        </div>
      </div>
    </section>
  )
}
