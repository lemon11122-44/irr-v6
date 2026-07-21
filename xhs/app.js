// 小红书小程序入口
App({
  onLaunch() {
    tt.showLoading({ title: '加载中...' })
    setTimeout(() => tt.hideLoading(), 500)
  }
})
