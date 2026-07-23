import { useState, useEffect, type ChangeEvent } from 'react'

interface SliderProps {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step: number
  formatDisplay: (v: number) => string
  parseInput?: (s: string) => number
  unit?: string
  color?: string
}

export function Slider({   label, value, onChange, min, max, formatDisplay, parseInput, unit, color = '#4F46E5' }: SliderProps) {
  const [inputVal, setInputVal] = useState(formatDisplay(value))
  const [focused, setFocused] = useState(false)

  useEffect(() => { if (!focused) setInputVal(formatDisplay(value)) }, [value, focused, formatDisplay])

  return (
    <div style={{ marginBottom: '24px' }}>
      <div className="flex items-center gap-1.5 mb-3">
        <span className="text-[12px] font-semibold" style={{ color: 'var(--ink-3)' }}>{label}</span>
      </div>
      <div className="relative">
        <input type="text" inputMode="numeric" value={inputVal}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setInputVal(e.target.value)}
          onFocus={() => { setFocused(true); setInputVal(String(value)) }}
          onBlur={() => { setFocused(false); const p = parseInput ? parseInput(inputVal) : Number(inputVal); if (!isNaN(p) && p >= 0) onChange(Math.min(max, Math.max(min, p))) }}
          className="w-full h-11 px-4 rounded-xl text-[13px] font-semibold outline-none transition-all duration-200"
          style={{ fontFamily: 'var(--mono)', background: focused ? 'var(--surface)' : 'var(--inset)', color: 'var(--ink)', border: `1.5px solid ${focused ? color : 'transparent'}`, boxShadow: focused ? `0 0 0 3px ${color}12` : 'none' }} />
        {unit && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-medium pointer-events-none" style={{ color: 'var(--ink-4)' }}>{unit}</span>}
      </div>
    </div>
  )
}
