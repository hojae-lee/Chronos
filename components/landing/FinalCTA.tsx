import Link from 'next/link'

export default function FinalCTA() {
  return (
    <section className="py-24 px-6 bg-background-base">
      <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-brand-subtle flex items-center justify-center text-3xl">
          ✦
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-text-primary leading-tight">
          로그인 없이<br />지금 바로
        </h2>
        <p className="text-text-secondary text-base leading-relaxed max-w-md">
          설치도 없고, 가입도 없습니다.<br />
          바로 시작해서 오늘 일정을 AI에게 맡겨보세요.
        </p>
        <Link
          href="/calendar"
          className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-hover text-white font-bold text-base px-10 py-4 rounded-2xl transition-colors duration-150 active:scale-[0.98] transition-transform shadow-md mt-2"
        >
          Chronos 시작하기 <span aria-hidden>→</span>
        </Link>
        <p className="text-xs text-text-disabled">무료 · 로그인 불필요 · 언제든 시작 가능</p>
      </div>
    </section>
  )
}
