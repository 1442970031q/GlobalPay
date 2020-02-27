var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'statusbarHeight': 20,
        'currentState': 0,
        'stateItems': [
            '绘制图案以确认身份',
            '错误，至少绘制4个格子',
            '正在验证，请稍候...',
            '解锁失败，请重新绘制'
        ],
        'request': {
            'isClose': APP.GLOBAL.queryString('isClose'),
            'callback': APP.GLOBAL.queryString('callback'),
            'pageName': APP.GLOBAL.queryString('pageName')
        }
    },
    methods: {
        'drawComplete': function (password) {
            if (password.length < 4) {
                this.currentState = 1;
                return false;
            }

            this.currentState = 2;
            APP.GLOBAL.toastLoading({ 'message': '正在验证' });
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'VerifyHandPwd',
                data: {
                    'handPwd': password
                },
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.closeToastLoading();
                        _vue.currentState = 3;
                        return;
                    }

                    if (!result.Data.Verify) {
                        APP.GLOBAL.closeToastLoading();
                        _vue.currentState = 3;
                        APP.GLOBAL.toastMsg('手势密码不正确');
                        return;
                    }

                    if (_vue.request.callback && _vue.request.pageName) {
                        plus.webview.getWebviewById(_vue.request.pageName).evalJS(_vue.request.callback);
                    } else {
                        _vue.closeWindow();
                    }
                }
            });

            return false;
        },
        'closeWindow': function () {
            APP.GLOBAL.closeWindow('none');
        }
    },
    created: function () {
        if (APP.CONFIG.IS_RUNTIME) {
            this.statusbarHeight = plus.navigator.getStatusbarHeight();
        }

        if (this.request.isClose !== 'true') {
            window.backButton = function () {
                APP.GLOBAL.toastMsg('请绘制您的解锁图案');
            };
        }
    },
    mounted: function () {
        var h5Lock = new H5lock({
            'firstComplete': this.drawComplete
        });
        h5Lock.init('buffer');
    }
});