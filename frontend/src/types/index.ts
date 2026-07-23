export type CalcMode = 'compound' | 'simple' | 'sip' | 'emi' | 'goal'
export type TimeUnit = 'year' | 'quarter' | 'month'
export type Page = 'dashboard' | 'analytics' | 'history' | 'settings' | 'ai' | 'auth'

export interface CalcState {
  principal: number
  rate: number
  time: number
  frequency: number
  monthly: number
  goalAmount: number
  loanAmount: number
  loanRate: number
  loanTenure: number
}

export interface YearPoint { year: number; total: number; base: number }

export interface Scenario {
  id: string
  label: string
  rate: number
  principal: number
  monthly: number
  color: string
  enabled: boolean
}

export interface Transaction {
  id: string
  date: string
  type: 'deposit' | 'withdraw'
  description: string
  amount: number
  quarter: string
  status: 'completed' | 'pending'
}
