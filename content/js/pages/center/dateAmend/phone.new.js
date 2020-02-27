var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'phones': '',
        'codes': null,
        'statusbarHeight': 20
    },
    created: function () {
        if (APP.CONFIG.IS_RUNTIME) {
            this.statusbarHeight = plus.navigator.getStatusbarHeight();
        }
    },
    methods: {
        'checkData': function () {
            if (!this.phones) {
                APP.GLOBAL.toastMsg('请填写新的手机号码');
            } else if (this.phones.length !== 11 || this.phones[0] !== '1') {
                APP.GLOBAL.toastMsg('手机号码格式不正确');
            } else if (!this.codes) {
                APP.GLOBAL.toastMsg('请填写短信验证码');
            } else if (this.codes.length !== 6) {
                APP.GLOBAL.toastMsg('请填写完整的短信验证码');
            } else {
                this.doSubmitAjax();
            }
        },
        'doSubmitAjax': function () {
            APP.GLOBAL.toastLoading({ 'message': '正在保存' });

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'ChangeNewPhone',
                data: {
                    'phone': this.phones,
                    'phoneCode': this.codes
                },
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.closeToastLoading();
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    APP.GLOBAL.updateUserModel({
                        'Phone': _vue.phones
                    }, [{
                        'pageName': 'presonDataPage',
                        'actionName': '_vue.updatePage()'
                    }]);

                    APP.GLOBAL.toastMsg('保存成功');
                    APP.GLOBAL.closeWindow();
                }
            });
        },
        'getPhoneCode': function () {
            if (!this.phones) {
                APP.GLOBAL.toastMsg('请填写新的手机号码');
            } else if (this.phones.length !== 11 || this.phones[0] !== '1') {
                APP.GLOBAL.toastMsg('手机号码格式不正确');
            } else {
                this.doSendCodeAjax();
            }
        },
        'doSendCodeAjax': function () {
            APP.GLOBAL.toastLoading({ 'message': '正在发送' });

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'SendChangeNewPhoneCode',
                data: {
                    'phone': this.phones
                },
                success: function (result) {
                    APP.GLOBAL.closeToastLoading();
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.codes = result.Data;
                    APP.GLOBAL.toastMsg('发送成功');
                }
            });
        }
    }
});