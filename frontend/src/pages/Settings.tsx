import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { userAPI, bankAPI, type BankCard, type UserProfile } from '@/services/api'

interface SettingsProps {
  dark: boolean
  setDark: (v: boolean) => void
  showBalance: boolean
  setShowBalance: (v: boolean) => void
  guestMode?: boolean
  user: UserProfile | null
}

export function SettingsPage({ dark: _dark, setDark, showBalance, setShowBalance, guestMode, user }: SettingsProps) {
  const { updateUser } = useAuth()
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(user?.theme === 'dark' ? 'dark' : 'light')
  const [userName, setUserName] = useState(user?.fullName || '')
  const [userEmail, setUserEmail] = useState(user?.email || '')
  const [cards, setCards] = useState<BankCard[]>([])
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [loading, setLoading] = useState(false)

  // Card form
  const [showAddCard, setShowAddCard] = useState(false)
  const [cardForm, setCardForm] = useState({ bankName: '', cardNumber: '', expDate: '' })

  // Password form
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [pwdForm, setPwdForm] = useState({ current: '', newPwd: '', confirm: '' })
  const [pwdStatus, setPwdStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    if (user) {
      setUserName(user.fullName)
      setUserEmail(user.email)
      setTheme(user.theme as 'light' | 'dark' || 'light')
    }
  }, [user])

  useEffect(() => {
    if (!guestMode) {
      bankAPI.listCards().then(setCards).catch(() => {})
    }
  }, [guestMode])

  function handleThemeChange(t: 'light' | 'dark' | 'system') {
    setTheme(t)
    if (t === 'dark') setDark(true)
    else if (t === 'light') setDark(false)
    else setDark(window.matchMedia('(prefers-color-scheme: dark)').matches)
    // Persist to backend
    updateUser({ theme: t === 'system' ? 'light' : t }).catch(() => {})
  }

  async function handleSaveProfile() {
    setLoading(true)
    setSaveStatus(null)
    try {
      await updateUser({ name: userName, showBalanceDefault: showBalance })
      setSaveStatus({ type: 'success', message: 'Đã lưu thông tin!' })
    } catch (err: any) {
      setSaveStatus({ type: 'error', message: err.message || 'Lưu thất bại' })
    } finally {
      setLoading(false)
      setTimeout(() => setSaveStatus(null), 3000)
    }
  }

  async function handleAddCard() {
    if (!cardForm.bankName || !cardForm.cardNumber || !cardForm.expDate) return
    try {
      const newCard = await bankAPI.addCard(cardForm.bankName, cardForm.cardNumber, cardForm.expDate)
      setCards(prev => [...prev, newCard])
      setCardForm({ bankName: '', cardNumber: '', expDate: '' })
      setShowAddCard(false)
    } catch (err: any) {
      alert(err.message)
    }
  }

  async function handleDeleteCard(id: string) {
    try {
      await bankAPI.deleteCard(id)
      setCards(prev => prev.filter(c => c.id !== id))
    } catch (err: any) {
      alert(err.message)
    }
  }

  async function handleSetPrimary(id: string) {
    try {
      await bankAPI.setPrimary(id)
      setCards(prev => prev.map(c => ({ ...c, isPrimary: c.id === id })))
    } catch (err: any) {
      alert(err.message)
    }
  }

  async function handleChangePassword() {
    if (!pwdForm.current || !pwdForm.newPwd) return
    if (pwdForm.newPwd !== pwdForm.confirm) {
      setPwdStatus({ type: 'error', message: 'Mật khẩu mới không khớp' })
      return
    }
    try {
      await userAPI.changePassword(pwdForm.current, pwdForm.newPwd)
      setPwdStatus({ type: 'success', message: 'Đã đổi mật khẩu!' })
      setPwdForm({ current: '', newPwd: '', confirm: '' })
    } catch (err: any) {
      setPwdStatus({ type: 'error', message: err.message })
    }
    setTimeout(() => setPwdStatus(null), 3000)
  }

  const initials = userName.split(' ').map((w: string) => w[0]).join('').slice(0, 2) || 'U'

  if (guestMode) {
    return (
      <div className="page-shell">
        <div className="page-hero">
          <div className="page-hero-grid">
            <div>
              <div className="pill-label">Cài đặt tài khoản</div>
              <h1 className="hero-title">Chế độ khách — không thể thay đổi cài đặt</h1>
              <div className="hero-subtitle">Đăng nhập để quản lý thông tin cá nhân và tùy chỉnh trải nghiệm.</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-shell">
      <div className="page-hero">
        <div className="page-hero-grid">
          <div>
            <div className="pill-label">Cài đặt tài khoản</div>
            <h1 className="hero-title">Tùy chỉnh trải nghiệm theo phong cách của bạn</h1>
            <div className="hero-subtitle">Quản lý thông tin cá nhân, giao diện và mặc định đầu vào để sử dụng ứng dụng thật thuận tiện.</div>
          </div>
          <div className="metric-tile">
            <div className="text-[11px] uppercase tracking-[0.18em] mb-1" style={{ color: 'var(--ink-4)' }}>Tài khoản</div>
            <div className="text-[18px] font-black" style={{ fontFamily: 'var(--mono)', color: 'var(--ink)' }}>{userName}</div>
            <div className="text-[12px] mt-1" style={{ color: 'var(--ink-4)' }}>{userEmail}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col gap-5">
          {/* Personal Info */}
          <div className="card card-panel" style={{ padding: 24 }}>
            <div className="section-title mb-5">
              <span>👤 Cá nhân</span>
            </div>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-[20px] font-bold" style={{ background: '#4F46E5' }}>
                {initials}
              </div>
              <div>
                <div className="text-[14px] font-semibold" style={{ color: 'var(--ink)' }}>{userName}</div>
                <div className="text-[12px]" style={{ color: 'var(--ink-4)' }}>{userEmail}</div>
                <span className="inline-block mt-1.5 h-5 px-2 rounded-full text-[10px] font-semibold" style={{ background: 'rgba(79,70,229,0.08)', color: '#4F46E5' }}>{user?.membership || 'FREE'}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--ink-4)' }}>Họ và tên</label>
                <input type="text" value={userName} onChange={e => setUserName(e.target.value)}
                  className="w-full h-10 px-4 rounded-xl text-[13px] font-medium outline-none"
                  style={{ background: 'var(--inset)', border: '1px solid var(--ink-5)', color: 'var(--ink)' }} />
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--ink-4)' }}>Email</label>
                <input type="email" value={userEmail} disabled
                  className="w-full h-10 px-4 rounded-xl text-[13px] font-medium outline-none"
                  style={{ background: 'var(--inset)', border: '1px solid var(--ink-5)', color: 'var(--ink-4)', opacity: 0.6 }} />
              </div>
              <button onClick={handleSaveProfile} disabled={loading}
                className="button-primary" style={{ background: '#4F46E5', color: 'white', opacity: loading ? 0.6 : 1 }}>
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
              {saveStatus && (
                <div className={`text-[12px] font-medium ${saveStatus.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
                  {saveStatus.message}
                </div>
              )}
            </div>
          </div>

          {/* Bank Cards */}
          <div className="card card-panel" style={{ padding: 24 }}>
            <div className="section-title mb-5">
              <span>💳 Thẻ ngân hàng</span>
            </div>
            {cards.length > 0 && (
              <div className="space-y-3 mb-4">
                {cards.map(card => (
                  <div key={card.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--inset)', border: '1px solid var(--ink-5)' }}>
                    <div>
                      <div className="text-[13px] font-semibold" style={{ color: 'var(--ink)' }}>{card.bankName}</div>
                      <div className="text-[12px] font-medium" style={{ fontFamily: 'var(--mono)', color: 'var(--ink-3)' }}>{card.maskedCardNumber}</div>
                      <div className="text-[11px]" style={{ color: 'var(--ink-4)' }}>HSD: {card.expDate}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {card.isPrimary ? (
                        <span className="text-[10px] font-semibold px-2 py-1 rounded-full" style={{ background: 'rgba(22,163,74,0.08)', color: '#16A34A' }}>Chính</span>
                      ) : (
                        <button onClick={() => handleSetPrimary(card.id)} className="text-[11px] font-medium px-2 py-1 rounded-lg cursor-pointer border-none" style={{ background: 'var(--surface)', color: 'var(--ink-3)' }}>Đặt chính</button>
                      )}
                      <button onClick={() => handleDeleteCard(card.id)} className="text-[11px] font-medium px-2 py-1 rounded-lg cursor-pointer border-none" style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444' }}>Xóa</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showAddCard ? (
              <div className="p-4 rounded-xl space-y-3" style={{ border: '1px solid var(--ink-5)' }}>
                <input placeholder="Tên ngân hàng" value={cardForm.bankName} onChange={e => setCardForm(p => ({ ...p, bankName: e.target.value }))}
                  className="w-full h-10 px-4 rounded-xl text-[13px] outline-none" style={{ background: 'var(--inset)', border: '1px solid var(--ink-5)', color: 'var(--ink)' }} />
                <input placeholder="Số thẻ" value={cardForm.cardNumber} onChange={e => setCardForm(p => ({ ...p, cardNumber: e.target.value }))}
                  className="w-full h-10 px-4 rounded-xl text-[13px] outline-none" style={{ fontFamily: 'var(--mono)', background: 'var(--inset)', border: '1px solid var(--ink-5)', color: 'var(--ink)' }} />
                <input placeholder="MM/YY" value={cardForm.expDate} onChange={e => setCardForm(p => ({ ...p, expDate: e.target.value }))}
                  className="w-full h-10 px-4 rounded-xl text-[13px] outline-none" style={{ background: 'var(--inset)', border: '1px solid var(--ink-5)', color: 'var(--ink)' }} />
                <div className="flex gap-2">
                  <button onClick={handleAddCard} className="button-primary flex-1" style={{ background: '#4F46E5', color: 'white' }}>Thêm</button>
                  <button onClick={() => setShowAddCard(false)} className="button-outline flex-1">Hủy</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowAddCard(true)} className="button-outline w-full" style={{ marginTop: cards.length > 0 ? 0 : undefined }}>
                + Thêm thẻ mới
              </button>
            )}
          </div>

          {/* Privacy */}
          <div className="card card-panel" style={{ padding: 24 }}>
            <div className="section-title mb-5">
              <span>🔒 Quyền riêng tư</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl p-4" style={{ background: 'var(--inset)' }}>
              <div>
                <div className="text-[13px] font-semibold" style={{ color: 'var(--ink)' }}>Ẩn số dư mặc định</div>
                <div className="text-[12px] mt-0.5" style={{ color: 'var(--ink-4)' }}>Tự động che số dư khi mở ứng dụng</div>
              </div>
              <button onClick={() => { setShowBalance(!showBalance); updateUser({ showBalanceDefault: !showBalance }).catch(() => {}) }}
                className="w-11 rounded-full relative cursor-pointer border-none transition-all duration-200"
                style={{ height: 24, background: showBalance ? '#16A34A' : 'var(--ink-5)' }}>
                <div className="w-5 h-5 rounded-full bg-white absolute top-[2px] transition-all duration-200"
                  style={{ left: showBalance ? '22px' : '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {/* Theme */}
          <div className="card card-panel" style={{ padding: 24 }}>
            <div className="section-title mb-5">
              <span>🎨 Giao diện</span>
            </div>
            <div className="text-[12px] font-medium mb-3" style={{ color: 'var(--ink-3)' }}>Chế độ hiển thị</div>
            <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'var(--inset)' }}>
              {([
                { id: 'light' as const, icon: '☀️', label: 'Sáng' },
                { id: 'dark' as const, icon: '🌙', label: 'Tối' },
                { id: 'system' as const, icon: '💻', label: 'Hệ thống' },
              ]).map(t => (
                <button key={t.id} onClick={() => handleThemeChange(t.id)}
                  className="flex-1 h-10 rounded-lg text-[12px] font-semibold cursor-pointer transition-all duration-200 border-none flex items-center justify-center gap-1.5"
                  style={{
                    fontFamily: 'var(--font)',
                    background: theme === t.id ? 'var(--surface)' : 'transparent',
                    color: theme === t.id ? 'var(--ink)' : 'var(--ink-4)',
                    boxShadow: theme === t.id ? 'var(--shadow-xs)' : 'none',
                  }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Password */}
          <div className="card card-panel" style={{ padding: 24 }}>
            <div className="section-title mb-5">
              <span>🔐 Bảo mật</span>
            </div>
            {!showPasswordForm ? (
              <button onClick={() => setShowPasswordForm(true)} className="button-outline w-full">Đổi mật khẩu</button>
            ) : (
              <div className="space-y-3">
                <input type="password" placeholder="Mật khẩu hiện tại" value={pwdForm.current} onChange={e => setPwdForm(p => ({ ...p, current: e.target.value }))}
                  className="w-full h-10 px-4 rounded-xl text-[13px] outline-none" style={{ background: 'var(--inset)', border: '1px solid var(--ink-5)', color: 'var(--ink)' }} />
                <input type="password" placeholder="Mật khẩu mới" value={pwdForm.newPwd} onChange={e => setPwdForm(p => ({ ...p, newPwd: e.target.value }))}
                  className="w-full h-10 px-4 rounded-xl text-[13px] outline-none" style={{ background: 'var(--inset)', border: '1px solid var(--ink-5)', color: 'var(--ink)' }} />
                <input type="password" placeholder="Xác nhận mật khẩu mới" value={pwdForm.confirm} onChange={e => setPwdForm(p => ({ ...p, confirm: e.target.value }))}
                  className="w-full h-10 px-4 rounded-xl text-[13px] outline-none" style={{ background: 'var(--inset)', border: '1px solid var(--ink-5)', color: 'var(--ink)' }} />
                <div className="flex gap-2">
                  <button onClick={handleChangePassword} className="button-primary flex-1" style={{ background: '#4F46E5', color: 'white' }}>Lưu</button>
                  <button onClick={() => setShowPasswordForm(false)} className="button-outline flex-1">Hủy</button>
                </div>
                {pwdStatus && (
                  <div className={`text-[12px] font-medium ${pwdStatus.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
                    {pwdStatus.message}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Defaults */}
          <div className="card card-panel" style={{ padding: 24 }}>
            <div className="section-title mb-5">
              <span>⚡ Mặc định</span>
            </div>
            <div className="text-[12px] mb-4" style={{ color: 'var(--ink-4)' }}>Các thông số này chỉ lưu trên trình duyệt, không đồng bộ với server.</div>
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--ink-4)' }}>Chế độ mặc định</label>
                <div className="relative">
                  <select defaultValue="compound"
                    className="w-full h-10 px-4 pr-10 rounded-xl text-[13px] font-medium outline-none appearance-none cursor-pointer"
                    style={{ background: 'var(--inset)', border: '1px solid var(--ink-5)', color: 'var(--ink)' }}>
                    <option value="compound">Lãi kép</option>
                    <option value="simple">Lãi đơn</option>
                    <option value="sip">Gửi góp</option>
                    <option value="emi">Vay EMI</option>
                    <option value="goal">Mục tiêu</option>
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
