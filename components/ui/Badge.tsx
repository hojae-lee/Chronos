type Variant = 'default' | 'warning' | 'success' | 'danger' | 'cancelled' | 'info'

interface BadgeProps {
  variant?: Variant
  children: React.ReactNode
  className?: string
}

const variantClasses: Record<Variant, string> = {
  default: 'bg-background-elevated text-text-secondary',
  warning: 'bg-warning-subtle text-warning',
  success: 'bg-success-subtle text-success',
  danger: 'bg-danger-subtle text-danger',
  cancelled: 'bg-event-cancelled-subtle text-event-cancelled',
  info: 'bg-info-subtle text-info',
}

export default function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
