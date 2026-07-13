const IRR = require('../../lib/irr')
const BANNER = require('../../data/banner_data')

Page({
  data: {
    mode: 'debx',
    rateMode: 'rate',
    principal: '', inputVal: '', months: '',
    result: null, showResult: false,
    modeNames: { debx: '等额本息', debj: '等额本金' },
    banner: { title: BANNER.title, sub: BANNER.sub, body: BANNER.body }
  },

  onLoad() {
  },

  onInput(e) {
    const { field } = e.currentTarget.dataset
    this.setData({ [field]: e.detail.value })
  },

  switchMode(e) {
    this.setData({ mode: e.currentTarget.dataset.mode, result: null, showResult: false,
      principal: '', inputVal: '', months: '', rateMode: 'rate' })
  },

  switchRateMode() {
    const next = this.data.rateMode === 'rate' ? 'total' : 'rate'
    this.setData({ rateMode: next, result: null, showResult: false })
  },

  calc() {
    const p = parseFloat(this.data.principal) || 0
    const n = parseInt(this.data.months) || 0
    const val = parseFloat(this.data.inputVal) || 0
    if (!p || !n || !val) { wx.showToast({ title: '请填写完整参数', icon: 'none' }); return }

    const m = this.data.mode
    let r = null
    try {
      if (this.data.rateMode === 'rate') {
        if (m === 'debx') r = IRR.calcDebx(p, val, n)
        else if (m === 'debj') r = IRR.calcDebj(p, val, n)
      } else {
        const pmt = val / n
        const irrResult = IRR.calcIRR(p, pmt, n)
        const rate = irrResult.annualIRR
        if (m === 'debx') { r = IRR.calcDebx(p, rate, n); r.annualIRR = irrResult.annualIRR }
        else if (m === 'debj') { r = IRR.calcDebj(p, rate, n); r.annualIRR = irrResult.annualIRR }
      }
      if (r) {
        const annualRate = this.data.rateMode === 'rate' ? val : (r.annualIRR || val)
        const legal = IRR.calcLegalLimit(p, annualRate, n)
        r.excessOver24 = legal.excessOver24; r.excessOver36 = legal.excessOver36
        r.interestAt24 = legal.interestAt24; r.interestAt36 = legal.interestAt36
      }
      this.setData({ result: r, showResult: true })
    } catch (e) {
      wx.showToast({ title: '计算参数有误', icon: 'none' })
    }
  },

  onBannerTap() {},
  onKfTap() { wx.navigateTo({ url: '/pages/kf/kf' }) }
})
