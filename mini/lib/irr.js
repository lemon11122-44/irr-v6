/**
 * IRR 计算核心算法库 - 完整复刻 an.jin10wang.cn 全部计算逻辑
 * 纯本地计算，不依赖任何外部 API
 */

// ========== 工具函数 ==========
function round2(v) { return Math.round(v * 100) / 100 }

/**
 * 二分法求解 IRR（月利率）
 * @param {number} pv    现值（借款本金）
 * @param {number} pmt   每期还款额
 * @param {number} n     期数
 * @returns {number} 月利率
 */
function calcMonthlyRate(pv, pmt, n) {
  if (pmt <= 0 || n <= 0 || pv <= 0) return 0
  // 粗略估算初始范围
  let low = 0, high = 0.5
  for (let i = 0; i < 100; i++) {
    const mid = (low + high) / 2
    // 等额本息现值公式: PV = PMT × (1 - (1+r)^(-n)) / r
    let pvCalc
    if (mid < 1e-10) {
      pvCalc = pmt * n
    } else {
      pvCalc = pmt * (1 - Math.pow(1 + mid, -n)) / mid
    }
    if (pvCalc > pv) low = mid
    else high = mid
  }
  return (low + high) / 2
}

// ========== 等额本息 ==========
function calcDebx(principal, annualRate, months) {
  const mr = annualRate / 100 / 12
  if (mr < 1e-10) {
    const mp = principal / months
    return { monthlyPmt: mp, totalInterest: 0, totalRepay: principal, monthlyRate: 0 }
  }
  const mp = principal * mr * Math.pow(1 + mr, months) / (Math.pow(1 + mr, months) - 1)
  const total = mp * months
  return { monthlyPmt: round2(mp), totalInterest: round2(total - principal), totalRepay: round2(total), monthlyRate: mr }
}

// ========== 等额本金 ==========
function calcDebj(principal, annualRate, months) {
  const mr = annualRate / 100 / 12
  const mpPrincipal = principal / months
  let totalInterest = 0
  const schedule = []
  for (let i = 1; i <= months; i++) {
    const remain = principal - mpPrincipal * (i - 1)
    const mi = remain * mr
    totalInterest += mi
    schedule.push({ month: i, payment: round2(mpPrincipal + mi), principal: round2(mpPrincipal), interest: round2(mi) })
  }
  return {
    firstPmt: round2(schedule[0].payment),
    lastPmt: round2(schedule[months - 1].payment),
    totalInterest: round2(totalInterest),
    totalRepay: round2(principal + totalInterest),
    schedule,
    monthlyRate: mr
  }
}

// ========== 先息后本 ==========
function calcXxhb(principal, annualRate, months) {
  const mr = annualRate / 100 / 12
  const monthInterest = principal * mr
  const totalInterest = monthInterest * months
  return {
    monthInterest: round2(monthInterest),
    totalInterest: round2(totalInterest),
    totalRepay: round2(principal + totalInterest),
    lastPmt: round2(principal + monthInterest),
    monthlyRate: mr
  }
}

// ========== 按日计息 ==========
function calcDaily(principal, annualRate, days) {
  const dr = annualRate / 100 / 365
  const interest = principal * dr * days
  return {
    dailyRate: dr,
    interest: round2(interest),
    totalRepay: round2(principal + interest),
    annualRate: annualRate
  }
}

// ========== IRR 综合测算（已知月还款反推年利率） ==========
function calcIRR(principal, monthlyPmt, months) {
  const mr = calcMonthlyRate(principal, monthlyPmt, months)
  const annualRate = mr * 12 * 100
  const total = monthlyPmt * months
  const interest = total - principal
  return {
    monthlyRate: round2(mr),
    annualIRR: round2(annualRate),
    totalInterest: round2(interest),
    totalRepay: round2(total)
  }
}

// ========== 砍头息IRR ==========
function calcKantoux(principal, upfrontFee, monthlyPmt, months) {
  const netPrincipal = principal - upfrontFee
  const mr = calcMonthlyRate(netPrincipal, monthlyPmt, months)
  const annualRate = mr * 12 * 100
  const total = monthlyPmt * months
  const interest = total - netPrincipal
  return {
    netPrincipal: round2(netPrincipal),
    monthlyRate: round2(mr),
    annualIRR: round2(annualRate),
    totalInterest: round2(interest),
    totalRepay: round2(total),
    upfrontFee: round2(upfrontFee)
  }
}

// ========== 法定利率上限判断 ==========
function calcLegalLimit(principal, annualRate, months) {
  const limit24 = 24
  const limit36 = 36
  const mr24 = limit24 / 100 / 12
  const mr36 = limit36 / 100 / 12

  // 24% 上限对应的利息
  const mp24 = principal * mr24 * Math.pow(1 + mr24, months) / (Math.pow(1 + mr24, months) - 1)
  const interest24 = mp24 * months - principal

  // 36% 上限对应的利息
  const mp36 = principal * mr36 * Math.pow(1 + mr36, months) / (Math.pow(1 + mr36, months) - 1)
  const interest36 = mp36 * months - principal

  // 实际利息
  const mr = annualRate / 100 / 12
  const mp = principal * mr * Math.pow(1 + mr, months) / (Math.pow(1 + mr, months) - 1)
  const actualInterest = mp * months - principal

  return {
    interestAt24: round2(interest24),
    interestAt36: round2(interest36),
    actualInterest: round2(actualInterest),
    excessOver24: round2(Math.max(0, actualInterest - interest24)),
    excessOver36: round2(Math.max(0, actualInterest - interest36)),
    isLegal: actualInterest <= interest24,
    isOver36: actualInterest > interest36
  }
}

// ========== 利率换算 ==========
function rateConvert(rate, fromType, toType) {
  // fromType/toType: 'year', 'month', 'day'
  const map = { year: 1, month: 12, day: 365 }
  const annualRate = rate * (map[fromType] || 1)
  const result = {}
  result.yearRate = round2(annualRate)
  result.monthRate = round2(annualRate / 12)
  result.dayRate = round2(annualRate / 365)
  result.actualYearRate = round2((Math.pow(1 + annualRate / 100 / 12, 12) - 1) * 100) // 复利计算
  return result
}

// ========== 复利计算 ==========
function calcCompound(principal, annualRate, years, timesPerYear) {
  const r = annualRate / 100 / timesPerYear
  const n = years * timesPerYear
  const total = principal * Math.pow(1 + r, n)
  return {
    total: round2(total),
    interest: round2(total - principal),
    annualRate: annualRate
  }
}

// ========== 名义利率 ↔ 真实利率 ==========
function nominalToReal(nominalRate, periods) {
  const r = nominalRate / 100 / periods
  const realRate = (Math.pow(1 + r, periods) - 1) * 100
  return { nominalRate, realRate: round2(realRate), periods }
}

function realToNominal(realRate, periods) {
  const r = Math.pow(1 + realRate / 100, 1 / periods) - 1
  const nominalRate = r * periods * 100
  return { realRate, nominalRate: round2(nominalRate), periods }
}

module.exports = {
  calcDebx, calcDebj, calcXxhb, calcDaily, calcIRR,
  calcKantoux, calcLegalLimit, rateConvert, calcCompound,
  nominalToReal, realToNominal, round2
}
