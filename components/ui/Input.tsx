'use client'

import { AlertCircle } from 'lucide-react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export default function Input({ label, error, id, className = '', ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  const inputClasses = [
    'w-full bg-background-surface border border-border-default rounded-md',
    'px-4 py-3 text-sm text-text-primary placeholder:text-text-disabled',
    'focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20',
    'disabled:opacity-40 disabled:cursor-not-allowed',
    error ? 'border-danger focus:border-danger focus:ring-danger/20' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-text-secondary mb-1.5 block"
        >
          {label}
        </label>
      )}
      <input id={inputId} className={inputClasses} autoComplete="off" {...props} />
      {error && (
        <p className="mt-1.5 text-xs text-danger flex items-center gap-1">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  )
}
