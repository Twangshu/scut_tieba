var that
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: '',
    openid: '',
    canIUse: wx.canIUse('button.open-type.getUserInfo'),//判断小程序的API在当前版本是否可用
    content: '',
    images: [],
    user: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    that = this;
    that.data.id = options.id;
    that.data.openid = options.openid;
    that.jugdeUserLogin();
  },

  bindKeyInput(e) {
    that.data.content = e.detail.value;
    console.log("内容：" + that.data.content)

  },

  saveReplay: function() {
    db.collection('replay').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        content: that.data.content,
        date: new Date(),
        r_id: that.data.id,
        u_id: that.data.openid,
        t_id: that.data.id,
      },
      success: function(res) {
        wx.showToast({
          title: '发射成功',
        })
        setTimeout(function() {
          wx.navigateBack({
            url: "../homeDetail/homeDetail?id=" + that.data.id + "&openid=" + that.data.openid
          })
        }, 1500)

      },
      fail: console.error
    })
  },
  
getTextAreaContent: function (event) {
    that.data.content = event.detail.value;
  },

  /**
   * 选择图片
   */
  chooseImage: function (event) {
    wx.chooseImage({
      count: 6,
      success: function (res) {
        // 设置图片
        that.setData({
          images: res.tempFilePaths,
        })
        that.data.images = []
        console.log(res.tempFilePaths)
        for (var i in res.tempFilePaths) {
          // 将图片上传至云存储空间
          wx.cloud.uploadFile({
            // 指定要上传的文件的小程序临时文件路径
            cloudPath: that.timetostr(new Date()),
            filePath: res.tempFilePaths[i],
            // 成功回调
            success: res => {
              that.data.images.push(res.fileID)
            },
          })
        }
      },
    })
  },
  /**
   * 图片路径格式化
   */
  timetostr(time) {
    var randnum = Math.floor(Math.random() * (9999 - 1000)) + 1000;
    var str = randnum + "_" + time.getMilliseconds() + ".png";
    return str;
  },

  /**
   * 发布
   */
  formSubmit: function (e) {
    console.log('图片：', that.data.images)

    this.data.content = e.detail.value['input-content'];
    if (this.data.canIUse) {
      if (this.data.images.length > 0) {
        this.saveDataToServer();
      } else if (this.data.content.trim() != '') {
        this.saveDataToServer();
      } else {
        wx.showToast({
          icon: 'none',
          title: '写点东西吧',
        })
      }
    } else {
      this.jugdeUserLogin();
    }
  },
  /**
   * 保存到发布集合中
   */
  saveDataToServer: function (event) {

    db.collection('replay').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        content: that.data.content,
        date: new Date(),
        images: that.data.images,
        user: that.data.user,
        r_id: that.data.id,
        u_id: that.data.openid,
      },
      success: function (res) {
        console.debug("tian");
        wx.showToast({
          title: '发射成功',
        })
      
        that.setData({
          textContent: '',
          images: [],
        })

        that.showTipAndSwitchTab();

      },
    })
  },
  /**
   * 添加成功添加提示，切换页面
   */
  showTipAndSwitchTab: function (event) {//切换到首页tabbar对应的文件
    wx.showToast({
      title: '新增记录成功',
    })
    setTimeout(function () {
      wx.navigateBack({
        url: "../homeDetail/homeDetail?id=" + that.data.id + "&openid=" + that.data.openid
      })
    }, 1500)
  },
  /**
   * 删除图片
   */
  removeImg: function (event) {
    var position = event.currentTarget.dataset.index;
    this.data.images.splice(position, 1);//可删除可插入，删除：可以删除任意数量的项，只需指定2个参数：要删除的第一项的位置和要删除的项数。例如，splice(0,2)会删除数组中的前两项。
    // 渲染图片
    this.setData({
      images: this.data.images,
    })
  },
  // 预览图片
  previewImg: function (e) {
    //获取当前图片的下标
    var index = e.currentTarget.dataset.index;
    wx.previewImage({
      //当前显示图片
      current: this.data.images[index],
      //所有图片
      urls: this.data.images
    })
  },
  /**
   * 判断用户是否登录
   */
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