import type { UserProfile } from '@/services/api'

interface UserInfoCardProps {
  color: string
  showCardNumber: boolean
  toggleCard: () => void
  showBalance: boolean
  toggleBalance: () => void
  user: UserProfile | null
}

export function UserInfoCard({ color, showCardNumber, toggleCard, showBalance, toggleBalance, user }: UserInfoCardProps) {
  const name = user?.name || user?.fullName || 'Người dùng'
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2) || 'U'
  const tier = user?.membership || 'FREE'
  const card = user?.primaryCard

  return (
    <div className="card-soft" style={{ padding: '16px', width: '100%' }}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-[20px] flex items-center justify-center text-white text-xl font-bold" style={{ background: color }}>{initials}</div>
          <div>
            <div className="text-sm font-semibold" style={{ color: 'var(--ink-2)' }}>{name}</div>
            <div className="text-[12px] font-medium" style={{ color: 'var(--ink-4)' }}>Khách hàng {tier}</div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 text-right">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em]" style={{ color: 'var(--ink-4)' }}>Số dư</div>
            <div className="text-lg font-semibold" style={{ color: 'var(--ink-2)' }}>{showBalance ? '***' : '••••••••'}</div>
          </div>
          <button type="button" onClick={toggleBalance}
            className="rounded-full p-2"
            style={{ background: 'rgba(15,23,42,0.04)', border: '1px solid var(--ink-5)', color: 'var(--ink-3)' }}>
            {showBalance ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1l22 22"/><path d="M17.94 17.94A10.06 10.06 0 0 1 12 20c-5 0-9.27-3-11-7 1.02-2.29 2.75-4.18 4.85-5.24"/><path d="M3.6 3.6A9.99 9.99 0 0 1 12 4c5 0 9.27 3 11 7-1.01 2.28-2.75 4.17-4.83 5.22"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
            )}
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        {card ? (
          <>
            <div className="stat-card" style={{ padding: '14px' }}>
              <div className="flex items-center justify-between gap-3">
                <div className="stat-label">Số thẻ</div>
                <button type="button" onClick={toggleCard}
                  className="rounded-full p-2"
                  style={{ background: 'rgba(15,23,42,0.04)', border: '1px solid var(--ink-5)', color: 'var(--ink-3)' }}>
                  {showCardNumber ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1l22 22"/><path d="M17.94 17.94A10.06 10.06 0 0 1 12 20c-5 0-9.27-3-11-7 1.02-2.29 2.75-4.18 4.85-5.24"/><path d="M3.6 3.6A9.99 9.99 0 0 1 12 4c5 0 9.27 3 11 7-1.01 2.28-2.75 4.17-4.83 5.22"/></svg>
                  )}
                </button>
              </div>
              <div className="stat-value" style={{ fontSize: '0.98rem' }}>{showCardNumber ? card.maskedCardNumber : card.maskedCardNumber}</div>
              <div className="stat-note">Hết hạn {card.expDate}</div>
            </div>
            <div className="stat-card" style={{ padding: '14px' }}>
              <div className="stat-label">Ngân hàng</div>
              <div className="stat-value" style={{ fontSize: '0.98rem' }}>{card.bankName}</div>
              <div className="stat-note">Thẻ chính</div>
            </div>
          </>
        ) : (
          <div className="stat-card" style={{ padding: '14px', textAlign: 'center' }}>
            <div className="text-[12px]" style={{ color: 'var(--ink-4)' }}>Chưa liên kết thẻ ngân hàng</div>
            <div className="text-[11px] mt-1" style={{ color: 'var(--ink-4)' }}>Thêm thẻ tại Cài đặt</div>
          </div>
        )}
      </div>
    </div>
  )
}
