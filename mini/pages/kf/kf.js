const DATA = require('../../data/kf_data')

Page({
  data: { services: [], loading: true },

  onLoad() {
    this.setData({ services: DATA, loading: false })
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
