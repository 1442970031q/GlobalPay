var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'isLoading': false,
        'isCurrencyShow': false,
        'isLoadingBalance': false,
        'isShowButton': false,
        'currencyList': [],
        'currencyDisplay': '选择转换的币种',
        'balanceAmount': 0,
        'exchangeAmount':0,
        'rat':0,
        'form': {
            'src': 0,
            'amount': '',
            'target': 1
        },
        'statusbarHeight': 20
    },
    methods: {
        'currencyConfirm': function (item) {
            this.isCurrencyShow = false;

            this.currencyDisplay = item.text;
            this.rat = item.value.ExRate;
            this.form.src = item.value.Id;

            this.loadBalanceAjax();
        },
        'checkExchange': function () {
            if (!this.form.src || this.form.src === 0) {
                APP.GLOBAL.toastMsg('请选择币种');
            } else if (!this.form.amount) {
                APP.GLOBAL.toastMsg('请输入转换数量');
            } else if (this.form.amount > this.balanceAmount) {
                APP.GLOBAL.toastMsg('余额不足');
            } else {
                this.doSubmitAjax();
            }
        },
        'doSubmitAjax': function () {
            APP.GLOBAL.toastLoading({ 'message': '正在兑换' });

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'Exchange',
                data: this.form,
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    if (APP.CONFIG.IS_RUNTIME) {
                        plus.webview.getWebviewById('my.walletPage').evalJS('_vue.loadPageData()');
                        APP.GLOBAL.gotoNewWindow('exchange.successPage', '../subPages/exchange.success', {
                            'param': 't=' + encodeURIComponent(_vue.currencyDisplay) + '&amount=' + _vue.form.amount,
                            'openCallback': function () {
                                APP.GLOBAL.closeWindow('none');
                            }
                        });
                    } else {
                        _vue.$toast.success('转换成功');
                    }
                }
            });
        },
        'loadBalanceAjax': function () {
            this.isLoadingBalance = true;

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'CurrencyAmount',
                data: { 'cId': this.form.src },
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.balanceAmount = result.Data.Amount;
                    _vue.calcuExchangeAmount(_vue.form.amount);
                    _vue.isLoadingBalance = false;
                }
            });
        },
        'loadPageData': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'CurrenciesList',
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    for (var i = 0; i < result.Data.length; i++) {
                        if (result.Data[i].Id !== 1) {
                            _vue.currencyList.push({
                                'value': result.Data[i],
                                'text': result.Data[i].Title + '(' + result.Data[i].Symbolize + ')'
                            });
                        }
                    }

                    _vue.isLoading = false;
                }
            });
        },
        'calcuExchangeAmount': function (value) {
            this.exchangeAmount = numberFormat(value * 1 * this.rat, 2);
        },
        'exchangeAll': function () {
            this.form.amount = this.balanceAmount;
        }
    },
    watch: {
        'form.amount': function (value) {
            if (this.rat !== 0) {
                this.calcuExchangeAmount(value);
            }
        },
        'balanceAmount': function (value) {
            this.isShowButton = value * 1 > 0;
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