var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'isPhoneCodeShow': false,
        'statusbarHeight': 20,
        'currentState': 0,
        'stateItems': [
            '至少绘制4个格子',
            '错误，至少绘制<b>4</b>个格子',
            '请重复绘制上次的图案',
            '两次绘制不一致，请重新绘制',
            '绘制完成，正在保存'
        ],
        'form': {
            'phoneCode': '',
            'newHandPwd': ''
        }
    },
    methods: {
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
        'doSubmitAjax': function () {
            this.currentState = 4;

            APP.GLOBAL.toastLoading({ 'message': '正在保存' });
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'SetHandPwd',
                data: this.form,
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.closeToastLoading();
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    APP.GLOBAL.updateUserModel({
                        'IsSetHandPwd': true
                    }, [{
                        'pageName': 'securityPage',
                        'actionName': '_vue.updatePage()'
                    }, {
                        'pageName': 'center.htmlPage',
                        'actionName': '_vue.updatePage()'
                    }]);

                    APP.GLOBAL.gotoNewWindow('gesture.lock.successPage', 'gesture.lock.success', {
                        openCallback: function () {
                            APP.GLOBAL.closeWindow('none');
                        }
                    });
                }
            });
        },
        'firstComplete': function (password) {
            if (password.length < 4) {
                this.currentState = 1;
                return false;
            } else {
                this.currentState = 2;
                return true;
            }
        },
        'complete': function (firstPwd, secPwd) {
            if (firstPwd !== secPwd) {
                this.currentState = 3;
                return false;
            } else {
                this.form.newHandPwd = secPwd;
                this.doSendPhoneCode();
                return true;
            }
        },
        'doSendPhoneCode': function () {
            APP.GLOBAL.toastLoading({ 'message': '正在请求' });

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'SendForgetHandPwdCode',
                success: function (result) {
                    APP.GLOBAL.closeToastLoading();

                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.isPhoneCodeShow = true;
                    setTimeout(function () {
                        document.getElementById('pc').focus();

                        if (APP.CONFIG.IS_RUNTIME && APP.CONFIG.SYSTEM_NAME === 'ios') {
                            plus.key.showSoftKeybord();
                        }
                    }, 100);
                }
            });
        }
    },
    created: function () {
        if (APP.CONFIG.IS_RUNTIME) {
            this.statusbarHeight = plus.navigator.getStatusbarHeight();
        }
    },
    mounted: function () {
        var h5Lock = new H5lock({
            'firstComplete': this.firstComplete,
            'secondComplete': this.complete
        });
        h5Lock.init('buffer');
    }
});