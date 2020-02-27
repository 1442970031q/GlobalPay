var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'statusbarHeight': 20,
        'isLoading': true,
        'isStartShow': false,
        'isEndShow': false,
        'isCurrencyShow': false,
        'minDate': new Date(2019, 2, 1),
        'maxDate': new Date(),
        'startDate': new Date(),
        'endDate': new Date(),
        'currencyId': 0,
        'display': {
            'startTime': '',
            'endTime': '',
            'currency': ''
        },
        'currencyList': []
    },
    methods: {
        'currencyConfirm': function (item) {
            this.currencyId = item.value;
            this.display.currency = item.text;
            this.isCurrencyShow = false;
        },
        'checkData': function () {
            if (!this.display.startTime) {
                APP.GLOBAL.toastMsg('请选择起始日期');
            } else if (!this.display.endTime) {
                APP.GLOBAL.toastMsg('请选择结束日期');
            } else if (this.endDate < this.startDate) {
                APP.GLOBAL.toastMsg('结束日期不能小于起始日期');
            } else if (this.currencyId <= 0) {
                APP.GLOBAL.toastMsg('请选择货币类型');
            } else {
                APP.GLOBAL.gotoNewWindow('awardListPage', 'subPages/awardList', {
                    'param': 's=' + encodeURIComponent(this.display.startTime + ' 00:00:00') +
                        '&e=' + encodeURIComponent(this.display.endTime + ' 23:59:59') +
                        '&cId=' + this.currencyId
                });
            }
        },
        'loadPageData': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'CurrenciesList',
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    if (result.Data.length !== 0) {
                        for (var i = 0; i < result.Data.length; i++) {
                            _vue.currencyList.push({
                                'value': result.Data[i].Id,
                                'text': result.Data[i].Title + '(' + result.Data[i].Symbolize + ')'
                            });
                        }
                        _vue.currencyConfirm(_vue.currencyList[0]);
                    }

                    _vue.startConfirm(new Date());
                    _vue.endConfirm(new Date());
                    _vue.isLoading = false;
                }
            });
        },
        'startConfirm': function (date) {
            this.isStartShow = false;
            this.display.startTime = date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日';
        },
        'endConfirm': function (date) {
            this.isEndShow = false;
            this.display.endTime = date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日';
        },
        'formatter': function (type, value) {
            if (type === 'year') {
                return value + '年';
            } else if (type === 'month') {
                return value + '月';
            } else if (type === 'day') {
                return value + '日';
            }
            return value;
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