var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'code': null,
        'statusbarHeight': 20
    },
    created: function () {
        if (APP.CONFIG.IS_RUNTIME) {
            this.statusbarHeight = plus.navigator.getStatusbarHeight();
        }
    },
    methods: {
        'closePage': function () {
            APP.GLOBAL.closeWindow();
        },
        'getCode': function () {
            APP.GLOBAL.toastLoading({
                'message': '正在发送'
            });
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'SendChangePhoneCode',
                success: function (result) {
                    APP.GLOBAL.closeToastLoading();
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.code = result.Data;
                    APP.GLOBAL.toastMsg('发送成功');
                }
            });
        },
        'next': function () {
            if (!this.code) {
                APP.GLOBAL.toastMsg('请输入短信验证码');
            } else if (this.code.length < 6) {
                APP.GLOBAL.toastMsg('短信验证码为6位数字');
            } else {
                this.doCheckAjax();
            }
        },
        'doCheckAjax': function () {
            APP.GLOBAL.toastLoading({
                'message': '正在验证'
            });

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'ChangePhone',
                data: {
                    'phoneCode': this.code
                },
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.closeToastLoading();
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    APP.GLOBAL.gotoNewWindow('phone.newPage', 'phone.new', {
                        'openCallback': function () {
                            APP.GLOBAL.closeWindow('none');
                        }
                    });
                }
            });
        }
    }
});