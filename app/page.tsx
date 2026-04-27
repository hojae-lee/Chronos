import type { Metadata } from 'next'
import LandingNav from '@/components/landing/LandingNav'
import HeroSection from '@/components/landing/HeroSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import RetroSection from '@/components/landing/RetroSection'

export const metadata: Metadata = {
  title: 'Chronos — 지금까지 이런 캘린더는 없었다',
  description: 'AI에게 말을 걸면 일정이 잡히고, 당신의 한 달이 이야기가 됩니다. 로그인 없이 바로 시작하세요.',
}

export default function LandingPage() {
  return (
    <main>
      <LandingNav />
      <HeroSection />
      <FeaturesSection />
      <RetroSection />
    </main>
  )
}
