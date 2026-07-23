import { useState, useEffect } from 'react'
import type { Scenario } from '@/types'
import { fmtCompact } from '@/utils/format'

export function ComparisonChart({ scenarios, years, inflationRate }: { scenarios: Scenario[]; years: number; inflationRate: number }) {
  const [hover, setHover] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t) }, [scenarios, years, inflationRate])
  const active = scenarios.filter(s => s.enabled)
  if (active.length === 0 || years === 0) return <div className="text-center py-16 text-[13px]" style={{ color: 'var(--ink-4)' }}>Bật ít nhất 1 kịch bản để xem biểu đồ</div>

  const W = 740, H = 260, P = { t: 24, r: 80, b: 32, l: 58 }
  const cW = W - P.l - P.r, cH = H - P.t - P.b
  const series = active.map(s => Array.from({ length: years + 1 }, (_, y) => {
    const r = s.rate / 100, mr = r / 12
    const amount = mr === 0 ? s.principal + s.monthly * y * 12 : s.principal * Math.pow(1 + r, y) + s.monthly * ((Math.pow(1 + mr, y * 12) - 1) / mr) * (1 + mr)
    return amount
  }))
  const principal0 = active[0].principal
  const infVals = Array.from({ length: years + 1 }, (_, y) => principal0 * Math.pow(1 + inflationRate / 100, y))
  const allVals = [...series.flat(), ...infVals]
  const maxV = Math.max(...allVals, 1)
  const toX = (i: number) => P.l + (i / years) * cW
  const toY = (v: number) => P.t + cH - (v / maxV) * cH
  const yTicks = [0, 0.5, 1].map(f => ({ val: maxV * f, y: toY(maxV * f) }))
  const xStep = Math.max(1, Math.ceil(years / 6))
  const hp = hover !== null ? hover : null

  return (
    <div className="relative">
      {hp !== null && (
        <div className="absolute z-10 pointer-events-none whitespace-nowrap"
          style={{ top: P.t - 16, left: `${Math.min(Math.max(toX(hp) * (100 / W), 15), 70)}%`, transform: 'translateX(-50%)' }}>
          <div className="rounded-2xl py-3.5 px-5" style={{ background: 'var(--surface)', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', minWidth: 160 }}>
            <div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--ink-4)' }}>Năm {hp}</div>
            {active.map((s, i) => (
              <div key={s.id} className="flex items-center justify-between gap-4 text-[11px] mb-1" style={{ fontFamily: 'var(--mono)' }}>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full inline-block" style={{ background: s.color }} />{s.label}</span>
                <span className="font-semibold" style={{ color: s.color }}>{fmtCompact(series[i][hp])}</span>
              </div>
            ))}
            <div className="flex items-center justify-between gap-4 text-[11px] mt-1 pt-1" style={{ fontFamily: 'var(--mono)', borderTop: '1px dashed var(--ink-5)' }}>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full inline-block" style={{ background: '#EF4444', opacity: 0.5 }} />Lạm phát</span>
              <span className="font-semibold" style={{ color: '#EF4444' }}>{fmtCompact(infVals[hp])}</span>
            </div>
          </div>
        </div>
      )}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" onMouseLeave={() => setHover(null)}>
        <defs>
          {active.map(s => (
            <linearGradient key={s.id} id={`ag-${s.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.10" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={P.l} y1={t.y} x2={W - P.r} y2={t.y} stroke="var(--ink-5)" strokeWidth={0.5} strokeDasharray="4,4" />
            <text x={P.l - 8} y={t.y + 3} fontSize={10} fill="var(--ink-4)" textAnchor="end" fontFamily="var(--mono)">{fmtCompact(t.val)}</text>
          </g>
        ))}
        {Array.from({ length: years + 1 }, (_, i) => (
          <rect key={i} x={toX(i) - cW / years / 2} y={P.t} width={cW / years} height={cH} fill="transparent" onMouseEnter={() => setHover(i)} />
        ))}
        {hover !== null && <line x1={toX(hover)} y1={P.t} x2={toX(hover)} y2={P.t + cH} stroke="var(--ink-4)" strokeWidth={0.5} strokeDasharray="3,2" opacity={0.3} />}
        <path d={`M${infVals.map((v, i) => `${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(' L')}`}
          fill="none" stroke="#EF4444" strokeWidth={1.5} strokeDasharray="6,4" opacity={0.45} strokeLinecap="round" />
        {series.map((pts, i) => {
          const s = active[i]
          const line = `M${pts.map((v, j) => `${toX(j).toFixed(1)},${toY(v).toFixed(1)}`).join(' L')}`
          const area = `${line} L${toX(years)},${P.t + cH} L${toX(0)},${P.t + cH} Z`
          return (
            <g key={s.id}>
              <path d={area} fill={`url(#ag-${s.id})`} />
              <path d={line} fill="none" stroke={s.color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
                style={{ strokeDasharray: mounted ? 'none' : String(cW * 2), strokeDashoffset: mounted ? '0' : String(cW * 2), transition: 'stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)' }} />
              <circle cx={toX(years)} cy={toY(pts[years])} r={4} fill={s.color} stroke="var(--surface)" strokeWidth={2} />
              <text x={toX(years) + 8} y={toY(pts[years]) + 3.5} fontSize={10} fill={s.color} fontFamily="var(--mono)" fontWeight="600">{fmtCompact(pts[years])}</text>
            </g>
          )
        })}
        {Array.from({ length: Math.ceil(years / xStep) + 1 }, (_, idx) => {
          const y = idx * xStep
          if (y > years) return null
          return <text key={y} x={toX(y)} y={H - 8} fontSize={10} fill="var(--ink-4)" textAnchor="middle" fontFamily="var(--mono)">{y}n</text>
        })}
      </svg>
    </div>
  )
}
