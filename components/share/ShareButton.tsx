'use client'

import { useState } from 'react'
import { Link, Copy, Check } from 'lucide-react'
import Button from '@/components/ui/Button'

interface ShareButtonProps {
  eventId: number
}

export default function ShareButton({ eventId }: ShareButtonProps) {
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)

  async function handleShare() {
    setLoading(true)
    try {
      const res = await fetch(`/api/events/${eventId}/share`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setShareUrl(data.shareUrl)
        await navigator.clipboard.writeText(data.shareUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 3000)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      loading={loading}
      onClick={handleShare}
      aria-label="공유 링크 생성"
    >
      {copied ? (
        <>
          <Check size={16} className="mr-1.5 text-success" />
          복사됨
        </>
      ) : shareUrl ? (
        <>
          <Copy size={16} className="mr-1.5" />
          링크 복사
        </>
      ) : (
        <>
          <Link size={16} className="mr-1.5" />
          공유하기
        </>
      )}
    </Button>
  )
}
