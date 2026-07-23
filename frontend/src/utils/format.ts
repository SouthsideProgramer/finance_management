import type { TimeUnit } from '@/types'

export const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(Math.round(n))
export const fmtVND = (n: number) => `${fmt(n)}đ`
export const fmtPct = (n: number) => `${n.toFixed(1)}%`

export function fmtCompact(n: number) {
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(1)} tỷ`
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(1)} tr`
  if (Math.abs(n) >= 1e3) return `${(n / 1e3).toFixed(0)}k`
  return fmt(n)
}

export function maskCardNumber(card: string) {
  const digits = card.replace(/\D/g, '')
  if (digits.length < 8) return card
  const first = digits.slice(0, 4)
  const last = digits.slice(-4)
  return `${first} •••• •••• ${last}`
}

export function parseNum(s: string): number {
  return Number(s.replace(/[^\d.]/g, '')) || 0
}

export function rateToAnnual(rate: number, unit: TimeUnit): number {
  if (unit === 'year') return rate
  if (unit === 'quarter') return rate * 4
  return rate * 12
}

export function timeToYears(time: number, unit: TimeUnit): number {
  if (unit === 'year') return time
  if (unit === 'quarter') return time / 4
  return time / 12
}

export function convertRate(rate: number, from: TimeUnit, to: TimeUnit): number {
  const annual = rateToAnnual(rate, from)
  if (to === 'year') return annual
  if (to === 'quarter') return annual / 4
  return annual / 12
}
