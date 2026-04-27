'use client'

import { useState } from 'react'
import { Clock, MapPin, FileText, Pencil, XCircle, Trash2 } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import ShareButton from '@/components/share/ShareButton'
import EventForm from './EventForm'
import { formatDateRange } from '@/lib/utils'
import type { Event } from '@/hooks/useEvents'
import Image from 'next/image'

interface EventDetailModalProps {
  event: Event | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (id: number, data: Partial<Event>) => Promise<void>
  onDelete: (id: number) => Promise<void>
  onCancel: (id: number) => Promise<void>
}

export default function EventDetailModal({
  event,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  onCancel,
}: EventDetailModalProps) {
  const [mode, setMode] = useState<'view' | 'edit' | 'confirm-delete'>('view')

  if (!event) return null

  const isCancelled = event.status === 'cancelled'

  function handleClose() {
    setMode('view')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      {mode === 'edit' ? (
        <>
          <div className="px-5 pt-5 pb-4 border-b border-border-subtle">
            <h2 className="text-xl font-semibold text-text-primary">일정 수정</h2>
          </div>
          <EventForm
            initialData={event}
            onSubmit={async (data) => {
              await onUpdate(event.id, data)
              setMode('view')
              handleClose()
            }}
            onCancel={() => setMode('view')}
          />
        </>
      ) : (
        <>
          {/* Event info */}
          <div className="px-5 pt-5 pb-5 space-y-4">
            {isCancelled && (
              <Badge variant="cancelled">취소됨</Badge>
            )}
            <h2 className={`text-2xl font-bold text-text-primary leading-tight ${isCancelled ? 'line-through opacity-50' : ''}`}>
              {event.title}
            </h2>

            {/* Meta rows */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-subtle flex items-center justify-center shrink-0">
                  <Clock size={15} className="text-brand-primary" />
                </div>
                <span className="text-sm text-text-primary">
                  {formatDateRange(event.startAt, event.endAt, event.isAllDay)}
                </span>
              </div>

              {event.location && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-info-subtle flex items-center justify-center shrink-0">
                    <MapPin size={15} className="text-info" />
                  </div>
                  <span className="text-sm text-text-primary">{event.location}</span>
                </div>
              )}

              {event.description && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-background-elevated flex items-center justify-center shrink-0 mt-0.5">
                    <FileText size={15} className="text-text-secondary" />
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed pt-1.5">
                    {event.description}
                  </p>
                </div>
              )}
            </div>

            {event.photos && event.photos.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pt-1">
                {event.photos.map((photo) => (
                  <Image
                    key={photo.id}
                    src={photo.filePath}
                    alt={photo.caption ?? '사진'}
                    width={72}
                    height={72}
                    className="w-18 h-18 rounded-xl object-cover shrink-0"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-5 pb-5 pt-4 border-t border-border-subtle">
            {mode === 'confirm-delete' ? (
              <div className="space-y-3">
                <p className="text-sm text-text-secondary text-center">정말 이 일정을 삭제할까요?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMode('view')}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-background-elevated text-text-secondary hover:bg-border-subtle transition-colors duration-150"
                  >
                    취소
                  </button>
                  <button
                    onClick={async () => { await onDelete(event.id); handleClose() }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-danger text-white hover:opacity-90 transition-opacity duration-150"
                  >
                    삭제하기
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <ShareButton eventId={event.id} />

                {!isCancelled && (
                  <button
                    onClick={() => onCancel(event.id).then(handleClose)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-warning-subtle text-warning hover:bg-warning/20 transition-colors duration-150"
                  >
                    <XCircle size={15} />
                    일정 취소
                  </button>
                )}

                <div className="flex-1" />

                <button
                  onClick={() => setMode('edit')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-background-elevated text-text-secondary hover:bg-border-default transition-colors duration-150"
                >
                  <Pencil size={15} />
                  수정
                </button>

                <button
                  onClick={() => setMode('confirm-delete')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-danger-subtle text-danger hover:bg-danger/10 transition-colors duration-150"
                >
                  <Trash2 size={15} />
                  삭제
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </Modal>
  )
}
