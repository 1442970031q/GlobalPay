var _vue = new Vue({
    el: '#app',
    data: {
        'statusbarHeight': 20,
        'isAutoLogin': false,
        'form': {
            'phone': '',
            'pwd': '',
            'clientId': '',
			'os':'PC'
        },
        'request': {
            'from': APP.GLOBAL.queryString('from')
        }
    },
    methods: {
        'gotoForgot': function () {
            APP.GLOBAL.gotoNewWindow('forget.passwordPage', 'forget.password', {
                openCallback: function () {
                    plus.navigator.setStatusBarStyle('dark');
                },
                closeCallback: function () {
                    plus.navigator.setStatusBarStyle('light');
                }
            });
        },
        'checkData': function () {
            if (!this.form.phone) {
                APP.GLOBAL.toastMsg('请填写手机号码');
            } else if (!this.form.pwd) {
                APP.GLOBAL.toastMsg('请填写登录密码');
            } else if (this.form.pwd.length < 6) {
                APP.GLOBAL.toastMsg('登录密码至少6位');
            } else {
                this.doSubmitAjax();
            }
        },
        'doSubmitAjax': function () {
            APP.GLOBAL.toastLoading({ 'message': '正在登录' });
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'Login',
                data: this.form,
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.closeToastLoading();
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    result.Data['ClientId'] = _vue.form.clientId;
                    APP.GLOBAL.updateUserModel(result.Data, [{
                        'pageName': 'center.htmlPage',
                        'actionName': '_vue.updatePage()'
                    }, {
                        'pageName': 'home.htmlPage',
                        'actionName': '_vue.updatePage()'
                    }, {
                        'pageName': 'shopping.htmlPage',
                        'actionName': '_vue.updatePage()'
                    }, {
                        'pageName': 'orders.htmlPage',
                        'actionName': '_vue.updatePage()'
                    }]);

                    if (_vue.isAutoLogin) {
                        APP.GLOBAL.setItem(APP.CONFIG.SYSTEM_KEYS.AUTO_LOGIN_KEY, 'true');
                        APP.GLOBAL.setItem(APP.CONFIG.SYSTEM_KEYS.LOCAL_LOGIN_INFO_KEY, _vue.form.phone + '\t' + _vue.form.pwd);
                    } else {
                        APP.GLOBAL.setItem(APP.CONFIG.SYSTEM_KEYS.AUTO_LOGIN_KEY, 'false');
                        APP.GLOBAL.removeItem(APP.CONFIG.SYSTEM_KEYS.LOCAL_LOGIN_INFO_KEY);
                    }

                    //如果是真机运行环境
                    if (APP.CONFIG.IS_RUNTIME) {
                        if (_vue.request.from === 'detail') {
                            var detailPage = plus.webview.getWebviewById('detailPage');
                            detailPage.evalJS('_vue.reloadCollect()');
                        }

                        APP.GLOBAL.closeWindow();
                    } else {
                        APP.GLOBAL.closeToastLoading();
                        _vue.$toast.success('登录成功');
                    }
                }
            });
        }
    },
    computed: {
        'publicVersion': function () {
            return 'v' + numberFormat(APP.CONFIG.VERSION / 10, 1);
        },
        'screenHeight': function () {
            if (APP.CONFIG.IS_RUNTIME && APP.CONFIG.SYSTEM_NAME !== 'ios') {
                return plus.display.resolutionHeight;
            } else {
                return document.body.clientHeight;
            }
        },
        'bgHeight': function () {
            return document.getElementById('bg').clientHeight;
        }
    },
    created: function () {
        if (APP.CONFIG.IS_RUNTIME) {
            this.statusbarHeight = plus.navigator.getStatusbarHeight();
            this.form.clientId = plus.push.getClientInfo().clientid;
			this.form.os = plus.os.name.toLowerCase();
        }
    },
    mounted: function () {
        var autoLogin = APP.GLOBAL.getItem(APP.CONFIG.SYSTEM_KEYS.AUTO_LOGIN_KEY);
        this.isAutoLogin = autoLogin === 'true';

        if (this.isAutoLogin) {
            var loginInfo = APP.GLOBAL.getItem(APP.CONFIG.SYSTEM_KEYS.LOCAL_LOGIN_INFO_KEY).toString().split('\t');
            this.form.phone = loginInfo[0];
            this.form.pwd = loginInfo[1];
        }
    }
});