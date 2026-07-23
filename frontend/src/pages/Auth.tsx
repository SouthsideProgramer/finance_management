import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useAuth } from '@/context/AuthContext'

const initialFormState = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
}

export function AuthPage() {
  const { login, register, enterGuest } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [form, setForm] = useState(initialFormState)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const handleInput = (field: keyof typeof form) => (event: ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: event.target.value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus(null)

    if (!form.email || !form.password || (mode === 'register' && !form.name)) {
      setStatus({ type: 'error', message: 'Vui lòng điền đầy đủ thông tin.' })
      return
    }

    if (mode === 'register' && form.password !== form.confirmPassword) {
      setStatus({ type: 'error', message: 'Mật khẩu và xác nhận mật khẩu không khớp.' })
      return
    }

    setLoading(true)
    try {
      if (mode === 'login') {
        await login(form.email, form.password)
        setStatus({ type: 'success', message: 'Đăng nhập thành công!' })
      } else {
        await register(form.name, form.email, form.password)
        setStatus({ type: 'success', message: 'Đăng ký thành công!' })
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Đã có lỗi xảy ra' })
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setMode(prev => prev === 'login' ? 'register' : 'login')
    setForm(initialFormState)
    setStatus(null)
  }

  return (
    <div className="page-shell">
      <section className="card card-panel auth-card">
        <div className="auth-card-header">
          <div>
            <h2 className="text-2xl font-semibold" style={{ color: 'var(--ink)' }}>
              {mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
            </h2>
            <p className="footnote" style={{ marginTop: 8 }}>
              {mode === 'login'
                ? 'Nhập thông tin để truy cập FinCalc.'
                : 'Tạo tài khoản mới để bắt đầu hành trình tài chính.'}
            </p>
          </div>
          <div className="tab-group auth-toggle" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
            <button type="button" className={mode === 'login' ? 'button-primary' : 'button-outline'} onClick={() => setMode('login')}>
              Đăng nhập
            </button>
            <button type="button" className={mode === 'register' ? 'button-primary' : 'button-outline'} onClick={() => setMode('register')}>
              Đăng ký
            </button>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <label className="auth-field">
                <span>Họ và tên</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={handleInput('name')}
                  placeholder="Nguyễn Văn A"
                  className="auth-input"
                />
              </label>
            )}

            <label className="auth-field">
              <span>Email</span>
              <input
                type="email"
                value={form.email}
                onChange={handleInput('email')}
                placeholder="email@domain.com"
                className="auth-input"
              />
            </label>

            <label className="auth-field">
              <span>Mật khẩu</span>
              <input
                type="password"
                value={form.password}
                onChange={handleInput('password')}
                placeholder="Nhập mật khẩu"
                className="auth-input"
              />
            </label>

            {mode === 'register' && (
              <label className="auth-field">
                <span>Xác nhận mật khẩu</span>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleInput('confirmPassword')}
                  placeholder="Nhập lại mật khẩu"
                  className="auth-input"
                />
              </label>
            )}

            <button type="submit" className="button-primary" disabled={loading}
              style={{ background: 'var(--primary)', color: 'white', marginTop: '12px', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Đang xử lý...' : mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
            </button>

            <button type="button" className="button-outline" style={{ marginTop: '12px' }} onClick={enterGuest}>
              Tiếp tục với chế độ khách
            </button>

            {status && (
              <div className={`auth-feedback ${status.type === 'error' ? 'auth-error' : 'auth-success'}`}>
                {status.message}
              </div>
            )}

            <p className="footnote" style={{ marginTop: 18, textAlign: 'center' }}>
              {mode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}{' '}
              <button type="button" className="button-link" onClick={switchMode}>
                {mode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập ngay'}
              </button>
            </p>
          </form>
        </section>
    </div>
  )
}
