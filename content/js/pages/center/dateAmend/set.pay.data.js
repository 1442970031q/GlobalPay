var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'statusbarHeight': 20,
        'alipay': {
            'realName': '',
            'alipay': ''
        },
        'bank': {
            'bankRealName': '',
            'bankName': '',
            'bankNumber': ''
        },
        'request': {
            'type': APP.GLOBAL.queryString('type')
        },
        'show': false,
        'columns': [
            '建设银行',
            '农业银行',
            '交通银行',
            '邮政银行',
            '中国银行'
        ]
    },
    methods: {
        'checkBankInput': function () {
            if (!this.bank.bankRealName) {
                APP.GLOBAL.toastMsg('请填写姓名');
            } else if (this.bank.bankRealName.length < 2) {
                APP.GLOBAL.toastMsg('姓名至少2个中文');
            } else if (!this.bank.bankNumber) {
                APP.GLOBAL.toastMsg('请填写银行卡号');
            } else if (this.bank.bankNumber.length < 12) {
                APP.GLOBAL.toastMsg('银行卡号至少12位');
            } else if (!this.bank.bankName) {
                APP.GLOBAL.toastMsg('请选择银行名称');
            } else {
                this.doBankSubmitAjax();
            }
        },
        'doBankSubmitAjax': function () {
            APP.GLOBAL.toastLoading({ 'message': '正在保存' });

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'UpdateBank',
                data: this.bank,
                success: function (result) {
                    APP.GLOBAL.closeToastLoading();

                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    APP.GLOBAL.toastMsg('修改成功');
                    plus.webview.getWebviewById('pay.amentPage').evalJS('_vue.updatepage()');
                    APP.GLOBAL.closeWindow();
                }
            });
        },
        'checkAlipayInput': function () {
            if (!this.alipay.realName) {
                APP.GLOBAL.toastMsg('请输入真实姓名');
            } else if (this.alipay.realName.length < 2) {
                APP.GLOBAL.toastMsg('真实姓名至少2个中文');
            } else if (!this.alipay.alipay) {
                APP.GLOBAL.toastMsg('请输入支付宝账号');
            } else {
                this.doAlipaySubmitAjax();
            }
        },
        'doAlipaySubmitAjax': function () {
            APP.GLOBAL.toastLoading({ 'message': '正在保存' });
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'UpdateAlipay',
                data: this.alipay,
                success: function (result) {
                    APP.GLOBAL.closeToastLoading();

                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }
                    APP.GLOBAL.toastMsg('修改成功');
                    plus.webview.getWebviewById('pay.amentPage').evalJS('_vue.updatepage()');
                    APP.GLOBAL.closeWindow();
                }
            });
        },
        'onConfirm': function (value) {
            this.bank.bankName = value;
            this.show = false;
        }
    },
    created: function () {
        if (APP.CONFIG.IS_RUNTIME) {
            this.statusbarHeight = plus.navigator.getStatusbarHeight();
        }
    }
});