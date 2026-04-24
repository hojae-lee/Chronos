import { NextRequest, NextResponse } from 'next/server'
import { eventService } from '@/lib/event/event.service'
import { toErrorResponse } from '@/lib/errors'

type Params = { params: Promise<{ id: string }> }

export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  try {
    const shareToken = await eventService.share(Number(id))
    return NextResponse.json({
      shareToken,
      shareUrl: `${appUrl}/share/${shareToken}`,
    })
  } catch (e) {
    return toErrorResponse(e) ?? NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
