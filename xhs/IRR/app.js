// app.js
App({
  onLaunch() {

    // 登录
    xhs.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    });
  },
  globalData: {
    userInfo: null
  }
});