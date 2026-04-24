import fs from 'node:fs/promises'
import path from 'node:path'
import { APP } from '@/lib/constants/app'

const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads')

export async function ensureUploadDir(userId: number): Promise<string> {
  const dir = path.join(UPLOAD_DIR, String(userId))
  await fs.mkdir(dir, { recursive: true })
  return dir
}

export async function saveUploadedFile(
  file: File,
  userId: number
): Promise<string> {
  if (!(APP.ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    throw new Error('지원하지 않는 파일 형식이에요.')
  }
  if (file.size > APP.MAX_FILE_SIZE_BYTES) {
    throw new Error('파일 크기가 너무 커요. 10MB 이하로 업로드해주세요.')
  }

  const dir = await ensureUploadDir(userId)
  const ext = file.name.split('.').pop() ?? 'jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const filePath = path.join(dir, filename)

  const buffer = Buffer.from(await file.arrayBuffer())
  await fs.writeFile(filePath, buffer)

  return `/uploads/${userId}/${filename}`
}

export async function deleteUploadedFile(filePath: string): Promise<void> {
  try {
    const fullPath = path.join(process.cwd(), 'public', filePath)
    await fs.unlink(fullPath)
  } catch {
    // File may not exist, ignore
  }
}
