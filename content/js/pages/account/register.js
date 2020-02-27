var _vue = new Vue({
    el: '#app',
    data: {
        'statusbarHeight': 20,
        'confirmPwd': '',
        'isTiming': false,
        'time': APP.CONFIG.TIME_OUT,
        'progressData': {
            'per': 0,
            'text': '',
            'color': ''
        },
        'strength': [{
            'per': 10,
            'text': '较弱',
            'color': '#F45A68'
        }, {
            'per': 40,
            'text': '一般',
            'color': '#cc0'
        }, {
            'per': 80,
            'text': '中等',
            'color': '#f1b200'
        }, {
            'per': 100,
            'text': '很强',
            'color': '#14B12F'
        }],
        'form': {
            'phone': '',
            'phoneCode': '',
            'pwd': '',
            'rFlow': ''
        }
    },
    methods: {
        'sendPhoneCode': function () {
            if (!this.form.phone || (this.form.phone.length !== 11 || this.form.phone[0] !== '1')) {
                APP.GLOBAL.toastMsg('请填写完整的手机号码');
            } else {
                this.doSendCodeAjax();
            }
        },
        'doSendCodeAjax': function () {
            APP.GLOBAL.toastLoading({ 'message': '正在发送' });

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'SendRegisterPhoneCode',
                data: this.form,
                success: function (result) {
                    APP.GLOBAL.closeToastLoading();

                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.isTiming = true;
                    setInterval(function () {
                        _vue.time--;
                        if (_vue.time <= 0) {
                            _vue.isTiming = false;
                            clearInterval();
                        }
                    }, 1000);
                    _vue.form.phoneCode = result.Data;
                    APP.GLOBAL.toastMsg('验证码已发送');
                }
            });
        },
        'checkData': function () {
            if (!this.form.phone || (this.form.phone.length !== 11 || this.form.phone[0] !== '1')) {
                APP.GLOBAL.toastMsg('请填写手机号码');
            } else if (!this.form.phoneCode || this.form.phoneCode.length < 6) {
                APP.GLOBAL.toastMsg('请填写完整的验证码');
            } else if (!this.form.pwd) {
                APP.GLOBAL.toastMsg('请填写登录密码');
            } else if (this.form.pwd.length < 6) {
                APP.GLOBAL.toastMsg('登录密码至少6位');
            } else if (this.form.pwd !== this.confirmPwd) {
                APP.GLOBAL.toastMsg('两次登录密码不一致');
            } else if (!this.form.rFlow) {
                APP.GLOBAL.toastMsg('请填写邀请人ID');
            } else {
                this.doSubmitAjax();
            }
        },
        'doSubmitAjax': function () {
            APP.GLOBAL.toastLoading({ 'message': '正在注册' });

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'Register',
                data: this.form,
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.closeToastLoading();
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

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

                    APP.GLOBAL.gotoNewWindow('successPage', 'success', {
                        openCallback: function () {
                            plus.webview.getWebviewById('loginPage').close('none');
                            APP.GLOBAL.closeWindow('none');
                        }
                    });
                }
            });
        }
    },
    watch: {
        'form.pwd': function (value) {
            var index = 0;
            if (value.length > 3) {
                var n1 = value.search(/[A-Z]/) !== -1 ? 1 : 0;
                var n4 = value.search(/[a-z]/) !== -1 ? 1 : 0;
                var n2 = value.search(/[0-9]/) !== -1 ? 1 : 0;
                var n3 = value.search(/[\~\`\!\@\#\$\%\^\&\*\(\)\_\+\-\=\[\]|{\}\;\'\:\"\,\.\/\<\>\?]{1,}/) !== -1 && value.length > 6 ? 1 : 0;
                index = n1 + n2 + n3 + n4 - 1;
            }

            this.progressData = Object.assign({}, this.progressData, this.strength[index]);
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
        }
    }
});