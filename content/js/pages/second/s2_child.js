var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'statusbarHeight': 20,
        'request': {
            'title': APP.GLOBAL.queryString('title'),
            'url': APP.GLOBAL.queryString('url')
        }
    },
    methods: {
        'createChild': function () {
            var self = plus.webview.currentWebview();
            var sub = plus.webview.create(
                this.request.url, //子页url
                's2_child_url_Page', {
                    top: 45 + this.statusbarHeight + 1 + 'px', //设置距离顶部的距离
                    bottom: 0, //设置距离底部的距离
                    zindex: 1,
                    scalable: false,
                    kernel: 'WKWebview',
                    progress: {
                        color: '#7563eb'
                    }
                }
            );
            self.append(sub);
        }
    },
    created: function () {
        if (APP.CONFIG.IS_RUNTIME) {
            this.statusbarHeight = plus.navigator.getStatusbarHeight();
        }
    },
    mounted: function () {
        this.createChild();
    }
});