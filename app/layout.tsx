import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'

export const metadata: Metadata = {
  title: 'Chronos — AI 지능형 플래너',
  description: 'AI가 컨디션에 맞춰 일정을 최적화하고, 지나온 시간을 3D 공간에서 감상하는 플래너',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
