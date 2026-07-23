import { useState, useCallback, useMemo } from 'react'
import type { CalcMode, CalcState, TimeUnit } from '@/types'
import { MODES } from '@/utils/constants'
import { fmt, fmtVND, fmtPct, parseNum, rateToAnnual, timeToYears, convertRate } from '@/utils/format'
import { calcCompound, calcSimple, calcSIP, calcEMI, calcGoal, getYearlyData } from '@/utils/math'
import { useCountUp } from '@/hooks/useCountUp'
import { Slider } from '@/components/Slider'
import { Chart } from '@/components/Chart'
import { TimeUnitSelector } from '@/components/TimeUnitSelector'
import { UserInfoCard } from '@/components/UserInfoCard'
import type { UserProfile } from '@/services/api'

interface DashboardProps {
  mode: CalcMode
  setMode: (m: CalcMode) => void
  timeUnit: TimeUnit
  setTimeUnit: (u: TimeUnit) => void
  showBalance: boolean
  setShowBalance: (v: boolean) => void
  guestMode?: boolean
  user: UserProfile | null
}

export function Dashboard({ mode, setMode, timeUnit, setTimeUnit, showBalance, setShowBalance, guestMode, user }: DashboardProps) {
  const [state, setState] = useState<CalcState>({
    principal: 0, rate: 0, time: 0, frequency: 12, monthly: 0,
    goalAmount: 0, loanAmount: 0, loanRate: 0, loanTenure: 0,
  })
  const [copied, setCopied] = useState(false)
  const [showCardNumber, setShowCardNumber] = useState(false)
  const set = useCallback((k: keyof CalcState, v: number) => setState(p => ({ ...p, [k]: v })), [])
  const activeMode = MODES.find(m => m.id === mode)!
  const yearlyData = getYearlyData(mode, state, timeUnit)
  const c = activeMode.color
  const timeUnitLabel = timeUnit === 'year' ? 'năm' : timeUnit === 'quarter' ? 'quý' : 'tháng'
  const rateUnit = timeUnit === 'year' ? '%/năm' : timeUnit === 'quarter' ? '%/quý' : '%/tháng'
  const timeMax = timeUnit === 'month' ? 120 : 40

  const hero = useMemo(() => {
    let heroLabel = '', heroSubLabel: string | undefined, heroValue = 0, heroGain = 0
    let heroGainPct = 0, heroGainLabel = '', heroPrincipalLabel = '', heroPrincipalValue = 0
    let heroMultiplier = '', heroInsight = ''

    if (mode === 'compound') {
      const annualRate = rateToAnnual(state.rate, timeUnit)
      const years = timeToYears(state.time, timeUnit)
      const r = calcCompound(state.principal, annualRate, years, state.frequency)
      heroLabel = 'Tổng giá trị cuối kỳ'; heroValue = r.amount; heroGain = r.interest
      heroGainPct = state.principal > 0 ? (r.interest / state.principal) * 100 : 0; heroGainLabel = 'Tiền lãi'
      heroPrincipalLabel = 'Vốn gốc'; heroPrincipalValue = state.principal
      heroMultiplier = state.principal > 0 ? `Gấp ${(r.amount / state.principal).toFixed(2)} lần vốn` : ''
      heroInsight = annualRate > 0 ? `Nhân đôi sau ~${(72 / annualRate).toFixed(1)} năm · Lãi chiếm ${r.amount > 0 ? fmtPct((r.interest / r.amount) * 100) : '0%'}` : 'Nhập lãi suất để xem phân tích'
    } else if (mode === 'simple') {
      const annualRate = rateToAnnual(state.rate, timeUnit)
      const years = timeToYears(state.time, timeUnit)
      const r = calcSimple(state.principal, annualRate, years)
      heroLabel = 'Tổng giá trị cuối kỳ'; heroValue = r.amount; heroGain = r.interest
      heroGainPct = state.principal > 0 ? (r.interest / state.principal) * 100 : 0; heroGainLabel = 'Tiền lãi'
      heroPrincipalLabel = 'Vốn gốc'; heroPrincipalValue = state.principal
      heroMultiplier = state.principal > 0 ? `Gấp ${(r.amount / state.principal).toFixed(2)} lần vốn` : ''
      heroInsight = state.time > 0 ? `Mỗi ${timeUnitLabel} nhận ${fmtVND(r.interest / state.time)} lãi cố định` : 'Nhập thời gian để xem phân tích'
    } else if (mode === 'sip') {
      const annualRate = rateToAnnual(state.rate, timeUnit)
      const years = timeToYears(state.time, timeUnit)
      const r = calcSIP(state.monthly, annualRate, years)
      heroLabel = state.time > 0 ? `Tích lũy sau ${state.time} ${timeUnitLabel}` : 'Tích lũy'; heroValue = r.amount; heroGain = r.returns
      heroGainPct = r.invested > 0 ? (r.returns / r.invested) * 100 : 0; heroGainLabel = 'Lợi nhuận'
      heroPrincipalLabel = 'Đã góp'; heroPrincipalValue = r.invested
      heroMultiplier = r.invested > 0 ? `Hệ số nhân ${(r.amount / r.invested).toFixed(2)}x` : ''
      heroInsight = `Sớm 5 năm: thêm ${fmtVND(calcSIP(state.monthly, annualRate, years + 5).amount - r.amount)}`
    } else if (mode === 'emi') {
      const annualRate = rateToAnnual(state.loanRate, timeUnit)
      const years = timeToYears(state.loanTenure, timeUnit)
      const r = calcEMI(state.loanAmount, annualRate, years)
      heroLabel = 'Trả hàng tháng'; heroSubLabel = `Vay ${fmtVND(state.loanAmount)} · ${state.loanTenure} ${timeUnitLabel}`
      heroValue = r.emi; heroGain = r.totalInterest
      heroGainPct = state.loanAmount > 0 ? (r.totalInterest / state.loanAmount) * 100 : 0; heroGainLabel = 'Tổng lãi'
      heroPrincipalLabel = 'Khoản vay'; heroPrincipalValue = state.loanAmount
      heroMultiplier = `Tổng trả ${fmtVND(r.totalPayment)}`
      heroInsight = r.totalPayment > 0 ? `Lãi ${fmtPct((r.totalInterest / r.totalPayment) * 100)} tổng thanh toán` : 'Nhập khoản vay để xem phân tích'
    } else {
      const annualRate = rateToAnnual(state.rate, timeUnit)
      const years = timeToYears(state.time, timeUnit)
      const r = calcGoal(state.goalAmount, annualRate, years)
      heroLabel = 'Cần gửi hàng tháng'; heroSubLabel = `Mục tiêu ${fmtVND(state.goalAmount)} sau ${state.time} ${timeUnitLabel}`
      heroValue = r.sip; heroGain = Math.max(0, r.returns)
      heroGainPct = state.goalAmount > 0 ? (Math.max(0, r.returns) / state.goalAmount) * 100 : 0; heroGainLabel = 'Lợi nhuận'
      heroPrincipalLabel = 'Mục tiêu'; heroPrincipalValue = state.goalAmount
      heroMultiplier = `Góp ${fmtVND(r.totalInvested)} trong ${state.time} ${timeUnitLabel}`
      heroInsight = `Thị trường đóng góp ${fmtVND(Math.max(0, r.returns))}`
    }

    return { heroLabel, heroSubLabel, heroValue, heroGain, heroGainPct, heroGainLabel, heroPrincipalLabel, heroPrincipalValue, heroMultiplier, heroInsight }
  }, [mode, state, timeUnit, timeUnitLabel])

  const animatedValue = useCountUp(hero.heroValue, 450)
  const animatedGain = useCountUp(hero.heroGain, 450)

  if (guestMode) {
    return (
      <div className="page-shell">
        <div className="page-hero card hero-card">
          <div className="page-hero-grid">
            <div>
              <div className="pill-label">Chế độ khách</div>
              <h1 className="hero-title">Dữ liệu tài chính đang bị ẩn</h1>
              <div className="hero-subtitle">Bạn đang ở chế độ guest, nên mọi thông tin cá nhân và báo cáo đều không được nạp.</div>
            </div>
            <div className="metric-tile">
              <div className="text-[11px] uppercase tracking-[0.18em] mb-1" style={{ color: 'var(--ink-4)' }}>Tổng giá trị</div>
              <div className="text-[18px] font-black" style={{ fontFamily: 'var(--mono)', color: 'var(--ink)' }}>—</div>
            </div>
          </div>
        </div>

        <div className="card card-panel">
          <div className="text-[15px] font-semibold" style={{ color: 'var(--ink)' }}>Nội dung ẩn</div>
          <p className="footnote" style={{ marginTop: 12, color: 'var(--ink-4)' }}>
            Đăng nhập để xem biểu đồ, lịch sử giao dịch và các tính toán tài chính cá nhân.
          </p>
        </div>
      </div>
    )
  }

  function handleCopy() {
    const text = [`${hero.heroLabel}: ${fmtVND(hero.heroValue)}`, hero.heroSubLabel || '', `${hero.heroPrincipalLabel}: ${fmtVND(hero.heroPrincipalValue)}`, `${hero.heroGainLabel}: ${fmtVND(hero.heroGain)} (+${fmtPct(hero.heroGainPct)})`, hero.heroMultiplier, hero.heroInsight].filter(Boolean).join('\n')
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  function renderInputs() {
    if (mode === 'compound' || mode === 'simple') return (
      <>
        <Slider label="Vốn gốc" value={state.principal} onChange={v => set('principal', v)} min={0} max={500000000} step={1000000} formatDisplay={v => fmt(v)} parseInput={parseNum} unit="VNĐ" color={c} />
        <Slider label={`Lãi suất / ${timeUnitLabel}`} value={state.rate} onChange={v => set('rate', v)} min={0} max={30} step={0.5} formatDisplay={v => `${v}`} unit={rateUnit} color={c} />
        <Slider label="Thời gian" value={state.time} onChange={v => set('time', v)} min={0} max={timeMax} step={1} formatDisplay={v => `${v}`} unit={timeUnitLabel} color={c} />
        <TimeUnitSelector unit={timeUnit} onChange={u => { setState(p => ({ ...p, rate: convertRate(p.rate, timeUnit, u) })); setTimeUnit(u) }} color={c} />
      </>
    )
    if (mode === 'sip') return (
      <>
        <Slider label="Gửi hàng tháng" value={state.monthly} onChange={v => set('monthly', v)} min={0} max={50000000} step={500000} formatDisplay={v => fmt(v)} parseInput={parseNum} unit="VNĐ" color={c} />
        <Slider label={`Lãi suất / ${timeUnitLabel}`} value={state.rate} onChange={v => set('rate', v)} min={0} max={30} step={0.5} formatDisplay={v => `${v}`} unit={rateUnit} color={c} />
        <Slider label="Thời gian" value={state.time} onChange={v => set('time', v)} min={0} max={timeMax} step={1} formatDisplay={v => `${v}`} unit={timeUnitLabel} color={c} />
        <TimeUnitSelector unit={timeUnit} onChange={u => { setState(p => ({ ...p, rate: convertRate(p.rate, timeUnit, u) })); setTimeUnit(u) }} color={c} />
      </>
    )
    if (mode === 'emi') return (
      <>
        <Slider label="Số tiền vay" value={state.loanAmount} onChange={v => set('loanAmount', v)} min={0} max={2000000000} step={5000000} formatDisplay={v => fmt(v)} parseInput={parseNum} unit="VNĐ" color={c} />
        <Slider label={`Lãi suất / ${timeUnitLabel}`} value={state.loanRate} onChange={v => set('loanRate', v)} min={0} max={36} step={0.25} formatDisplay={v => `${v}`} unit={rateUnit} color={c} />
        <Slider label="Kỳ hạn vay" value={state.loanTenure} onChange={v => set('loanTenure', v)} min={0} max={timeUnit === 'month' ? 360 : timeUnit === 'quarter' ? 120 : 30} step={1} formatDisplay={v => `${v}`} unit={timeUnitLabel} color={c} />
        <TimeUnitSelector unit={timeUnit} onChange={u => { setState(p => ({ ...p, loanRate: convertRate(p.loanRate, timeUnit, u) })); setTimeUnit(u) }} color={c} />
      </>
    )
    return (
      <>
        <Slider label="Mục tiêu tích lũy" value={state.goalAmount} onChange={v => set('goalAmount', v)} min={0} max={5000000000} step={50000000} formatDisplay={v => fmt(v)} parseInput={parseNum} unit="VNĐ" color={c} />
        <Slider label={`Lãi suất kỳ vọng / ${timeUnitLabel}`} value={state.rate} onChange={v => set('rate', v)} min={0} max={30} step={0.5} formatDisplay={v => `${v}`} unit={rateUnit} color={c} />
        <Slider label="Thời gian" value={state.time} onChange={v => set('time', v)} min={0} max={timeMax} step={1} formatDisplay={v => `${v}`} unit={timeUnitLabel} color={c} />
        <TimeUnitSelector unit={timeUnit} onChange={u => { setState(p => ({ ...p, rate: convertRate(p.rate, timeUnit, u) })); setTimeUnit(u) }} color={c} />
      </>
    )
  }

  return (
    <>
      <div className="hero-header">
        <div />
      </div>

      <div className="tab-group mb-10">
        {MODES.map(m => {
          const active = m.id === mode
          return (
            <button key={m.id} onClick={() => setMode(m.id)}
              className="relative h-11 cursor-pointer transition-all duration-200 text-[13px] font-medium border-none"
              style={{ fontFamily: 'var(--font)', background: active ? 'var(--surface)' : 'transparent', color: active ? 'var(--ink)' : 'var(--ink-4)', boxShadow: active ? 'var(--shadow-xs)' : 'none', fontWeight: active ? 600 : 500 }}>
              {m.label}
              {active && <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ background: m.color }} />}
            </button>
          )
        })}
      </div>

      <div className="layout">
        {/* Sidebar */}
        <div className="sidebar card card-panel">
          <div className="mb-5">
            <UserInfoCard
              color={c}
              showCardNumber={showCardNumber}
              toggleCard={() => setShowCardNumber(v => !v)}
              showBalance={showBalance}
              toggleBalance={() => setShowBalance(!showBalance)}
              user={user}
            />
          </div>
          <div className="section-title" style={{ marginBottom: '22px' }}>
            <span>Thông số</span>
          </div>
          {renderInputs()}
          <button
            onClick={() => document.getElementById('hero-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="button-primary"
            style={{ background: c, boxShadow: `0 4px 18px ${c}40`, color: 'white' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 6px 22px ${c}50` }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 4px 18px ${c}40` }}>
            Tính kết quả
          </button>
        </div>

        {/* Content */}
        <div className="content flex flex-col" style={{ gap: '28px' }}>
          {/* Hero */}
          <div id="hero-card" className="card hero-card anim-fade">
            <div className="text-[11px] font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--ink-4)' }}>{hero.heroLabel}</div>
            {hero.heroSubLabel && <div className="text-[13px] mb-2" style={{ color: 'var(--ink-3)' }}>{hero.heroSubLabel}</div>}
            <div className="mb-2">
              <div className="font-black leading-none tracking-tight" style={{ fontFamily: 'var(--mono)', fontSize: 'clamp(44px, 7vw, 64px)', color: 'var(--ink)', letterSpacing: '-0.035em' }}>
                {fmtVND(animatedValue)}
              </div>
              <div className="text-[13px] mt-2 font-medium" style={{ color: 'var(--ink-4)' }}>
                {mode === 'emi' ? '' : `Sau ${state.time} ${timeUnitLabel}`}
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 gap-3 mb-6 md:grid-cols-3">
              <div className="stat-card">
                <div className="stat-label">{hero.heroPrincipalLabel}</div>
                <div className="stat-value" style={{ color: 'var(--ink-2)' }}>{fmtVND(hero.heroPrincipalValue)}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">{hero.heroGainLabel}</div>
                <div className="stat-value" style={{ color: 'var(--success)' }}>{fmtVND(animatedGain)}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">ROI</div>
                <div className="stat-value" style={{ color: 'var(--success)' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                    {fmtPct(hero.heroGainPct)}
                  </span>
                </div>
              </div>
            </div>

            {/* Insight - notification style */}
            {hero.heroMultiplier && (
              <div className="card-soft mb-5" style={{ padding: '20px', border: '1px solid #FDE68A', background: '#FFFBEB' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[13px]">💡</span>
                  <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#92400E' }}>Phân tích</span>
                </div>
                <div className="space-y-1">
                  <div className="text-[13px] font-semibold" style={{ color: '#78350F' }}>{hero.heroMultiplier}</div>
                  <div className="text-[12px]" style={{ color: '#92400E' }}>{hero.heroInsight}</div>
                </div>
              </div>
            )}

            {/* Copy button */}
            <button onClick={handleCopy}
              className="button-primary"
              style={{
                marginTop: '18px',
                background: copied ? 'var(--success)' : '#2563EB',
                boxShadow: copied ? '0 4px 18px rgba(34,197,94,0.25)' : '0 4px 18px rgba(37,99,235,0.25)',
                color: 'white',
                border: '1px solid transparent',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = copied ? '0 6px 22px rgba(34,197,94,0.30)' : '0 6px 22px rgba(37,99,235,0.35)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = copied ? '0 4px 18px rgba(34,197,94,0.25)' : '0 4px 18px rgba(37,99,235,0.25)' }}>
              {copied ? '✓ Đã sao chép' : '📋 Sao chép kết quả'}
            </button>
          </div>

          {/* Chart */}
          <div className="card card-panel">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-5">
              <span className="text-[13px] font-semibold" style={{ color: 'var(--ink-2)' }}>{mode === 'emi' ? 'Số dư nợ' : 'Tăng trưởng'}</span>
              <div className="flex gap-4 text-[12px] items-center" style={{ color: 'var(--ink-4)', fontFamily: 'var(--mono)' }}>
                <span className="flex items-center gap-1.5"><span className="w-3.5 h-0.5 rounded-sm inline-block" style={{ background: c }} />Giá trị</span>
                {yearlyData.some(d => d.base > 0) && <span className="flex items-center gap-1.5"><span className="w-3.5 h-0 border border-dashed rounded-sm inline-block" style={{ borderColor: '#C4B5FD' }} />Vốn</span>}
              </div>
            </div>
            <Chart data={yearlyData} color={c} timeUnit={timeUnit} />
            <div className="mt-4 pt-4 text-center text-[12px] footnote">
              Kết quả mang tính tham khảo. Lãi suất thực tế có thể thay đổi tùy điều kiện thị trường.
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
