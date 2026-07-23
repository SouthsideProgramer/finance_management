import type { TimeUnit } from '@/types'

export function TimeUnitSelector({ unit, onChange, color }: { unit: TimeUnit; onChange: (u: TimeUnit) => void; color: string }) {
  const opts: { l: string; v: TimeUnit }[] = [{ l: 'Năm', v: 'year' }, { l: 'Quý', v: 'quarter' }, { l: 'Tháng', v: 'month' }]
  return (
    <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--inset)' }}>
      {opts.map(o => (
        <button key={o.v} onClick={() => onChange(o.v)}
          className="flex-1 h-9 rounded-lg cursor-pointer transition-all duration-200 text-[11px] font-semibold border-none"
          style={{ fontFamily: 'var(--font)', background: unit === o.v ? 'var(--surface)' : 'transparent', color: unit === o.v ? color : 'var(--ink-4)', boxShadow: unit === o.v ? 'var(--shadow-xs)' : 'none' }}>
          {o.l}
        </button>
      ))}
    </div>
  )
}
