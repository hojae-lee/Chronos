import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { SINGLE_USER_ID } from '@/lib/auth'
import { saveUploadedFile, deleteUploadedFile } from '@/lib/upload'

type Params = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params
  const userId = SINGLE_USER_ID

  const event = await db.event.findUnique({ where: { id: Number(id) } })
  if (!event) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  if (event.userId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const caption = formData.get('caption') as string | null

  if (!file) {
    return NextResponse.json({ error: 'file is required' }, { status: 422 })
  }

  try {
    const filePath = await saveUploadedFile(file, userId)
    const photo = await db.eventPhoto.create({
      data: {
        eventId: Number(id),
        filePath,
        caption: caption ?? null,
      },
    })
    return NextResponse.json(photo, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Upload failed'
    return NextResponse.json({ error: msg }, { status: 422 })
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params
  const userId = SINGLE_USER_ID

  const event = await db.event.findUnique({ where: { id: Number(id) } })
  if (!event) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  if (event.userId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const photoId = searchParams.get('photoId')
  if (!photoId) {
    return NextResponse.json({ error: 'photoId is required' }, { status: 422 })
  }

  const photo = await db.eventPhoto.findUnique({ where: { id: Number(photoId) } })
  if (!photo) {
    return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
  }

  await deleteUploadedFile(photo.filePath)
  await db.eventPhoto.delete({ where: { id: Number(photoId) } })

  return NextResponse.json({ success: true })
}
