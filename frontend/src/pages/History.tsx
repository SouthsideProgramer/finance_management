import { useState, useEffect } from 'react'
import { transactionAPI, type Transaction } from '@/services/api'
import { fmtVND } from '@/utils/format'

interface HistoryPageProps { guestMode?: boolean }

export function HistoryPage({ guestMode }: HistoryPageProps) {
  const [txns, setTxns] = useState<Transaction[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<'all' | 'deposit' | 'withdraw'>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (guestMode) return
    setLoading(true)
    transactionAPI.list({ type: filter === 'all' ? undefined : filter, page, limit: 20 })
      .then(d => { setTxns(d.data); setTotal(d.total) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [filter, page, guestMode])

  if (guestMode) {
    return (
      <div className="page-shell">
        <div className="page-hero">
          <div className="page-hero-grid">
            <div>
              <div className="pill-label">Nhật ký dòng tiền</div>
              <h1 className="hero-title">Chế độ khách — lịch sử giao dịch bị ẩn</h1>
              <div className="hero-subtitle">Bạn không thể xem giao dịch chi tiết khi truy cập bằng guest.</div>
            </div>
            <div className="metric-tile">
              <div className="text-[11px] uppercase tracking-[0.18em] mb-1" style={{ color: 'var(--ink-4)' }}>Tổng nạp</div>
              <div className="text-[18px] font-black" style={{ fontFamily: 'var(--mono)', color: 'var(--ink)' }}>—</div>
            </div>
          </div>
        </div>

        <div className="card card-panel" style={{ padding: 24 }}>
          <div className="section-title">Lịch sử đang bị ẩn</div>
          <p className="footnote" style={{ marginTop: 12, color: 'var(--ink-4)' }}>
            Đăng nhập để xem đầy đủ lịch sử giao dịch và báo cáo chi tiết.
          </p>
        </div>
      </div>
    )
  }

  const filtered = txns.filter(t => {
    if (search && !t.id.toLowerCase().includes(search.toLowerCase()) && !(t.description || '').toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const totalDeposit = txns.filter(t => t.type === 'deposit').reduce((s, t) => s + Number(t.amount), 0)
  const totalWithdraw = txns.filter(t => t.type === 'withdraw').reduce((s, t) => s + Number(t.amount), 0)

  return (
    <div className="page-shell">
      <div className="page-hero">
        <div className="page-hero-grid">
          <div>
            <div className="pill-label">Nhật ký dòng tiền</div>
            <h1 className="hero-title">Theo dõi lịch sử giao dịch một cách rõ ràng</h1>
            <div className="hero-subtitle">Xem tổng nạp, tổng rút và tìm giao dịch cần kiểm tra chỉ trong vài thao tác.</div>
          </div>
          <div className="grid gap-3">
            <div className="metric-tile">
              <div className="text-[11px] uppercase tracking-[0.18em] mb-1" style={{ color: 'var(--ink-4)' }}>Tổng nạp</div>
              <div className="text-[18px] font-black" style={{ fontFamily: 'var(--mono)', color: '#16A34A' }}>+{fmtVND(totalDeposit)}</div>
            </div>
            <div className="metric-tile">
              <div className="text-[11px] uppercase tracking-[0.18em] mb-1" style={{ color: 'var(--ink-4)' }}>Tổng rút</div>
              <div className="text-[18px] font-black" style={{ fontFamily: 'var(--mono)', color: '#EF4444' }}>-{fmtVND(totalWithdraw)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card card-panel" style={{ padding: 24 }}>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-5">
          <div>
            <div className="section-title mb-2">Lịch sử gần đây</div>
            <div className="text-[13px]" style={{ color: 'var(--ink-4)' }}>{total} giao dịch</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" placeholder="Tìm mã GD, mô tả..." value={search} onChange={e => setSearch(e.target.value)}
                className="h-10 pl-9 pr-4 rounded-xl text-[12px] outline-none"
                style={{ width: 220, fontFamily: 'var(--mono)', background: 'var(--inset)', border: '1px solid var(--ink-5)', color: 'var(--ink)' }} />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          {([
            { id: 'all' as const, label: 'Tất cả' },
            { id: 'deposit' as const, label: 'Nạp tiền' },
            { id: 'withdraw' as const, label: 'Rút tiền' },
          ]).map(f => (
            <button key={f.id} onClick={() => { setFilter(f.id); setPage(1) }}
              className="h-9 px-4 rounded-full text-[12px] font-semibold cursor-pointer transition-all duration-200 border-none"
              style={{
                fontFamily: 'var(--font)',
                background: filter === f.id ? '#4F46E5' : 'var(--inset)',
                color: filter === f.id ? 'white' : 'var(--ink-4)',
                boxShadow: filter === f.id ? '0 2px 8px rgba(79,70,229,0.3)' : 'none',
              }}>
              {f.label}
            </button>
          ))}
          <div className="flex-1" />
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--ink-5)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--inset)' }}>
                  {['Mã GD', 'Ngày', 'Loại', 'Mô tả', 'Số tiền', 'Quý', 'Trạng thái'].map(h => (
                    <th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--ink-4)', borderBottom: '1px solid var(--ink-5)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={7} className="px-4 py-16 text-center text-[13px]" style={{ color: 'var(--ink-4)' }}>Đang tải...</td></tr>
                )}
                {!loading && filtered.map(t => (
                  <tr key={t.id} className="transition-colors duration-150 cursor-default"
                    style={{ borderBottom: '1px solid var(--ink-5)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--inset)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td className="px-4 py-3.5 text-[12px] font-semibold" style={{ fontFamily: 'var(--mono)', color: 'var(--ink-3)' }}>{t.id.slice(0, 8)}</td>
                    <td className="px-4 py-3.5 text-[12px]" style={{ color: 'var(--ink-3)' }}>{new Date(t.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 h-6 px-2.5 rounded-full text-[10px] font-semibold"
                        style={t.type === 'deposit'
                          ? { background: 'rgba(22,163,74,0.08)', color: '#16A34A' }
                          : { background: 'rgba(239,68,68,0.08)', color: '#EF4444' }}>
                        {t.type === 'deposit' ? (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                        ) : (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>
                        )}
                        {t.type === 'deposit' ? 'Nạp' : 'Rút'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-[12px]" style={{ color: 'var(--ink-2)' }}>{t.description || '—'}</td>
                    <td className="px-4 py-3.5 text-[13px] font-bold" style={{ fontFamily: 'var(--mono)', color: t.type === 'deposit' ? '#16A34A' : '#EF4444' }}>
                      {t.type === 'deposit' ? '+' : '-'}{fmtVND(Number(t.amount))}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-block h-6 px-2.5 rounded-md text-[10px] font-semibold"
                        style={{ background: 'var(--inset)', color: 'var(--ink-4)', fontFamily: 'var(--mono)' }}>
                        {t.quarter || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 h-6 px-2.5 rounded-full text-[10px] font-semibold"
                        style={t.status === 'completed'
                          ? { background: 'rgba(22,163,74,0.08)', color: '#16A34A' }
                          : { background: 'rgba(245,158,11,0.08)', color: '#F59E0B' }}>
                        {t.status === 'completed' ? '✓' : '🕒'} {t.status === 'completed' ? 'Hoàn thành' : 'Đang xử lý'}
                      </span>
                    </td>
                  </tr>
                ))}
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-16 text-center text-[13px]" style={{ color: 'var(--ink-4)' }}>Không tìm thấy giao dịch nào</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
