const CFG = require('../../utils/config')

Page({
  data: { services: [], loading: true },

  onLoad() {
    tt.request({
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
    if (ph) tt.makePhoneCall({ phoneNumber: ph })
  },

  onCopy(e) {
    const txt = e.currentTarget.dataset.text
    if (txt) {
      tt.setClipboardData({ data: txt, success: () => tt.showToast({ title: '已复制', icon: 'success' }) })
    }
  }
})
