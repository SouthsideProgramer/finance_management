import type { CalcMode, CalcState, TimeUnit, YearPoint } from '@/types'
import { rateToAnnual, timeToYears } from './format'

export function calcCompound(p: number, r: number, t: number, n: number) {
  const a = p * Math.pow(1 + r / 100 / n, n * t)
  return { amount: a, interest: a - p, principal: p }
}

export function calcSimple(p: number, r: number, t: number) {
  const interest = (p * r * t) / 100
  return { amount: p + interest, interest, principal: p }
}

export function calcSIP(monthly: number, r: number, t: number) {
  const months = t * 12, mr = r / 100 / 12
  const amount = mr === 0 ? monthly * months : monthly * ((Math.pow(1 + mr, months) - 1) / mr) * (1 + mr)
  return { amount, invested: monthly * months, returns: amount - monthly * months }
}

export function calcEMI(loan: number, r: number, tenure: number) {
  const months = tenure * 12, mr = r / 100 / 12
  if (months === 0 || loan === 0) return { emi: 0, totalPayment: 0, totalInterest: 0, principal: loan }
  const emi = mr === 0 ? loan / months : (loan * mr * Math.pow(1 + mr, months)) / (Math.pow(1 + mr, months) - 1)
  return { emi, totalPayment: emi * months, totalInterest: emi * months - loan, principal: loan }
}

export function calcGoal(goal: number, r: number, t: number) {
  const months = t * 12, mr = r / 100 / 12
  if (months === 0 || goal === 0) return { sip: 0, totalInvested: 0, returns: 0 }
  const sip = mr === 0 ? goal / months : (goal * mr) / ((Math.pow(1 + mr, months) - 1) * (1 + mr))
  return { sip, totalInvested: sip * months, returns: goal - sip * months }
}

export function getYearlyData(mode: CalcMode, s: CalcState, tu: TimeUnit): YearPoint[] {
  const totalYears = mode === 'emi' ? timeToYears(s.loanTenure, tu) : timeToYears(s.time, tu)
  const annualRate = mode === 'emi' ? rateToAnnual(s.loanRate, tu) : rateToAnnual(s.rate, tu)
  const actualYears = Math.max(1, Math.round(totalYears))
  return Array.from({ length: actualYears + 1 }, (_, y) => {
    if (mode === 'compound') { const { amount } = calcCompound(s.principal, annualRate, y, s.frequency); return { year: y, total: amount, base: s.principal } }
    if (mode === 'simple') { const { amount } = calcSimple(s.principal, annualRate, y); return { year: y, total: amount, base: s.principal } }
    if (mode === 'sip') { if (y === 0) return { year: 0, total: 0, base: 0 }; const { amount, invested } = calcSIP(s.monthly, annualRate, y); return { year: y, total: amount, base: invested } }
    if (mode === 'emi') {
      const months = y * 12, mr = annualRate / 100 / 12, totalMonths = actualYears * 12
      const emi = calcEMI(s.loanAmount, annualRate, actualYears).emi
      const remaining = mr === 0 ? s.loanAmount - (s.loanAmount / totalMonths) * months : s.loanAmount * Math.pow(1 + mr, months) - emi * ((Math.pow(1 + mr, months) - 1) / mr)
      return { year: y, total: Math.max(0, remaining), base: 0 }
    }
    const { sip } = calcGoal(s.goalAmount, annualRate, totalYears)
    if (y === 0) return { year: 0, total: 0, base: 0 }
    const { amount, invested } = calcSIP(sip, annualRate, y)
    return { year: y, total: amount, base: invested }
  })
}
