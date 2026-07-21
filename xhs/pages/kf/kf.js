const CFG = require('../../utils/config')

Page({
  data: { services: [], loading: true },

  onLoad() {
    xhs.request({
      url: CFG.API_BASE + '/n6/sv',
      success: r => {
        if (r.data && r.data.length) {
          this.setData({ services: r.data.map(s => ({...s, av: s.av || ''})), loading: false })
        }
      },
      fail: () => {
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
    if (ph) xhs.makePhoneCall({ phoneNumber: ph })
  },

  onCopy(e) {
    const txt = e.currentTarget.dataset.text
    if (txt) {
      xhs.setClipboardData({ data: txt, success: () => xhs.showToast({ title: '已复制', icon: 'success' }) })
    }
  }
})
