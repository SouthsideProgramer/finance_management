import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { authAPI, userAPI, isAuthenticated, type UserProfile } from '@/services/api'

interface AuthState {
  mode: 'none' | 'user' | 'guest'
  user: UserProfile | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  enterGuest: () => void
  refreshProfile: () => Promise<void>
  updateUser: (data: { name?: string; theme?: string; showBalanceDefault?: boolean }) => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<'none' | 'user' | 'guest'>(() => {
    return isAuthenticated() ? 'user' : 'none'
  })
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchProfile = useCallback(async () => {
    if (!isAuthenticated()) return
    setLoading(true)
    try {
      const profile = await userAPI.getProfile()
      setUser(profile)
    } catch {
      setMode('none')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load profile on mount if token exists
  useEffect(() => {
    if (isAuthenticated()) {
      fetchProfile()
    }
  }, [fetchProfile])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      await authAPI.login(email, password)
      setMode('user')
      const profile = await userAPI.getProfile()
      setUser(profile)
    } finally {
      setLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string) => {
    setLoading(true)
    try {
      await authAPI.register(name, email, password)
      setMode('user')
      const profile = await userAPI.getProfile()
      setUser(profile)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } finally {
      setMode('none')
      setUser(null)
    }
  }

  const enterGuest = () => {
    setMode('guest')
    setUser(null)
  }

  const refreshProfile = async () => {
    if (isAuthenticated()) {
      await fetchProfile()
    }
  }

  const updateUser = async (data: { name?: string; theme?: string; showBalanceDefault?: boolean }) => {
    if (!user) return
    const updated = await userAPI.updateProfile(data)
    setUser({ ...user, ...updated })
  }

  return (
    <AuthContext.Provider value={{ mode, user, loading, login, register, logout, enterGuest, refreshProfile, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
