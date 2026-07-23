import { useState, useEffect } from 'react'
import type { YearPoint, TimeUnit } from '@/types'
import { fmtVND, fmtPct, fmtCompact } from '@/utils/format'

export function Chart({ data, color, timeUnit }: { data: YearPoint[]; color: string; timeUnit: TimeUnit }) {
  const [hover, setHover] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t) }, [data])
  if (data.length < 2) return null

  const W = 740, H = 220, P = { t: 24, r: 80, b: 32, l: 58 }
  const cW = W - P.l - P.r, cH = H - P.t - P.b
  const maxV = Math.max(...data.map(d => d.total), 1)
  const last = data[data.length - 1]
  const toX = (i: number) => P.l + (i / (data.length - 1)) * cW
  const toY = (v: number) => P.t + cH - (v / maxV) * cH

  const pts = data.map((d, i) => `${toX(i).toFixed(1)},${toY(d.total).toFixed(1)}`)
  const line = `M${pts.join(' L')}`
  const area = `${line} L${toX(data.length - 1)},${P.t + cH} L${toX(0)},${P.t + cH} Z`
  const baseLine = data.some(d => d.base > 0) ? `M${data.map((d, i) => `${toX(i).toFixed(1)},${toY(d.base).toFixed(1)}`).join(' L')}` : null
  const yTicks = [0, 0.5, 1].map(f => ({ val: maxV * f, y: toY(maxV * f) }))
  const xStep = Math.max(1, Math.ceil((data.length - 1) / 6))
  const xLabels = data.filter((_, i) => i % xStep === 0 || i === data.length - 1)
  const hp = hover !== null ? data[hover] : null

  return (
    <div className="relative">
      {hp && (
        <div className="absolute z-10 pointer-events-none whitespace-nowrap"
          style={{ top: P.t - 16, left: `${Math.min(Math.max(toX(hover!) * (100 / W), 12), 72)}%`, transform: 'translateX(-50%)' }}>
          <div className="rounded-2xl py-3.5 px-5" style={{ background: 'var(--surface)', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
            <div className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--ink-4)' }}>{timeUnit === 'year' ? 'Năm' : timeUnit === 'quarter' ? 'Quý' : 'Tháng'} {hp.year}</div>
            <div className="text-[15px] font-bold" style={{ fontFamily: 'var(--mono)', color }}>{fmtVND(hp.total)}</div>
            {hp.base > 0 && <div className="text-[11px] mt-1.5 flex items-center gap-1" style={{ color: 'var(--ink-4)', fontFamily: 'var(--mono)' }}>Vốn: {fmtVND(hp.base)}{hp.total > hp.base && <span style={{ color: 'var(--success)' }}>+{fmtPct(((hp.total - hp.base) / hp.base) * 100)}</span>}</div>}
          </div>
        </div>
      )}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id="af" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.16" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={P.l} y1={t.y} x2={W - P.r} y2={t.y} stroke="var(--ink-5)" strokeWidth={0.5} strokeDasharray="4,4" />
            <text x={P.l - 8} y={t.y + 3} fontSize={10} fill="var(--ink-4)" textAnchor="end" fontFamily="var(--mono)">{fmtCompact(t.val)}</text>
          </g>
        ))}
        <path d={area} fill="url(#af)" />
        {baseLine && <path d={baseLine} fill="none" stroke="#C4B5FD" strokeWidth={1.5} strokeDasharray="6,4" strokeLinecap="round" />}
        <path d={line} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
          style={{ strokeDasharray: mounted ? 'none' : String(cW * 2), strokeDashoffset: mounted ? '0' : String(cW * 2), transition: 'stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)' }} />
        {data.map((_, i) => (
          <rect key={i} x={toX(i) - cW / data.length / 2} y={P.t} width={cW / data.length} height={cH} fill="transparent" onMouseEnter={() => setHover(i)} />
        ))}
        {hover !== null && (
          <>
            <line x1={toX(hover)} y1={P.t} x2={toX(hover)} y2={P.t + cH} stroke={color} strokeWidth={0.5} strokeDasharray="3,2" opacity={0.3} />
            <circle cx={toX(hover)} cy={toY(data[hover].total)} r={5} fill={color} stroke="var(--surface)" strokeWidth={3} />
          </>
        )}
        <circle cx={toX(data.length - 1)} cy={toY(last.total)} r={4} fill={color} stroke="var(--surface)" strokeWidth={2} />
        <text x={toX(data.length - 1) + 8} y={toY(last.total) + 3.5} fontSize={10} fill={color} fontFamily="var(--mono)" fontWeight="600">{fmtCompact(last.total)}</text>
        {xLabels.map(d => {
          const i = data.indexOf(d)
          const suffix = timeUnit === 'year' ? 'n' : timeUnit === 'quarter' ? 'Q' : 'T'
          const label = timeUnit === 'year' ? `${d.year}${suffix}` : `${suffix}${d.year}`
          return <text key={i} x={toX(i)} y={H - 8} fontSize={10} fill="var(--ink-4)" textAnchor="middle" fontFamily="var(--mono)">{label}</text>
        })}
      </svg>
    </div>
  )
}
