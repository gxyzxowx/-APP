(function (doc, win) {
  /*参数1代表设计师给的设计稿的宽度，你的设计稿是多少，就写多少;参数2代表换算比例，这里写100是
  为了以后好算,比如，你测量的一个宽度是100px,就可以写为1rem,以及1px=0.01rem等等*/
    var html = doc.getElementsByTagName("html")[0],
        // orientationchange->手机屏幕转屏事件
        // resize->页面大小改变事件(一边pc端有用)
        reEvt = "orientationchange" in win ? "orientationchange" : "resize",
        reFontSize = function () {
            var clientW = doc.documentElement.clientWidth || doc.body.clientWidth;
            if (!clientW) {
                return;
            }
            html.style.fontSize = 100 * (clientW / 750) + "px";
        }
    win.addEventListener(reEvt, reFontSize);
    // DOMContentLoaded->dom加载完就执行,onload要dom/css/js都加载完才执行
    doc.addEventListener("DOMContentLoaded", reFontSize);
})(document, window);