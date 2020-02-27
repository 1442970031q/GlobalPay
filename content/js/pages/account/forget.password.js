var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'value': '',
        'statusbarHeight': 20,
        'form': {
            'pass': '',
            'code': ''
        },
        'phone': '',
        'isShow': true,
        'ps': '',
        'isDisblay': false,
        'time': APP.CONFIG.TIME_OUT
    },
    created: function () {
        if (APP.CONFIG.IS_RUNTIME) {
            this.statusbarHeight = plus.navigator.getStatusbarHeight();
        }
    },
    methods: {
        'nextCheck': function () {
            if (!this.phone) {
                APP.GLOBAL.toastMsg("手机号不能为空");
            } else if (this.phone.length !== 11) {
                APP.GLOBAL.toastMsg("手机号不能小于11位");
            } else if (this.phone[0] !== '1') {
                APP.GLOBAL.toastMsg("手机号格式不正确");
            } else if (!this.form.code) {
                APP.GLOBAL.toastMsg("验证码不能为空");
            } else if (this.form.code.length !== 6) {
                APP.GLOBAL.toastMsg("验证码不能小于6位");
            } else {
                this.isShow = false;
            }
        },
        'getCode': function () {
            if (!this.phone) {
                APP.GLOBAL.toastMsg("手机号不能为空");
            } else if (this.phone.length !== 11) {
                APP.GLOBAL.toastMsg("手机号不能小于11位");
            } else if (this.phone[0] !== '1') {
                APP.GLOBAL.toastMsg("手机号格式不正确");
            } else {
                APP.GLOBAL.toastLoading({
                    'message': '正在发送'
                });
                APP.GLOBAL.ajax({
                    url: APP.CONFIG.BASE_URL + 'SendForgotPasswordPhoneCode',
                    data: {
                        'phone': this.phone
                    },
                    success: function (result) {
                        APP.GLOBAL.closeToastLoading();

                        if (result.Error) {
                            APP.GLOBAL.toastMsg(result.Msg);
                            return;
                        }

                        _vue.form.code = result.Data;
                        _vue.isDisblay = true;
                        var timeoutHandler = setInterval(function () {
                            _vue.time--;
                            if (_vue.time <= 0) {
                                clearInterval(timeoutHandler);
                                _vue.isDisblay = false;
                                _vue.time = APP.CONFIG.TIME_OUT;
                            }
                        }, 1000);
                    }
                });
            }
        },
        'doSubmitAjax': function () {
            APP.GLOBAL.toastLoading({
                'message': '正在保存'
            });
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'ResetPassword',
                data: {
                    'phone': this.phone,
                    'phoneCode': this.form.code,
                    'pwd': this.form.pass
                },
                success: function (result) {
                    APP.GLOBAL.closeToastLoading();
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    APP.GLOBAL.toastMsg('重置成功');
                    APP.GLOBAL.closeWindow();
                }
            })
        },
        'dosubmitCheck': function () {
            if (!this.form.pass) {
                APP.GLOBAL.toastMsg("密码不能为空");
            } else if (this.form.pass.length < 6) {
                APP.GLOBAL.toastMsg("密码不能小于6位");
            } else if (!this.ps) {
                APP.GLOBAL.toastMsg("密码不能为空");
            } else if (this.form.pass !== this.ps) {
                APP.GLOBAL.toastMsg("两次密码不相同");
            } else {
                this.doSubmitAjax();
            }
        }
    }
});