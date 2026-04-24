'use client'

import { Loader2 } from 'lucide-react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'warning' | 'icon'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  children: React.ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-brand-primary text-white shadow-md hover:bg-brand-hover hover:shadow-lg active:scale-[0.98]',
  secondary:
    'bg-background-surface border border-border-default text-text-primary hover:bg-background-elevated hover:border-border-strong active:scale-[0.98]',
  danger:
    'bg-danger-subtle border border-danger/30 text-danger hover:bg-danger/10',
  warning:
    'bg-warning-subtle border border-warning/30 text-warning hover:bg-warning/20',
  ghost:
    'text-text-secondary hover:bg-background-elevated hover:text-text-primary',
  icon: 'p-2 rounded-md text-text-secondary hover:bg-background-elevated hover:text-text-primary',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const isIcon = variant === 'icon'
  const base =
    'inline-flex items-center justify-center rounded-md transition-colors duration-150 font-medium disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-brand-primary focus-visible:outline-offset-2'

  const classes = [
    base,
    variantClasses[variant],
    !isIcon && sizeClasses[size],
    'transition-transform duration-75',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading && (
        <Loader2 size={16} className="animate-spin mr-1.5" />
      )}
      {children}
    </button>
  )
}
