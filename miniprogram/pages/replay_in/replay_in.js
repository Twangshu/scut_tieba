var that
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    replay:{},
    id: '',
    openid: '',
    replay_in: {},
    content: '',
    user: {},
    length:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    that = this;
    that.data.id = options.id;
    that.data.openid = options.openid;
    that.jugdeUserLogin();
    // 获取回复信息
    db.collection('replay').doc(that.data.id).get({
      success: function (res) {
        that.replay = res.data;
        that.setData({
          replay: that.replay,
        })
      }
    })
  },
  getTextAreaContent: function (event) {
    that.data.content = event.detail.value;
  },
  /**
     * 发布
     */
  formSubmit: function (e) {
    this.data.content = e.detail.value['input-content'];
    if (this.data.content.trim() != '') {
        this.saveDataToServer();
      } else {
        wx.showToast({
          icon: 'none',
          title: '写点东西吧',
        })
      }
  },
  /**
   * 保存到发布集合中
   */
  saveDataToServer: function (event) {

    db.collection('replay_in').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        content: that.data.content,
        date: new Date(),
        user: that.data.user,
        r_id: that.data.id,
        u_id: that.data.openid,
      },
      success: function (res) {
        wx.showToast({
          title: '回复成功',
        })

        that.setData({
          textContent: '',
          images: [],
        })
        wx.navigateTo({
          url: "../replay_in/replay_in?id=" + that.data.id + "&openid=" + that.data.openid
        })





      },
    })
  },
 
  onShow: function () {
    // 获取回复列表
    that.getReplay_in()
  },
  getReplay_in: function () {
    // 获取回复列表
    db.collection('replay_in')
      .where({
        r_id: that.data.id
      })
      .get({
        success: function (res) {
          // res.data 包含该记录的数据
          console.log(res)
          that.setData({
            replay_in: res.data,
            length:res.data.length
          })
        },
        fail: console.error
      })
  },
  /**
   * 刷新点赞icon
   */
  // 预览回复图片
  previewReImg: function (e) {
    //获取当前图片的下标
    var index = e.currentTarget.dataset.useindex;
    var idx = e.currentTarget.dataset.index;
    console.log(idx);
    console.log(index + "aaa");
    wx.previewImage({
      //当前显示图片
      current: this.data.replays[idx].images[index],
      //所有图片
      urls: this.data.replays[idx].images
    })
  },
  jugdeUserLogin: function (event) {
    // 查看是否授权
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function (res) {
              that.data.user = res.userInfo;
              console.log(that.data.user)
            }
          })
        }
      }
    })
  }
})