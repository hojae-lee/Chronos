import { Loader2 } from 'lucide-react'

type Size = 'sm' | 'md' | 'lg'

const sizeMap: Record<Size, number> = {
  sm: 16,
  md: 24,
  lg: 32,
}

export default function LoadingSpinner({ size = 'md' }: { size?: Size }) {
  return (
    <Loader2
      size={sizeMap[size]}
      className="animate-spin text-brand-primary"
      aria-label="로딩 중..."
    />
  )
}
