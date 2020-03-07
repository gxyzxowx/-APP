var WR = function () {
  // @加载中组件
  function loading(type) {
    //type == 0隐藏,否则显示
    var els = document.getElementsByClassName("wr-toast");
    var len = els.length;
    if (type !== 0) {
      // 显示
      if (len) {
        els[0].classList.remove("hidden");
      } else {
        var loadingstr = "<div class=\"wr-toast\" style=\"top: 45%;\"><div class=\"wr-toast-loading\"></div><div class=\"wr-toast-content\">加载中...</div></div>";
        document.body.insertAdjacentHTML("beforeend", loadingstr);
      }
    } else {
      //隐藏
      if (len) {
        els[0].classList.add("hidden");
      } else { return; }
    }
  }

  function ready(callback) {
    var userAgent = navigator.userAgent;
    if (userAgent.indexOf("APICloud") != -1) {
      apiready = function () {
        //是apiclound
        callback();
        // 优化点击事件
        // api.parseTapmode();
      };
    } else {
      window.onload = function () {
        console.log("是web调试");
        callback();
      };
    }
  }

  function post(url, paramsObj, done, fail) {

    var net = getNet();
    var ifFirst = true;
    if (net) {
      ajaxCore("post", url, paramsObj, done, fail);
    } else {
      // 网络不佳，3秒后再请求一次
      timer = setTimeout(function () {
        // 第一次重新请求弹出提示，之后无视
        if (ifFirst) {
          api.alert({
            title: "网络错误",
            msg: "请检查你的网络设置",
          });
          ifFirst = false;
        }
        ajaxCore("post", url, paramsObj, done, fail);
      }, 3000);
    }
  }

  function get(url, paramsObj, done, fail) {
    var net = getNet();
    var ifFirst = true;
    if (net) {
      ajaxCore("get", url, paramsObj, done, fail);
    } else {
      // 网络不佳，3秒后再请求一次
      timer = setTimeout(function () {
        // 第一次重新请求弹出提示，之后无视
        if (ifFirst) {
          api.alert({
            title: "网络错误",
            msg: "请检查你的网络设置",
          });
          ifFirst = false;
        }

        ajaxCore("get", url, paramsObj, done, fail);
      }, 3000);
    }
  }

  function getNet() {
    var s = api.connectionType.toLowerCase();
    if (s.indexOf("wifi") !== -1) return "wifi";
    if (s.indexOf("2g") !== -1) return "2g";
    if (s.indexOf("3g") !== -1) return "3g";
    if (s.indexOf("4g") !== -1) return "4g";
    if (s.indexOf("5g") !== -1) return "5g";
    return false;
  }
  function ajaxCore(type, url, paramsObj, done, fail) {
    var baseUrl = "http://lanling.weirong100.com/api";
    //判断是否有文件上传,wrfiles 为文件上传参数，格式是object如：
    //wrfiles: {image: img}
    var files = "";
    if (type === "post" && paramsObj["wrfiles"]) {
      files = paramsObj["wrfiles"];
      console.log("上传了文件：" + JSON.stringify(files));
    }
    api.ajax({
      url: baseUrl + url,
      method: type,
      timeout: 20,
      dataType: "json",
      returnAll: false,
      data: {
        values: paramsObj,
        files: files
      },
    }, function (ret, err) {
      // console.log(JSON.stringify(ret))
      // console.log(JSON.stringify(err))
      if (ret) {
        // TODO
        if (ret.code === 0) {
          // 大概率事件

          var sendData = ret.data ? ret.data : ret;
          done(sendData);
          // 优化点击事件
          // api.parseTapmode();

        } else {
          // code不为0时,处理异常情况
          console.log(url + "返回值：" + JSON.stringify(ret));
          WR.loading(0);

          if (fail) {
            fail(ret);
            return;
          }

          if (ret.message && ret.code !== 98) {
            api.toast({ msg: ret.message });
          }

          //是验证token失败的情况：
          if (ret.code === 96) {
            console.log("验证登录失败的接口：" + url);
            api.toast({ msg: "登录验证失败，正在为您跳转登录页面..." });
            setTimeout(function () {
              openWin("com", "com_login");
            }, 1500);

          }
        }

      } else {
        WR.loading(0);
        console.log(JSON.stringify(err));
        alert("接口：" + url + "出错");
        alert("错误码：" + err.code + "；错误信息：" + err.msg + "网络状态码：" + err.statusCode);
        //错误码，数字类型。（0：连接错误、1：超时、2：授权错误、3：数据类型错误、4：不安全的数据）
        switch (err.code) {
          case 0:
            api.toast({ msg: "连接错误" });
            break;
          case 1:
            api.toast({ msg: "连接超时" });
            break;
          case 2:
            api.toast({ msg: "授权错误" });
            break;
          case 3:
            api.toast({ msg: "数据类型错误" });
            break;
          case 4:
            api.toast({ msg: "不安全的数据" });
            break;
          default:
            api.toast({ msg: "未知错误" });
            break;
        }

      };
    });
  }


  //加载更多
  function toBottom(callback) {
    api.addEventListener({
      name: "scrolltobottom",
      extra: {
        threshold: 80 //设置距离底部多少距离时触发，默认值为0，数字类型
      }
    }, function () {
      //得到更多数据
      callback();
    });
  }

  // 取消触底加载,并提示无数据
  function noToBottom(msg) {
    api.removeEventListener({
      name: "scrolltobottom"
    });
    var msg = msg ? msg : "没有更多了";
    api.toast({ msg: msg });
  }

  //输出
  function log(data) {
    console.log(JSON.stringify(data));
  }

  //一个区间范围内的随机数
  function random(max, min) {
    var data = Math.floor(Math.random() * (max - min + 1) + min);//min-max的数随机
    return data;
  }

  //打开win页面
  function openWin(file, pagename, pageParam, delay) {
    api.openWin({
      name: pagename,
      // url: '../' + file + '/' + pagename + '.html',
      url: "widget://html/" + file + "/" + pagename + ".html",
      pageParam: pageParam,
      reload: true,
      bounces: false,
      bgColor: "#fff",
      allowEdit: true,
      softInputMode: "auto",
      overScrollMode: "always",
      vScrollBarEnabled: false,
      hScrollBarEnabled: false,
      //animation不填为默认，默认效果最好
      delay: delay
    });
  }

  // 打开一个指定路径并带有公共头部的页面(可加背景图地址或颜色)
  function openPage(pageFile, pageName, pageTitle, pageParam, imgurl) {
    // console.log(new Date().getTime())
    api.openWin({
      name: pageName + "_page",
      url: "widget://html/com/win_header.html",
      pageParam: {
        pageFile: pageFile,
        pageName: pageName,
        pageTitle: pageTitle,
        pageParam: pageParam,
        imgurl: imgurl
      },
      reload: true,
      bounces: false,
      bgColor: "#fff",
      scrollEnabled: true,
      slidBackEnabled: false,
      historyGestureEnabled: false,
      vScrollBarEnabled: false,
      hScrollBarEnabled: false,
    });
  }


  //跳转登录页面并提示
  function toLogin() {
    api.toast({ msg: "请先登录再操作！" });
    WR.openWin("com", "com_login", "", 1500);
  }
  //验证手机号码是否正确
  function isMobile(mobile) {
    var patrn = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
    if (!patrn.exec(mobile))
      return false;
    return true;
  }

  // 验证是否为真实姓名
  function isRealName(name) {
    if (!(/^[\u4e00-\u9fa5]{2,4}$/.test(name))) {
      return false;
    } else {
      return true;
    }
  }

  // 验证身份证号
  function isIdCard(card) {
    if (!(/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(card))) {

      return false;
    }
    return true;
  }

  var store = {
    //存入本地
    save: function (keyname, keyvalue) {
      if (typeof keyvalue != "string") {
        keyvalue = JSON.stringify(keyvalue);
      }
      window.localStorage.setItem(keyname, keyvalue);
    },

    //从本地取出
    get: function (keyname, type) {
      var data = window.localStorage.getItem(keyname);
      if (type) {
        //需要解析JSON.parse(data)
        data = JSON.parse(data);
      }
      return data;
    }
  };

  // 申请权限
  function applyPermission(permission, callback) {
    if (!permission) return;
    var permissions = ["camera", "contacts", "contacts-r", "contacts-w", "microphone", "photos", "location", "locationAlways", "notification", "calendar", "calendar-r", "calendar-w",
      "phone", "phone-call", "phone-r", "phone-r-log", "phone-w-log", "sensor", "sms", "sms-s", "sms-r", "storage", "storage-r", "storage-w"];
    var result = null;
    for (var i = 0; i < permissions.length; i++) {
      if (permissions[i] == permission) {
        result = permission;
      }
    }
    if (!result) { api.toast({ msg: "没有找到该权限" }); return; }
    api.requestPermission({
      list: [permission],
      code: 100001
    }, function (ret, err) {
      if (!callback) return;
      setTimeout(function () {
        callback(ret.list[0].granted);
      }, 100);
    });
  }


  // 选择多个媒体（从相册选择多张照片）
  function selMoreMedia(params, callback) {
    var typeList = ["all", "image", "video"];
    var picBox = [];
    params = params || {};
    params.type = params.type || 1;
    params.max = params.max || 9;
    // 需要引入UIAlbumBrowser模块
    var UIAlbumBrowser = api.require("UIAlbumBrowser");
    UIAlbumBrowser.open({
      type: typeList[params.type],
      max: params.max,
      isOpenPreview: true,
      styles: {
        bg: "#fff",
        mark: {
          icon: "",
          position: "bottom_left",
          size: 25
        },
        nav: {
          bg: "rgba(0,0,0,0.6)",
          titleColor: "#fff",
          titleSize: 20,
          cancelColor: "#fff",
          cancelSize: 20,
          finishColor: "#fff",
          finishSize: 20
        }
      },
      rotation: false
    }, function (ret) {
      if (ret) {
        // 点击完成
        if (ret.eventType == "confirm") {
          var cachePics = ret.list;
          // iOS需要转化路径
          for (var i = 0; i < cachePics.length; i++) {
            UIAlbumBrowser.transPath({
              path: cachePics[i].path
            }, function (ret, err) {
              if (ret) {
                picBox.push(ret.path);
              }
            });
          }
          // 如果都已转化完成则返回这些图片
          var t = setInterval(function () {
            if (picBox.length == cachePics.length) {
              clearInterval(t);
              callback(picBox);
            }
          });
        }
      }
    });
  }

  // 选择一张能够裁剪的照片或图片
  function selClipPhoto(params, callback) {
    params = params || {};
    params.type = params.type || 0;
    params.isClip = params.isClip || "y";
    params.style = params.style || {};
    types = ["camera", "album"];
    api.getPicture({
      sourceType: types[params.type],
      encodingType: "jpg",
      mediaValue: "pic",
      allowEdit: false,
      quality: 96,
      saveToPhotoAlbum: false
    }, function (ret, err) {
      if (ret) {
        // 不需要裁剪
        if (params.isClip == "n") {
          setTimeout(function () {
            callback(ret.data);
            return;
          }, 100);
        } else {
          // 需要裁剪
          if (!ret.data) return;
          picClip(ret.data, params.style);
          // 监听裁剪
          api.addEventListener({
            name: "picClipFinish"
          }, function (ret, err) {
            if (ret) {
              callback(ret.value.path);
            }
          });
        }
      }
    });
  }

  // 图片裁剪
  function picClip(pic, style) {
    // 需要引入FNImageClip模块
    var FNImageClip = api.require("FNImageClip");
    style.bg = style.bg || "#f5f5f5";
    style.btnBg = style.btnBg || "linear-gradient(90deg,rgba(87,164,255,1),rgba(3,86,243,1));";
    style.color = style.color || "#fff";
    var el = "<div style='position:fixed;bottom:0;left:0;z-index:9999;width:100%;height:1.5rem;background:" + style.bg + ";display:flex;flex-direction:column;justify-content:center;align-items:center;font-size:.3rem;' id='clip-box'>" +
      "<div id='clip-btn' style='width:80%;height:.8rem;border-radius:.5rem;background:" + style.btnBg + ";text-align:center;line-height:.8rem;color:" + style.color + ";' tapmode onclick='WR._picClipSave()'>上传头像</div></div>";
    document.getElementsByTagName("body")[0].insertAdjacentHTML("beforeend", el);
    //裁剪背景蒙面大小
    FNImageClip.open({
      rect: {
        x: 0,
        y: 0,
        w: api.winWidth,
        h: api.winHeight - document.querySelector("#clip-box").offsetHeight - 50
      },
      srcPath: pic,
      mode: "image",
      style: {
        mask: "rgba(0,0,0,0.75)",
        clip: {
          w: 200,
          h: 200,
          x: (api.frameWidth - 200) / 2,
          y: (api.frameHeight - 200) / 2,
          borderColor: "#0f0",
          borderWidth: 1,
          appearance: "rectangle"
        }
      },
    }, function (ret, err) { });
  }
  // 图片裁剪保存(私有)
  function _picClipSave() {
    // 需要引入FNImageClip模块
    var FNImageClip = api.require("FNImageClip");
    var timeStamp = new Date().getTime();
    FNImageClip.save({
      destPath: "fs://wr_" + timeStamp + ".jpg",
      copyToAlbum: false,
      quality: 1
    }, function (ret, err) {
      // 通知已经裁剪完毕
      api.sendEvent({
        name: "picClipFinish",
        extra: {
          path: ret.destPath
        }
      });
      // 移除裁剪ui
      FNImageClip.close();
      var clipBox = document.getElementById("clip-box") || false;
      if (clipBox) {
        clipBox.parentNode.removeChild(clipBox);
      }
    });
  }
  //打开图像(需要模块imageBrowser)
  function openImages(imgs, index) {
    // imgs为本地图像地址数组
    //index为查看的图像索引
    var imageBrowser = api.require("imageBrowser");
    imageBrowser.openImages({
      imageUrls: imgs,
      activeIndex: index,
      bg: "#32353b",
    });
  }

  //连接融云(根据传入id判断是否打开对点聊天窗口)
  function linkRong(_id) {
  
    WR.loading();
    WR.get("/Im/getToken", {
      token: WR.getStore("token"),
      // token: '44e3BFB49lzggLNm31WhiFvlouJETq6IyZLeYEUQ',
      job_id: _id
    }, function (data) {
      // WR.log(data)
      //得到我的信息存入本地
      var myRong = {};
      myRong.token = data.token;
      myRong.head = data.avatar;
      myRong.name = data.nickname;
      WR.saveStore("myRong", myRong);

      if (_id) {
        var toPerson = {
          id: data.customer.userid,
          img: data.customer.avatar,
          name: data.customer.nickname,
          fromLists: false
        };
        api.openWin({
          reload: true,
          name: "win_chat",
          url: "widget://html/com/win_chat.html",
          pageParam: {
            id: toPerson.id,
            head: toPerson.img,
            name: toPerson.name,
            fromLists: true
          },
          softInputMode: "resize",
          vScrollBarEnabled: false,
        });
      }
      //得到对方的信息传入页面

      WR.loading(0);

    });

  }

  var model = {
    ready: ready,
    loading: loading,
    // ajax 的 post 和 get
    post: post,
    get: get,
    // 触底和取消触底（附加提示）
    toBottom: toBottom,
    noToBottom: noToBottom,
    // 输出
    log: log,
    // 随机数
    random: random,
    //打开窗口
    openWin: openWin,
    // 打开公共头，win+frame
    openPage: openPage,
    //未登录跳入登录页面并提示
    toLogin: toLogin,
    // 验证手机号码:
    isMobile: isMobile,
    // 是否是姓名格式
    isRealName: isRealName,
    //验证身份证号码
    isIdCard: isIdCard,
    //存取数据
    saveStore: store.save,
    getStore: store.get,
    // 申请权限(针对sdk等级为26或以上)
    applyPermission: applyPermission,
    //// 选择单个或多个媒体 (需要模块)
    selMoreMedia: selMoreMedia,
    //上传头像相关：
    selClipPhoto: selClipPhoto,   // 选择一张能够裁剪的照片或图片 (需要模块)
    picClip: picClip,   // 图片裁剪  (需要模块)
    _picClipSave: _picClipSave,  // 图片裁剪保存(私有) (需要模块)
    openImages: openImages, //查看图像（模块：imageBrowser）
    //连接融云IM
    linkRong: linkRong
  };
  return model;
}();
