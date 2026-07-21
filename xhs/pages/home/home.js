const IRR = require('../../lib/irr')
const CFG = require('../../utils/config')

Page({
  data: {
    mode: 'debx',
    rateMode: 'rate',
    principal: '', inputVal: '', months: '',
    result: null, showResult: false,
    modeNames: { debx: '等额本息', debj: '等额本金' },
    banner: { title: 'IRR真实年化怎么算？', sub: '网贷隐藏费用计入真实成本', body: '' }
  },

  onLoad() {
    // 尝试从云端获取轮播配置
    xhs.request({
      url: CFG.API_BASE + '/n6/cg',
      success: r => {
        const d = r.data
        if (d && (d.bn_t || d.bn_s)) {
          this.setData({ banner: { title: d.bn_t || '', sub: d.bn_s || '', body: d.bn_body || '' } })
        }
      },
      fail: () => {
        try {
          const B = require('../../data/banner_data')
          this.setData({ banner: { title: B.title, sub: B.sub, body: B.body } })
        } catch(e) {}
      }
    })
  },

  onInput(e) {
    const key = e.currentTarget.dataset.key
    this.setData({ [key]: e.detail.value })
  },

  onModeChange(e) {
    this.setData({ mode: e.detail.value, showResult: false })
  },

  onCalc() {
    const { mode, principal, inputVal, months } = this.data
    const p = parseFloat(principal), m = parseInt(months)
    let total
    if (this.data.rateMode === 'rate') {
      const rate = parseFloat(inputVal) / 100
      if (mode === 'debx') {
        total = IRR.debx(p, rate, m)
      } else {
        total = IRR.debj(p, rate, m)
      }
    } else {
      total = parseFloat(inputVal)
    }
    if (!p || !total || !m) {
      xhs.showToast({ title: '请完整填写信息', icon: 'none' })
      return
    }
    let r, detail
    if (mode === 'debx') {
      const rate = IRR.calcRate(total, p, m)
      r = { ...IRR.debx(p, rate, m), rate: rate * 100 }
      detail = { 借款金额: p + '元', 还款总额: total.toFixed(2) + '元', 期数: m + '期', '月供': r.monthly.toFixed(2) + '元', 总利息: r.totalInterest.toFixed(2) + '元' }
    } else {
      const rate = IRR.calcRateDebj(total, p, m)
      r = { ...IRR.debj(p, rate, m), rate: rate * 100 }
      detail = { 借款金额: p + '元', 还款总额: total.toFixed(2) + '元', 期数: m + '期', 总利息: r.totalInterest.toFixed(2) + '元' }
    }
    const threshold = 0.24
    let over24 = 0, refund = 0
    if (r.rate > threshold) {
      over24 = r.totalInterest - r.totalInterest * (threshold / r.rate)
      refund = over24
    }
    this.setData({ result: { rate: r.rate, totalInterest: r.totalInterest, monthly: r.monthly, detail, over24, refund, exceeds: r.rate > threshold }, showResult: true })
  },

  onKfTap() { xhs.navigateTo({ url: '/pages/kf/kf' }) }
})
