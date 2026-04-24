'use client'

interface SliderProps {
  min: number
  max: number
  value: number
  onChange: (v: number) => void
  label?: string
  disabled?: boolean
}

export default function Slider({ min, max, value, onChange, label, disabled }: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className="w-full py-4">
      {label && (
        <label className="text-sm font-medium text-text-secondary mb-2 block">
          {label}
        </label>
      )}
      <div className="relative w-full h-2 rounded-full"
        style={{
          background: `linear-gradient(to right, #B8A9D9 0%, #7DC4A8 100%)`,
        }}
      >
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          style={{ height: '100%' }}
          aria-label={label ?? 'slider'}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white shadow-md border-2 border-brand-primary cursor-pointer active:scale-110 transition-transform duration-100"
          style={{ left: `calc(${percentage}% - 12px)` }}
        />
      </div>
    </div>
  )
}
