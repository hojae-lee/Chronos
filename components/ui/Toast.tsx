'use client'

import { CheckCircle2, XCircle, RotateCcw, Info } from 'lucide-react'
import { useEffect } from 'react'

type ToastType = 'success' | 'error' | 'undo' | 'info'

interface ToastProps {
  message: string
  type?: ToastType
  onClose: () => void
  onUndo?: () => void
  duration?: number
}

const typeConfig = {
  success: {
    border: 'border-success/30',
    Icon: CheckCircle2,
    iconClass: 'text-success',
  },
  error: { border: 'border-danger/30', Icon: XCircle, iconClass: 'text-danger' },
  undo: {
    border: 'border-warning/30',
    Icon: RotateCcw,
    iconClass: 'text-warning',
  },
  info: { border: 'border-info/30', Icon: Info, iconClass: 'text-info' },
}

export default function Toast({
  message,
  type = 'info',
  onClose,
  onUndo,
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [onClose, duration])

  const { border, Icon, iconClass } = typeConfig[type]

  return (
    <div
      className={`fixed bottom-[80px] left-1/2 -translate-x-1/2 z-toast
        bg-background-elevated border ${border} rounded-lg shadow-lg
        px-4 py-3 flex items-center gap-3
        min-w-[280px] max-w-[calc(100vw-32px)]`}
      role="alert"
    >
      <Icon size={16} className={`${iconClass} shrink-0`} />
      <span className="text-sm text-text-primary flex-1">{message}</span>
      {type === 'undo' && onUndo && (
        <button
          onClick={() => { onUndo(); onClose() }}
          className="text-xs text-text-secondary hover:text-text-primary ml-auto"
        >
          실행 취소
        </button>
      )}
    </div>
  )
}
