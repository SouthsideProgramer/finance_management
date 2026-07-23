import { useState } from 'react'
import type { Scenario } from '@/types'
import { fmt, fmtPct, fmtCompact, parseNum } from '@/utils/format'
import { ComparisonChart } from '@/components/ComparisonChart'
import { DonutChart } from '@/components/DonutChart'

interface AnalyticsPageProps { guestMode?: boolean }

export function AnalyticsPage({ guestMode }: AnalyticsPageProps) {
  const [scenarios, setScenarios] = useState<Scenario[]>([
    { id: 'A', label: 'Gửi bên A', rate: 7, principal: 100000000, monthly: 5000000, color: '#4F46E5', enabled: true },
    { id: 'B', label: 'Gửi bên B', rate: 12, principal: 100000000, monthly: 5000000, color: '#F59E0B', enabled: true },
    { id: 'C', label: 'Gửi bên C', rate: 15, principal: 100000000, monthly: 5000000, color: '#16A34A', enabled: false },
  ])
  const [inflationRate, setInflationRate] = useState(3.5)
  const [inflationEnabled, setInflationEnabled] = useState(true)
  const [analysisYears, setAnalysisYears] = useState(10)
  const [taxRate, setTaxRate] = useState(0)
  const [infInput, setInfInput] = useState('3.5')
  const [taxInput, setTaxInput] = useState('0')
  const [yearsInput, setYearsInput] = useState('10')

  if (guestMode) {
    return (
      <div className="page-shell">
        <div className="page-hero">
          <div className="page-hero-grid">
            <div>
              <div className="pill-label">Phân tích đầu tư</div>
              <h1 className="hero-title">Chế độ khách — dữ liệu phân tích bị ẩn</h1>
              <div className="hero-subtitle">Bạn đang xem dưới chế độ guest, nên các kịch bản đầu tư sẽ không hiển thị.</div>
            </div>
            <div className="metric-tile">
              <div className="text-[11px] uppercase tracking-[0.18em] mb-1" style={{ color: 'var(--ink-4)' }}>Tổng vốn</div>
              <div className="text-[18px] font-black" style={{ fontFamily: 'var(--mono)', color: 'var(--ink)' }}>—</div>
            </div>
          </div>
        </div>

        <div className="card card-panel" style={{ padding: 24 }}>
          <div className="section-title">📌 Thông tin ẩn</div>
          <p className="footnote" style={{ marginTop: 12, color: 'var(--ink-4)' }}>
            Đăng nhập để xem các kịch bản, biểu đồ và so sánh đầu tư.
          </p>
        </div>
      </div>
    )
  }

  const active = scenarios.filter(s => s.enabled)
  const hasInflation = inflationEnabled && inflationRate > 0

  function toggleScenario(id: string) {
    setScenarios(p => p.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s))
  }
  function updateScenario(id: string, key: keyof Scenario, val: number) {
    setScenarios(p => p.map(s => s.id === id ? { ...s, [key]: val } : s))
  }

  const results = active.map(s => {
    const r = s.rate / 100, mr = r / 12, m = analysisYears * 12
    const nominal = mr === 0
      ? s.principal * Math.pow(1 + r, analysisYears) + s.monthly * m
      : s.principal * Math.pow(1 + r, analysisYears) + s.monthly * ((Math.pow(1 + mr, m) - 1) / mr) * (1 + mr)
    const invested = s.principal + s.monthly * m
    const real = hasInflation ? nominal / Math.pow(1 + inflationRate / 100, analysisYears) : nominal
    const inflationLoss = hasInflation ? nominal - real : 0
    return { ...s, nominal, invested, real, profit: nominal - invested, inflationLoss }
  })

  const totalInvested = results.reduce((s, r) => s + r.invested, 0)
  const totalProfit = results.reduce((s, r) => s + r.profit, 0)
  const totalInflationLoss = results.reduce((s, r) => s + r.inflationLoss, 0)

  const winner = results.length >= 2 ? results.reduce((a, b) => b.real > a.real ? b : a) : null
  const loser = results.length >= 2 ? results.reduce((a, b) => b.real < a.real ? b : a) : null
  const yearDiff = winner && loser && winner.real !== loser.real
    ? ((winner.real - loser.real) / (loser.profit || 1) * analysisYears * 0.1).toFixed(1)
    : null

  return (
    <div className="page-shell">
      <div className="page-hero">
        <div className="page-hero-grid">
          <div>
            <div className="pill-label">Phân tích đầu tư</div>
            <h1 className="hero-title">Theo dõi tăng trưởng theo nhiều kịch bản</h1>
            <div className="hero-subtitle">Tùy chỉnh lãi suất, thời gian và lạm phát để đánh giá đúng sức mạnh của từng chiến lược tài chính.</div>
          </div>
          <div className="grid gap-3">
            <div className="metric-tile">
              <div className="text-[11px] uppercase tracking-[0.18em] mb-1" style={{ color: 'var(--ink-4)' }}>Tổng vốn</div>
              <div className="text-[18px] font-black" style={{ fontFamily: 'var(--mono)', color: 'var(--ink)' }}>{fmtCompact(totalInvested)}</div>
            </div>
            <div className="metric-tile">
              <div className="text-[11px] uppercase tracking-[0.18em] mb-1" style={{ color: 'var(--ink-4)' }}>Lợi nhuận</div>
              <div className="text-[18px] font-black" style={{ fontFamily: 'var(--mono)', color: 'var(--success)' }}>+{fmtCompact(totalProfit)}</div>
            </div>
            <div className="metric-tile">
              <div className="text-[11px] uppercase tracking-[0.18em] mb-1" style={{ color: 'var(--ink-4)' }}>Giảm giá trị thực</div>
              <div className="text-[18px] font-black" style={{ fontFamily: 'var(--mono)', color: '#EF4444' }}>-{fmtCompact(totalInflationLoss)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="layout">
        <div className="sidebar flex flex-col gap-5">
          <div className="card card-panel" style={{ padding: 20 }}>
            <div className="section-title mb-4">
              <span>🎯 Chọn kịch bản so sánh</span>
            </div>
            <div className="flex flex-col gap-3">
              {scenarios.map(s => (
                <div key={s.id} className="rounded-xl p-3.5 transition-all duration-200" style={{ background: s.enabled ? `${s.color}08` : 'var(--inset)', border: `1.5px solid ${s.enabled ? s.color + '30' : 'var(--ink-5)'}` }}>
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input type="checkbox" checked={s.enabled} onChange={() => toggleScenario(s.id)}
                        className="w-4 h-4 rounded accent-current" style={{ accentColor: s.color }} />
                      <span className="text-[12px] font-semibold" style={{ color: s.enabled ? 'var(--ink)' : 'var(--ink-4)' }}>{s.label}</span>
                    </label>
                    <div className="w-3 h-3 rounded-full" style={{ background: s.color, opacity: s.enabled ? 1 : 0.3 }} />
                  </div>
                  {s.enabled && (
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <div>
                        <div className="text-[10px] mb-1 font-medium" style={{ color: 'var(--ink-4)' }}>Lãi suất</div>
                        <div className="relative">
                          <input type="text" inputMode="decimal" value={s.rate}
                            onChange={e => updateScenario(s.id, 'rate', Number(e.target.value) || 0)}
                            className="w-full h-9 px-3 rounded-lg text-[12px] font-semibold outline-none"
                            style={{ fontFamily: 'var(--mono)', background: 'var(--surface)', border: '1px solid var(--ink-5)', color: 'var(--ink)' }} />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px]" style={{ color: 'var(--ink-4)' }}>%</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] mb-1 font-medium" style={{ color: 'var(--ink-4)' }}>Vốn gốc</div>
                        <div className="relative">
                          <input type="text" inputMode="numeric" value={fmt(s.principal)}
                            onChange={e => updateScenario(s.id, 'principal', parseNum(e.target.value))}
                            className="w-full h-9 px-3 rounded-lg text-[12px] font-semibold outline-none"
                            style={{ fontFamily: 'var(--mono)', background: 'var(--surface)', border: '1px solid var(--ink-5)', color: 'var(--ink)' }} />
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-[10px] mb-1 font-medium" style={{ color: 'var(--ink-4)' }}>Gửi hàng tháng</div>
                        <div className="relative">
                          <input type="text" inputMode="numeric" value={fmt(s.monthly)}
                            onChange={e => updateScenario(s.id, 'monthly', parseNum(e.target.value))}
                            className="w-full h-9 px-3 rounded-lg text-[12px] font-semibold outline-none"
                            style={{ fontFamily: 'var(--mono)', background: 'var(--surface)', border: '1px solid var(--ink-5)', color: 'var(--ink)' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="card card-panel" style={{ padding: 20 }}>
            <div className="section-title mb-4">
              <span>⚙️ Biến số nâng cao</span>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-medium" style={{ color: 'var(--ink-3)' }}>Lạm phát dự kiến</span>
                  <button onClick={() => setInflationEnabled(v => !v)}
                    className="w-10 h-5.5 rounded-full relative cursor-pointer border-none transition-all duration-200"
                    style={{ height: 22, background: inflationEnabled ? '#4F46E5' : 'var(--ink-5)' }}>
                    <div className="w-4 h-4 rounded-full bg-white absolute top-[3px] transition-all duration-200"
                      style={{ left: inflationEnabled ? '22px' : '3px', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }} />
                  </button>
                </div>
                {inflationEnabled && (
                  <div className="relative">
                    <input type="text" inputMode="decimal" value={infInput}
                      onChange={e => setInfInput(e.target.value)}
                      onBlur={() => { const v = Number(infInput); if (!isNaN(v) && v >= 0) setInflationRate(Math.min(30, v)) }}
                      onFocus={() => setInfInput(String(inflationRate))}
                      className="w-full h-10 px-3 pr-8 rounded-xl text-[13px] font-semibold outline-none"
                      style={{ fontFamily: 'var(--mono)', background: 'var(--inset)', border: '1.5px solid transparent', color: 'var(--ink)' }} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px]" style={{ color: 'var(--ink-4)' }}>%/năm</span>
                  </div>
                )}
              </div>
              <div>
                <div className="text-[12px] font-medium mb-2" style={{ color: 'var(--ink-3)' }}>Thời gian phân tích</div>
                <div className="relative">
                  <input type="text" inputMode="numeric" value={yearsInput}
                    onChange={e => setYearsInput(e.target.value)}
                    onBlur={() => { const v = Number(yearsInput); if (!isNaN(v) && v > 0) setAnalysisYears(Math.min(40, Math.max(1, v))) }}
                    onFocus={() => setYearsInput(String(analysisYears))}
                    className="w-full h-10 px-3 pr-8 rounded-xl text-[13px] font-semibold outline-none"
                    style={{ fontFamily: 'var(--mono)', background: 'var(--inset)', border: '1.5px solid transparent', color: 'var(--ink)' }} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px]" style={{ color: 'var(--ink-4)' }}>năm</span>
                </div>
              </div>
              <div>
                <div className="text-[12px] font-medium mb-2" style={{ color: 'var(--ink-3)' }}>Thuế / Phí đầu tư</div>
                <div className="relative">
                  <input type="text" inputMode="decimal" value={taxInput}
                    onChange={e => setTaxInput(e.target.value)}
                    onBlur={() => { const v = Number(taxInput); if (!isNaN(v) && v >= 0) setTaxRate(Math.min(50, v)) }}
                    onFocus={() => setTaxInput(String(taxRate))}
                    className="w-full h-10 px-3 pr-8 rounded-xl text-[13px] font-semibold outline-none"
                    style={{ fontFamily: 'var(--mono)', background: 'var(--inset)', border: '1.5px solid transparent', color: 'var(--ink)' }} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px]" style={{ color: 'var(--ink-4)' }}>%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="content flex flex-col" style={{ gap: 24 }}>
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            {results.map(r => (
              <div key={r.id} className="stat-card" style={{ borderTop: `3px solid ${r.color}` }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: r.color }} />
                  <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--ink-4)' }}>{r.label}</span>
                </div>
                <div className="text-[20px] font-black mb-1" style={{ fontFamily: 'var(--mono)', color: 'var(--ink)', letterSpacing: '-0.03em' }}>{fmtCompact(r.nominal)}</div>
                {hasInflation && <div className="text-[11px] mb-2" style={{ color: 'var(--ink-4)' }}>Thực: <span style={{ fontFamily: 'var(--mono)', fontWeight: 600, color: 'var(--ink-3)' }}>{fmtCompact(r.real)}</span></div>}
                <div className="flex items-center gap-3 text-[11px] mt-2 pt-2" style={{ borderTop: '1px solid var(--ink-5)' }}>
                  <span style={{ color: 'var(--success)', fontFamily: 'var(--mono)', fontWeight: 600 }}>+{fmtCompact(r.profit)}</span>
                  {hasInflation && r.inflationLoss > 0 && <span style={{ color: '#EF4444', fontFamily: 'var(--mono)', fontWeight: 600, opacity: 0.7 }}>-{fmtCompact(r.inflationLoss)} lạm phát</span>}
                </div>
              </div>
            ))}
          </div>

          <div className="card card-panel" style={{ padding: 20 }}>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-5">
              <span className="text-[13px] font-semibold" style={{ color: 'var(--ink-2)' }}>📈 So sánh tăng trưởng</span>
              <div className="flex flex-wrap gap-3 text-[11px] items-center" style={{ color: 'var(--ink-4)', fontFamily: 'var(--mono)' }}>
                {active.map(s => (
                  <span key={s.id} className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded-sm inline-block" style={{ background: s.color }} />{s.label}</span>
                ))}
                {hasInflation && <span className="flex items-center gap-1.5"><span className="w-3 h-0 border border-dashed rounded-sm inline-block" style={{ borderColor: '#EF4444' }} />Lạm phát</span>}
              </div>
            </div>
            <ComparisonChart scenarios={scenarios} years={analysisYears} inflationRate={inflationRate} />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="card card-panel" style={{ padding: 20 }}>
              <div className="text-[13px] font-semibold mb-4" style={{ color: 'var(--ink-2)' }}>🍕 Cơ cấu dòng tiền</div>
              <DonutChart data={[
                { label: 'Vốn gốc', value: totalInvested, color: '#94A3B8' },
                { label: 'Lợi nhuận', value: Math.max(0, totalProfit), color: '#4F46E5' },
                ...(hasInflation && totalInflationLoss > 0 ? [{ label: 'Lạm phát ăn mòn', value: totalInflationLoss, color: '#EF4444' }] : []),
              ]} />
            </div>

            <div className="card card-panel flex flex-col" style={{ padding: 20 }}>
              <div className="text-[13px] font-semibold mb-4" style={{ color: 'var(--ink-2)' }}>💡 Gợi ý từ AI</div>
              <div className="flex-1 rounded-xl p-4" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                {winner && loser && winner.id !== loser.id ? (
                  <div className="space-y-3">
                    <div className="text-[13px] font-semibold" style={{ color: '#78350F' }}>
                      Kịch bản {winner.label} ({winner.rate}%) giúp bạn đạt mục tiêu nhanh hơn {yearDiff} năm so với {loser.label}.
                    </div>
                    <div className="text-[12px]" style={{ color: '#92400E' }}>
                      Tuy nhiên, lợi nhuận thực ({fmtCompact(winner.real)}) đã điều chỉnh lạm phát thấp hơn đáng kể so với danh nghĩa ({fmtCompact(winner.nominal)}).
                    </div>
                    {hasInflation && (
                      <div className="text-[12px]" style={{ color: '#92400E' }}>
                        Lạm phát {fmtPct(inflationRate)}/năm làm giảm sức mua tổng cộng {fmtCompact(totalInflationLoss)} across tất cả kịch bản.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-[12px]" style={{ color: '#92400E' }}>
                    Bật ít nhất 2 kịch bản để nhận gợi ý so sánh chi tiết từ AI.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
