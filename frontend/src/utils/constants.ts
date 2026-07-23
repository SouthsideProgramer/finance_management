import type { CalcMode } from '@/types'

export const MODES: { id: CalcMode; label: string; color: string }[] = [
  { id: 'compound', label: 'Lãi kép', color: '#4F46E5' },
  { id: 'simple', label: 'Lãi đơn', color: '#D97706' },
  { id: 'sip', label: 'Gửi góp', color: '#16A34A' },
  { id: 'emi', label: 'Vay EMI', color: '#EF4444' },
  { id: 'goal', label: 'Mục tiêu', color: '#2563EB' },
]
