import { useState, useEffect } from 'react'
import type { CalcMode, TimeUnit, Page } from '@/types'
import { useAuth } from '@/context/AuthContext'
import { DarkToggle } from '@/components/DarkToggle'
import { Dashboard } from '@/pages/Dashboard'
import { AnalyticsPage } from '@/pages/Analytics'
import { HistoryPage } from '@/pages/History'
import { SettingsPage } from '@/pages/Settings'
import { AIChatPage } from '@/pages/AIChat'
import { AuthPage } from '@/pages/Auth'

function AppContent() {
  const { mode: authMode, user, logout: authLogout, enterGuest } = useAuth()
  const [page, setPage] = useState<Page>('auth')
  const [mode, setMode] = useState<CalcMode>('compound')
  const [timeUnit, setTimeUnit] = useState<TimeUnit>('year')
  const [dark, setDark] = useState(() => user?.theme === 'dark' || false)
  const [showBalance, setShowBalance] = useState(() => user?.showBalanceDefault || false)

  // Sync dark mode from user profile
  useEffect(() => {
    if (user?.theme === 'dark') setDark(true)
    else if (user?.theme === 'light') setDark(false)
  }, [user?.theme])

  // Sync showBalance from user profile
  useEffect(() => {
    if (user?.showBalanceDefault !== undefined) setShowBalance(user.showBalanceDefault)
  }, [user?.showBalanceDefault])

  useEffect(() => { document.documentElement.classList.toggle('dark', dark) }, [dark])

  // Navigate to dashboard when auth mode changes
  useEffect(() => {
    if (authMode !== 'none' && page === 'auth') setPage('dashboard')
  }, [authMode, page])

  const handleLogout = async () => {
    await authLogout()
    setPage('auth')
    setShowBalance(false)
  }

  const isGuest = authMode === 'guest'
  const userName = user?.name || user?.fullName || 'Khách'

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <header className="sticky top-0 z-50">
        <div className="wrap h-16 flex items-center justify-between">
          <div className="header-brand">
            <img src="/logo.webp" alt="FinCalc logo" className="header-logo" />
            <div>
              <div className="text-[16px] font-bold tracking-tight" style={{ color: 'var(--ink)' }}>FinCalc</div>
              <div className="header-meta">
                {authMode === 'none'
                  ? 'Đăng nhập hoặc chọn guest để tiếp tục'
                  : isGuest
                    ? `Chế độ khách`
                    : `Xin chào, ${userName}`}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium" style={{ color: 'var(--ink-4)', fontFamily: 'var(--mono)' }}>v1.0</span>
            <DarkToggle dark={dark} setDark={setDark} />
          </div>
        </div>
      </header>

      <main className="wrap py-10 pb-16">
        {authMode === 'none' ? (
          <div className="page-shell">
            <AuthPage />
          </div>
        ) : (
          <div className="page-grid">
            <nav className="page-nav card card-panel">
              <div className="nav-brand">
                <img src="/logo.webp" alt="FinCalc logo" className="nav-logo" />
                <div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>FinCalc</div>
                  <div className="text-[12px]" style={{ color: 'var(--ink-4)' }}>{isGuest ? 'Chế độ khách' : userName}</div>
                </div>
              </div>
              <div className="nav-section">
                {([
                  { id: 'dashboard' as Page, icon: '📊', label: 'Dashboard' },
                  { id: 'analytics' as Page, icon: '🔍', label: 'Phân tích' },
                  { id: 'history' as Page, icon: '📜', label: 'Lịch sử' },
                  { id: 'settings' as Page, icon: '⚙️', label: 'Cài đặt' },
                ]).map(n => (
                  <button key={n.id} onClick={() => setPage(n.id)}
                    className={`nav-item ${page === n.id ? 'nav-item-active' : ''}`}
                    style={page === n.id ? { color: '#4F46E5', background: '#4F46E508' } : {}}>
                    {n.icon} {n.label}
                  </button>
                ))}
              </div>
              <div className="nav-footer">
                <button onClick={() => setPage('ai')} className={`nav-item ${page === 'ai' ? 'nav-item-active' : ''}`} style={page === 'ai' ? { color: '#4F46E5', background: '#4F46E508' } : {}}>
                  🤖 AI Chatbox
                </button>
                {!isGuest && (
                  <button onClick={handleLogout} className="nav-item" style={{ marginTop: '12px', background: 'rgba(241,245,249,0.9)', color: 'var(--ink-2)' }}>
                    🔓 Đăng xuất
                  </button>
                )}
                {isGuest && (
                  <button onClick={() => { enterGuest(); setPage('dashboard') }} className="nav-item" style={{ marginTop: '12px', background: 'rgba(241,245,249,0.9)', color: 'var(--ink-2)' }}>
                    🔑 Đăng nhập
                  </button>
                )}
              </div>
            </nav>

            <div>
              {page === 'dashboard' && <Dashboard mode={mode} setMode={setMode} timeUnit={timeUnit} setTimeUnit={setTimeUnit} showBalance={showBalance} setShowBalance={setShowBalance} guestMode={isGuest} user={user} />}
              {page === 'analytics' && <AnalyticsPage guestMode={isGuest} />}
              {page === 'history' && <HistoryPage guestMode={isGuest} />}
              {page === 'settings' && <SettingsPage dark={dark} setDark={setDark} showBalance={showBalance} setShowBalance={setShowBalance} guestMode={isGuest} user={user} />}
              {page === 'ai' && <AIChatPage guestMode={isGuest} />}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default function App() {
  return <AppContent />
}
