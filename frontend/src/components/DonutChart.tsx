import { fmtCompact } from '@/utils/format'

export function DonutChart({ data, size = 180 }: { data: { label: string; value: number; color: string }[]; size?: number }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  if (total === 0) return <div className="text-center py-12 text-[13px]" style={{ color: 'var(--ink-4)' }}>Chưa có dữ liệu</div>
  const r = (size - 24) / 2, cx = size / 2, cy = size / 2
  const circ = 2 * Math.PI * r
  let acc = 0
  return (
    <div className="flex flex-col items-center gap-5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {data.map((d, i) => {
          const pct = d.value / total
          const dash = circ * pct
          const offset = circ * (1 - acc / total) + circ * 0.25
          acc += d.value
          return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={d.color} strokeWidth={18}
            strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={offset}
            strokeLinecap="round" style={{ transition: 'all 0.5s ease' }} />
        })}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize={12} fill="var(--ink-4)" fontFamily="var(--font)" fontWeight={500}>Tổng</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize={14} fill="var(--ink)" fontFamily="var(--mono)" fontWeight={700}>{fmtCompact(total)}</text>
      </svg>
      <div className="flex flex-wrap justify-center gap-4">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--ink-3)' }}>
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: d.color }} />
            {d.label}: <span style={{ fontFamily: 'var(--mono)', fontWeight: 600, color: 'var(--ink-2)' }}>{fmtCompact(d.value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
