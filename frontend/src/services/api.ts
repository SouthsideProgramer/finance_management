const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

let accessToken: string | null = localStorage.getItem('accessToken')
let refreshToken: string | null = localStorage.getItem('refreshToken')

function setTokens(access: string, refresh: string) {
  accessToken = access
  refreshToken = refresh
  localStorage.setItem('accessToken', access)
  localStorage.setItem('refreshToken', refresh)
}

function clearTokens() {
  accessToken = null
  refreshToken = null
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
}

let isRefreshing = false
let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  if (!refreshToken) throw new Error('No refresh token')

  const res = await fetch(`${BASE_URL}/auth/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })

  if (!res.ok) {
    clearTokens()
    throw new Error('Refresh failed')
  }

  const data = await res.json()
  setTokens(data.accessToken, data.refreshToken)
  return data.accessToken
}

async function request<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  let res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  // If 401, try refresh once
  if (res.status === 401 && refreshToken) {
    if (isRefreshing && refreshPromise) {
      const newToken = await refreshPromise
      headers['Authorization'] = `Bearer ${newToken}`
      res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
    } else {
      isRefreshing = true
      refreshPromise = refreshAccessToken()
      try {
        const newToken = await refreshPromise
        headers['Authorization'] = `Bearer ${newToken}`
        res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
      } finally {
        isRefreshing = false
        refreshPromise = null
      }
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }

  // Handle 204 No Content
  if (res.status === 204) return undefined as T

  return res.json()
}

// ── Auth ────────────────────────────────────────────────────
export const authAPI = {
  register(name: string, email: string, password: string) {
    return request<{
      accessToken: string; refreshToken: string;
      user: { id: string; name: string; email: string; membershipTier: string }
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }).then(data => { setTokens(data.accessToken, data.refreshToken); return data })
  },

  login(email: string, password: string) {
    return request<{
      accessToken: string; refreshToken: string;
      user: { id: string; name: string; email: string; membershipTier: string }
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }).then(data => { setTokens(data.accessToken, data.refreshToken); return data })
  },

  logout() {
    const payload = refreshToken ? { refreshToken } : {}
    return request('/auth/logout', { method: 'POST', body: JSON.stringify(payload) }).finally(clearTokens)
  },

  logoutAll() {
    return request('/auth/logout-all', { method: 'POST' }).finally(clearTokens)
  },
}

// ── User ────────────────────────────────────────────────────
export interface UserProfile {
  id: string
  email: string
  fullName: string
  avatarUrl: string | null
  membershipTier: string
  isEmailVerified: boolean
  is2faEnabled: boolean
  theme: string
  showBalanceDefault: boolean
  createdAt: string
  name: string
  membership: string
  primaryCard: {
    id: string
    bankName: string
    maskedCardNumber: string
    expDate: string
    isPrimary: boolean
  } | null
}

export const userAPI = {
  getProfile() {
    return request<UserProfile>('/users/me')
  },

  updateProfile(data: { name?: string; theme?: string; showBalanceDefault?: boolean }) {
    return request<UserProfile>('/users/me', { method: 'PUT', body: JSON.stringify(data) })
  },

  changePassword(currentPassword: string, newPassword: string) {
    return request('/users/me/password', { method: 'PUT', body: JSON.stringify({ currentPassword, newPassword }) })
  },
}

// ── Bank Accounts ───────────────────────────────────────────
export interface BankCard {
  id: string
  userId: string
  bankName: string
  maskedCardNumber: string
  expDate: string
  isPrimary: boolean
  createdAt: string
}

export const bankAPI = {
  listCards() {
    return request<{ cards: BankCard[] }>('/bank-accounts').then(d => d.cards)
  },

  addCard(bankName: string, cardNumber: string, expDate: string) {
    return request<BankCard>('/bank-accounts', { method: 'POST', body: JSON.stringify({ bankName, cardNumber, expDate }) })
  },

  setPrimary(id: string) {
    return request(`/bank-accounts/${id}/primary`, { method: 'PUT' })
  },

  deleteCard(id: string) {
    return request(`/bank-accounts/${id}`, { method: 'DELETE' })
  },
}

// ── Transactions ────────────────────────────────────────────
export interface Transaction {
  id: string
  userId: string
  type: string
  amount: number
  description: string | null
  quarter: string | null
  status: string
  createdAt: string
}

export const transactionAPI = {
  list(params?: { type?: string; page?: number; limit?: number }) {
    const qs = new URLSearchParams()
    if (params?.type) qs.set('type', params.type)
    if (params?.page) qs.set('page', String(params.page))
    if (params?.limit) qs.set('limit', String(params.limit))
    const query = qs.toString()
    return request<{ data: Transaction[]; total: number; page: number; limit: number }>(`/transactions${query ? '?' + query : ''}`)
  },

  create(data: { type: string; amount: number; description?: string; quarter?: string }) {
    return request<Transaction>('/transactions', { method: 'POST', body: JSON.stringify(data) })
  },

  delete(id: string) {
    return request(`/transactions/${id}`, { method: 'DELETE' })
  },
}

// ── Chat ────────────────────────────────────────────────────
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  createdAt?: string
}

export interface Conversation {
  id: string
  title: string | null
  createdAt: string
  _count?: { messages: number }
}

export const chatAPI = {
  send(message: string, conversationId?: string) {
    return request<{ conversationId: string; reply: ChatMessage }>('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversationId }),
    })
  },

  listConversations() {
    return request<{ conversations: Conversation[] }>('/chat/conversations').then(d => d.conversations)
  },

  getHistory(conversationId: string) {
    return request<{ messages: ChatMessage[] }>(`/chat/${conversationId}/history`).then(d => d.messages)
  },
}

// ── Sessions ────────────────────────────────────────────────
export interface UserSession {
  id: string
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
  expiresAt: string
}

export const sessionAPI = {
  list() {
    return request<{ sessions: UserSession[] }>('/sessions').then(d => d.sessions)
  },

  revoke(id: string) {
    return request(`/sessions/${id}`, { method: 'DELETE' })
  },

  revokeAll() {
    return request('/sessions', { method: 'DELETE' })
  },
}

// ── Helper ──────────────────────────────────────────────────
export function isAuthenticated() {
  return !!accessToken
}

export function getAccessToken() {
  return accessToken
}
