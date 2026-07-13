const CFG = require('../../utils/config')
const API = CFG.API_BASE

Page({
  data: { list: [] },

  onShow() {
    wx.request({
      url: API + '/n6/ps',
      success: r => {
        if (r.data && r.data.length) {
          this.setData({ list: r.data.map(p => ({...p, ic: p.ic || ''})) })
        }
      },
      fail: () => {
        try {
          const DATA = require('../../data/plat_data')
          this.setData({ list: DATA })
        } catch(e) {}
      }
    })
  }
})
