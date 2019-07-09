var that
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    topic: {},
    id: '',
    openid: '',
    isLike: false,
    replays:{},
    replay_in:[{}],
    test:[{id:123},{id:234}],
    length:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
   
    that = this;
    that.data.id = options.id;
    that.data.openid = options.openid;
    // 获取话题信息
    db.collection('topic').doc(that.data.id).get({
      success: function(res) {
        that.topic = res.data;
        that.setData({
          topic: that.topic,
        })
      }
    })

    // 获取收藏情况
    db.collection('collect')
      .where({
        _openid: that.data.openid,
        _id: that.data.id

      })
      .get({
        success: function(res) {
          if (res.data.length > 0) {
            that.refreshLikeIcon(true)
          } else {
            that.refreshLikeIcon(false)
          }
        },
        fail: console.error
      })
   

  },
  getReplay_in: function () {
    // 获取里层回复列表
   
  },
  onShow: function() {
    // 获取回复列表
    that.getReplay();
  },
  onItemClick: function (event) {
    var id = event.currentTarget.dataset.replayid;
    var openid = event.currentTarget.dataset.openid;
    wx.navigateTo({
      url: "../replay_in/replay_in?id=" + id + "&openid=" + openid
    })
  },
  getReplay: function() {
    // 获取回复列表
    db.collection('replay')
      .where({
        r_id: that.data.id
      })
      .get({
        success: function(res) {
          // res.data 包含该记录的数据
          that.setData({
            replays: res.data,
            length: res.data.length
          })
          for (var i = 0; i < that.data.length; i++) {
            var up = "replay_in[" + i + "]";
            console.log(that.data.replays[i]._id);
            db.collection('replay_in')
              .where({
                r_id: that.data.replays[i]._id
              })
              .get({
                success: function (res) {
                  // res.data 包含该记录的数据
                  that.setData({
                   [up] : res.data,
                  })
                  console.log(that.data.replay_in[0][0].id)
                },
                fail: console.error
              })
          }
        }
      })
        
  },
  /**
   * 刷新点赞icon
   */
  refreshLikeIcon(isLike) {
    that.data.isLike = isLike
    that.setData({
      isLike: isLike,
    })
  },
  // 预览图片
  previewImg: function(e) {
    //获取当前图片的下标
    var index = e.currentTarget.dataset.index;
    wx.previewImage({
      //当前显示图片
      current: this.data.topic.images[index],
      //所有图片
      urls: this.data.topic.images
    })
  },
  // 预览回复图片
  previewReImg: function (e) {
    //获取当前图片的下标
    var index = e.currentTarget.dataset.useindex;
    var idx = e.currentTarget.dataset.index;
    wx.previewImage({
      //当前显示图片
      current: this.data.replays[idx].images[index],
      //所有图片
      urls: this.data.replays[idx].images
    })
  },
  /**
   * 喜欢点击
   */
  onLikeClick: function(event) {
    if (that.data.isLike) {
      // 需要判断是否存在
      that.removeFromCollectServer();
    } else {
      that.saveToCollectServer();
    }
  },
  /**
   * 添加到收藏集合中
   */
  saveToCollectServer: function(event) {
    db.collection('collect').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        _id: that.data.id,
        date: new Date(),
      },
      success: function(res) {
        that.refreshLikeIcon(true)
      },
    })
  },
  /**
   * 从收藏集合中移除
   */
  removeFromCollectServer: function(event) {
    db.collection('collect').doc(that.data.id).remove({

      success: that.refreshLikeIcon(false),
    });
  },

  /**
   * 跳转回复页面
   */
  onReplayClick() {
    wx.navigateTo({
      url: "../replay/replay?id=" + that.data.id + "&openid=" + that.data.openid
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})