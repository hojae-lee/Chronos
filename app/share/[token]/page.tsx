import Link from 'next/link'
import SharedEventView from '@/components/share/SharedEventView'
import { db } from '@/lib/db'

interface Props {
  params: Promise<{ token: string }>
}

export default async function SharePage({ params }: Props) {
  const { token } = await params

  const event = await db.event.findFirst({
    where: { shareToken: token },
  })

  const sharedEvent = event
    ? {
        title: event.title,
        description: event.description,
        startAt: event.startAt.toISOString(),
        endAt: event.endAt?.toISOString() ?? null,
        isAllDay: event.isAllDay,
        location: event.location,
      }
    : null

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-background-base">
      <div className="w-full max-w-[400px]">
        <SharedEventView event={sharedEvent} />
        <p className="text-center mt-8">
          <Link
            href="/"
            className="text-brand-primary text-sm hover:underline"
          >
            Chronos로 시작하기
          </Link>
        </p>
      </div>
    </main>
  )
}
