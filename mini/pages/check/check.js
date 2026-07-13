const FALLBACK = require('../../data/plat_data')

Page({
  data: { list: FALLBACK },

  onShow() {
    wx.request({
      url: 'http://127.0.0.1/n6/ps',
      success: r => {
        if (r.data && r.data.length) {
          this.setData({ list: r.data.map(p => ({...p, ic: p.ic || ''})) })
        }
      },
      fail: () => { /* 使用本地数据无需更新 */ }
    })
  }
})
