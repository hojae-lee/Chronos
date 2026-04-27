import ScrollFade from './ScrollFade'

const STATS = [
  { value: '23', label: '이번 달 일정' },
  { value: '화요일', label: '가장 바쁜 요일' },
  { value: '87%', label: '루틴 달성률' },
]

const TIMELINE_EVENTS = [
  { date: '3/4', title: '클라이언트 킥오프', color: 'bg-info-subtle border-info/30 text-info' },
  { date: '3/11', title: '헬스장 PT', color: 'bg-event-health-subtle border-event-health/30 text-event-health' },
  { date: '3/14', title: '팀 워크샵', color: 'bg-event-social-subtle border-event-social/30 text-event-social' },
  { date: '3/20', title: '디자인 리뷰', color: 'bg-event-work-subtle border-event-work/30 text-event-work' },
  { date: '3/27', title: '분기 보고', color: 'bg-event-personal-subtle border-event-personal/30 text-event-personal' },
]

export default function RetroSection() {
  return (
    <section className="min-h-screen flex flex-col justify-center px-6 py-20 bg-text-primary">
      <div className="max-w-5xl mx-auto w-full">
        <ScrollFade className="text-center mb-16">
          <p className="text-sm font-semibold text-brand-primary uppercase tracking-widest mb-3">
            AI 월간 회고록
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-text-inverse leading-tight">
            이번 달, 어땠어?
          </h2>
        </ScrollFade>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* 회고록 카드 */}
          <ScrollFade delay={100}>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col gap-6">
              <div className="flex items-center gap-2">
                <span className="text-brand-primary">✦</span>
                <span className="text-xs font-semibold text-text-disabled tracking-wide">
                  2024년 3월 — AI 분석 리포트
                </span>
              </div>
              <p className="text-text-inverse/75 text-base md:text-lg leading-relaxed">
                &ldquo;이번 달은{' '}
                <span className="text-brand-primary font-semibold">클라이언트 미팅</span>이 유독 많았어요.
                총 23개의 일정 중 절반이 오후에 몰렸고, 화요일이 가장 바쁜 날이었습니다.
                그럼에도{' '}
                <span className="text-brand-primary font-semibold">운동 루틴</span>은 꾸준히 지켰네요.
                4월엔 오전 시간을 좀 더 활용해보는 건 어떨까요?&rdquo;
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                {STATS.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-2xl font-extrabold text-brand-primary">{stat.value}</div>
                    <div className="text-[11px] text-text-disabled mt-1 leading-tight">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollFade>

          {/* 타임라인 */}
          <ScrollFade delay={200}>
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold text-text-disabled uppercase tracking-widest mb-2">
                3월 주요 일정
              </p>
              {TIMELINE_EVENTS.map((event, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-4 rounded-xl border px-4 py-3 ${event.color}`}
                  style={{ opacity: 1 - i * 0.12 }}
                >
                  <span className="text-xs font-bold w-8 shrink-0">{event.date}</span>
                  <div className="w-px h-4 bg-current opacity-30" />
                  <span className="text-sm font-medium">{event.title}</span>
                </div>
              ))}
              <p className="text-xs text-text-disabled text-right mt-2 opacity-50">
                + 18개 일정 더보기
              </p>
            </div>
          </ScrollFade>
        </div>
      </div>
    </section>
  )
}
