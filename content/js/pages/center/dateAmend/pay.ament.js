var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'statusbarHeight': 20,
        'isLoading': true,
        'payData': {
            "AlipayData": {
                "AlipayRealName": "未填写",
                "Alipay": "未填写"
            },
            "BankData": {
                "BankRealName": "未填写",
                "BankName": "未填写",
                "BankNumber": "未填写"
            }
        }
    },
    methods: {
        'doSubmitAjax': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'GetUpdateExtend',
                success: function (result) {
                    _vue.isLoading = false;

                    if (!result.Error && result.Data.length !== 0) {
                        _vue.payData = Vue.set(_vue, 'payData', result.Data);
                    }
                }
            });
        },
        'gotoAlipay': function () {
            if (this.currentUser.IsSetHandPwd) {
                var value = APP.GLOBAL.getItem(APP.CONFIG.GESTURE_LOCK_KEYS.IS_OPEN_ALIPAY);
                var isOpenAlipay = value === 'true';
                if (isOpenAlipay) {
                    APP.GLOBAL.gotoNewWindow('unlockPage', '../subPages/unlock', {
                        'param': 'isClose=true&callback=' + encodeURIComponent('_vue.openAlipay()') + '&pageName=' + encodeURIComponent('pay.amentPage')
                    });
                } else {
                    this.openAlipay();
                }
            } else {
                this.openAlipay();
            }
        },
        'openAlipay': function () {
            APP.GLOBAL.gotoNewWindow('set.pay.dataPage', 'set.pay.data', {
                'param': 'type=支付宝',
                'openCallback': function () {
                    var wb = plus.webview.getWebviewById('unlockPage');
                    if (wb !== null) {
                        wb.evalJS('_vue.closeWindow()');
                    }
                }
            });
        },
        'gotoSet': function (t) {
            APP.GLOBAL.gotoNewWindow('set.pay.dataPage', 'set.pay.data', {
                'param': 'type=' + t
            });
        },
        'updatepage': function () {
            this.doSubmitAjax();
        }
    },
    created: function () {
        if (APP.CONFIG.IS_RUNTIME) {
            this.statusbarHeight = plus.navigator.getStatusbarHeight();
        }
    },
    mounted: function () {
        this.doSubmitAjax();
    }
});