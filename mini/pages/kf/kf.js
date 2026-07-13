const CFG = require('../../utils/config')
const API = CFG.API_BASE

Page({
  data: { services: [], loading: true },

  onLoad() {
    wx.request({
      url: API + '/n6/sv',
      success: r => {
        if (r.data && r.data.length) {
          this.setData({ services: r.data.map(s => ({...s, av: s.av || ''})), loading: false })
        }
      },
      fail: () => {
        // 开发环境回退到本地数据
        try {
          const DATA = require('../../data/kf_data')
          this.setData({ services: DATA, loading: false })
        } catch(e) {
          this.setData({ loading: false })
        }
      }
    })
  },

  onCall(e) {
    const ph = e.currentTarget.dataset.phone
    if (ph) wx.makePhoneCall({ phoneNumber: ph })
  },

  onCopy(e) {
    const txt = e.currentTarget.dataset.text
    if (txt) {
      wx.setClipboardData({ data: txt, success: () => wx.showToast({ title: '已复制', icon: 'success' }) })
    }
  }
})
