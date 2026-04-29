'use client'

// Hardcoded to avoid SSR/hydration mismatch
const CELLS = [
  { x: 4,  y: 88, date: 7,  color: '#2ECC8F', delay: 0,  dur: 20, opacity: 0.38, size: 44 },
  { x: 14, y: 25, date: 14, color: '#3498DB', delay: 4,  dur: 24, opacity: 0.30, size: 52 },
  { x: 26, y: 72, date: 3,  color: '#F39C12', delay: 8,  dur: 18, opacity: 0.35, size: 40 },
  { x: 38, y: 50, date: 21, color: '#9B59B6', delay: 2,  dur: 22, opacity: 0.28, size: 48 },
  { x: 52, y: 82, date: 11, color: '#E74C3C', delay: 11, dur: 16, opacity: 0.33, size: 36 },
  { x: 63, y: 18, date: 28, color: '#2ECC8F', delay: 6,  dur: 21, opacity: 0.32, size: 56 },
  { x: 74, y: 60, date: 5,  color: '#3498DB', delay: 14, dur: 19, opacity: 0.28, size: 44 },
  { x: 84, y: 35, date: 19, color: '#F39C12', delay: 3,  dur: 23, opacity: 0.36, size: 50 },
  { x: 92, y: 75, date: 30, color: '#9B59B6', delay: 9,  dur: 17, opacity: 0.30, size: 38 },
  { x: 48, y: 8,  date: 16, color: '#E74C3C', delay: 16, dur: 25, opacity: 0.26, size: 60 },
  { x: 20, y: 95, date: 24, color: '#2ECC8F', delay: 5,  dur: 20, opacity: 0.29, size: 42 },
  { x: 58, y: 45, date: 9,  color: '#3498DB', delay: 12, dur: 18, opacity: 0.32, size: 46 },
  { x: 8,  y: 55, date: 17, color: '#F39C12', delay: 17, dur: 22, opacity: 0.27, size: 54 },
  { x: 32, y: 10, date: 26, color: '#9B59B6', delay: 7,  dur: 26, opacity: 0.29, size: 40 },
  { x: 78, y: 90, date: 2,  color: '#2ECC8F', delay: 19, dur: 19, opacity: 0.34, size: 48 },
]

// Mini calendar grid snippet (just dots in 3×3 pattern)
const EVENT_DOTS = ['#2ECC8F', '#3498DB', null, '#F39C12', null, '#9B59B6', null, '#E74C3C', null]

export default function CalendarBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Subtle calendar grid lines */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #6E56CF 1px, transparent 1px),
            linear-gradient(to bottom, #6E56CF 1px, transparent 1px)
          `,
          backgroundSize: `calc(100% / 7) 72px`,
        }}
      />

      {/* Floating date cells */}
      {CELLS.map((cell, i) => (
        <div
          key={i}
          className="absolute flex flex-col items-center justify-center rounded-xl border"
          style={{
            left: `${cell.x}%`,
            top: `${cell.y}%`,
            width: cell.size,
            height: cell.size,
            opacity: cell.opacity,
            borderColor: cell.color,
            backgroundColor: `${cell.color}18`,
            animation: `cal-float ${cell.dur}s ${cell.delay}s ease-in-out infinite`,
            backdropFilter: 'blur(2px)',
          }}
        >
          <span
            className="font-bold leading-none"
            style={{ color: cell.color, fontSize: cell.size * 0.38 }}
          >
            {cell.date}
          </span>
          {/* Mini event dot */}
          <div
            className="rounded-full mt-0.5"
            style={{
              width: cell.size * 0.14,
              height: cell.size * 0.14,
              backgroundColor: cell.color,
            }}
          />
        </div>
      ))}

      {/* Floating mini calendar snippet (top-right area) */}
      <div
        className="absolute rounded-2xl border border-purple-300/20 bg-white/5 p-2 backdrop-blur-sm"
        style={{
          right: '8%',
          top: '12%',
          opacity: 0.32,
          animation: 'cal-float 28s 10s ease-in-out infinite',
        }}
      >
        <div className="grid grid-cols-3 gap-1">
          {EVENT_DOTS.map((color, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: color ?? '#E2E0EC', opacity: color ? 1 : 0.3 }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
