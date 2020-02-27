var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'statusbarHeight': 20,
        'isOldPwd': true,
        'isFirst': true,
        'isPhoneCodeShow': false,
        'pinTip': '请输入支付密码，以验证身份',
        'pinError': '',
        'confirmPin': '',
        'form': {
            'pinPwd': '',
            'phoneCode': ''
        }
    },
    methods: {
        'clearPIN': function () {
            APP.GLOBAL.confirmMsg({
                'title': '重置确认',
                'message': '确定要将您的交易密码进行重置吗？',
                'confirmCallback': this.doClearAjax
            });
        },
        'doClearAjax': function () {
            APP.GLOBAL.toastLoading({ 'message': '正在重置' });

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'ResetPin',
                success: function (result) {
                    APP.GLOBAL.closeToastLoading();
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    APP.GLOBAL.updateUserModel({
                        'IsSetPin': false
                    }, [{
                        'pageName': 'securityPage',
                        'actionName': '_vue.updatePage()'
                    }]);

                    APP.GLOBAL.gotoNewWindow('pay.passwordPage', 'pay.password', {
                        openCallback: function () {
                            APP.GLOBAL.closeWindow('none');
                        }
                    });
                }
            });
        },
        'beforeClose': function (action, done) {
            if (action === 'cancel') {
                APP.GLOBAL.closeWindow();
            } else if (action === 'confirm') {
                if (!this.form.phoneCode) {
                    APP.GLOBAL.toastMsg('请输入短信验证码');
                    done(false);
                } else if (this.form.phoneCode.length < 6) {
                    APP.GLOBAL.toastMsg('短信验证码为6位');
                    done(false);
                } else {
                    this.doSubmitAjax();
                }
            }
        },
        'onOldInput': function (key) {
            this.form.pinPwd = (this.form.pinPwd + key).slice(0, 6);
            if (this.form.pinPwd.length === 6) {
                if (this.isOldPwd) {
                    this.doCheckOldPasswordAjax();
                    return;
                }

                setTimeout(function () {
                    if (_vue.isFirst) {
                        _vue.confirmPin = _vue.form.pinPwd;
                        _vue.form.pinPwd = '';
                        _vue.pinError = '';
                        _vue.pinTip = '请再次输入交易密码';
                        _vue.isFirst = false;
                    } else {
                        if (_vue.confirmPin !== _vue.form.pinPwd) {
                            _vue.pinError = '两次交易密码不一致，请重新输入';
                            _vue.isFirst = true;
                            _vue.confirmPin = '';
                            _vue.form.pinPwd = '';
                        } else {
                            _vue.doSendCodeAjax();
                        }
                    }
                }, 200);
            }
        },
        'onOldDelete': function () {
            this.form.pinPwd = this.form.pinPwd.slice(0, this.form.pinPwd.length - 1);
        },
        'doCheckOldPasswordAjax': function () {
            APP.GLOBAL.toastLoading({ 'message': '正在验证' });

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'ValidPin',
                data: { 'pin': this.form.pinPwd },
                success: function (result) {
                    APP.GLOBAL.closeToastLoading();
                    _vue.form.pinPwd = '';

                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.pinTip = '请输入新的交易密码';
                    _vue.isOldPwd = false;
                }
            });
        },
        'doSendCodeAjax': function () {
            APP.GLOBAL.toastLoading({ 'message': '发送验证码' });

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'SendSetPinPhoneCode',
                success: function (result) {
                    APP.GLOBAL.closeToastLoading();
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.form.phoneCode = result.Data;
                    _vue.isPhoneCodeShow = true;
                    setTimeout(function () {
                        document.getElementById('pc').focus();

                        if (APP.CONFIG.IS_RUNTIME && APP.CONFIG.SYSTEM_NAME === 'ios') {
                            plus.key.showSoftKeybord();
                        }
                    }, 100);
                }
            });
        },
        'doSubmitAjax': function () {
            APP.GLOBAL.toastLoading({ 'message': '正在设置' });

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'ChangeSetPin',
                data: this.form,
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    APP.GLOBAL.updateUserModel({
                        'IsSetPin': true
                    }, [{
                        'pageName': 'securityPage',
                        'actionName': '_vue.updatePage()'
                    }]);
                    APP.GLOBAL.closeWindow();
                    APP.GLOBAL.toastMsg('交易密码已设置');
                }
            });
        }
    },
    created: function () {
        if (APP.CONFIG.IS_RUNTIME) {
            this.statusbarHeight = plus.navigator.getStatusbarHeight();
        }
    }
});