var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'isLoading': true,
        'pay': {
            'RealName': '未填写',
            'Phone': '未填写',
            'Amount': '未填写'
        },
        'statusbarHeight': 20,
        'isPopupShow': false,
        'isRulesShow': false,
        'payPass': '',
        'money': ''
    },
    methods: {
        'cashAll': function () {
            if (this.pay.Amount <= 0) {
                APP.GLOBAL.toastMsg('没有可提现余额');
            } else {
                this.money = this.pay.Amount;
            }
        },
        'loadPageData': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'UserTakeCash',
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    if (result.Data.IsEmpty) {
                        APP.GLOBAL.confirmMsg({
                            'title': '未设置',
                            'message': '您还未设置提现信息，是否前往设置？',
                            'confirmCallback': function () {
                                APP.GLOBAL.gotoNewWindow('set.pay.dataPage', 'dataAmend/set.pay.data', {
                                    param: 'type=' + encodeURIComponent('支付宝'),
                                    closeCallback: function () {
                                        plus.webview.currentWebview().reload(true);
                                    }
                                });
                            },
                            'cancelCallback': function () {
                                APP.GLOBAL.closeWindow();
                            }
                        });
                    }
                    _vue.pay = Object.assign({}, _vue.pay, result.Data);
                    _vue.isLoading = false;
                }
            });
        },
        'checkoutNumber': function () {
            if (!this.money) {
                APP.GLOBAL.toastMsg('请输入提现金额');
            } else if (!/^\d+(\.\d+)?$/.test(this.money)) {
                APP.GLOBAL.toastMsg('金额必须为数字');
            } else if (this.money > this.pay.Amount) {
                APP.GLOBAL.toastMsg('可用余额不足');
            } else {
                this.isPopupShow = true;
            }
        },
        'doSubmitAjax': function () {
            APP.GLOBAL.toastLoading({ 'message': '正在提交' });

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'TakeCash',
                data: {
                    'cashAmount': this.money,
                    'cashType': 1,
                    'pin': this.payPass
                },
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.closeToastLoading();
                        APP.GLOBAL.toastMsg(result.Msg);
                        _vue.payPass = '';
                        return;
                    }

                    APP.GLOBAL.gotoNewWindow('successPage', 'subPages/success', {
                        'openCallback': function () {
                            APP.GLOBAL.closeWindow('none');
                        }
                    });
                }
            });
        },
        'onInput': function (key) {
            this.payPass = (this.payPass + key).slice(0, 6);
            if (this.payPass.length === 6) {
                this.doSubmitAjax();
            }
        },
        'onDelete': function () {
            this.payPass = this.payPass.slice(0, this.payPass.length - 1);
        }
    },
    created: function () {
        if (APP.CONFIG.IS_RUNTIME) {
            this.statusbarHeight = plus.navigator.getStatusbarHeight();
        }
    },
    mounted: function () {
        this.loadPageData();
    }
});