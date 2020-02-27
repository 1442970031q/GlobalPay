Vue.use(vant.Lazyload, {
    'loading': '../content/img/default_produce_80.jpg',
    'error': '../content/img/default_produce_80.jpg',
    'attempt': 1
});

var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'statusbarHeight': 20,
        'isLoading': true,
        'isLoadMore': false,
        'isLoadComplete': false,
        'isTypePopupShow': false,
        'isTimePopupShow': false,
        'isFlush': false,
        'filter': {
            'payType': {
                'typeId': 0,
                'items': []
            },
            'timeType': {
                'typeId': 0,
                'items': [{
                    'Id': 0,
                    'Title': '时间倒序'
                }, {
                    'Id': 1,
                    'Title': '时间正序'
                }]
            },
            'selectedPaytype': null,
            'selectedCountry': null
        },
        'orderData': {
            'pageIndex': 1,
            'pageSize': 15,
            'list': []
        }
    },
    methods: {
        'reloadList': function () {
            this.isLoading = true;
            this.orderData.pageIndex = 1;
            this.loadPageData();
        },
        'flushOrder': function () {
            this.isFlush = true;
            this.orderData.pageIndex = 1;
            this.loadPageData();
        },
        'gotoDetail': function (item) {
            APP.GLOBAL.gotoNewWindow('order.detailPage', 'center/subPages/order.detail', {
                'param': 'oId=' + item.Id
            });
        },
        'updatePage': function () {
            this.currentUser = Object.assign(this.currentUser, APP.GLOBAL.getUserModel());

            if (this.currentUser.Id !== 0) {
                this.isLoading = true;
                this.orderData.pageIndex = 1;
                this.loadPageData();
            }
        },
        'loadPageData': function () {
            this.isLoading = true;
            this.orderData.pageIndex = 1;
            this.orderData.list = [];

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'OrderRecords',
                data: {
                    'p': this.orderData.pageIndex,
                    'pageSize': this.orderData.pageSize,
                    'countryType': this.filter.selectedCountry === null ? 0 : this.filter.selectedCountry.Id,
                    'timeType': this.filter.timeType.typeId
                },
                success: function (result) {
                    if (result.Error) return;

                    _vue.orderData.list = result.Data;
                    _vue.orderData.pageIndex++;
                    _vue.isLoading = false;

                    if (_vue.isFlush) {
                        _vue.isFlush = false;
                        _vue.$toast.success({
                            'message': '刷新完毕',
                            'duration': 500
                        });
                    }
                }
            });
        },
        'loadMoreAjax': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'OrderRecords',
                data: {
                    'p': this.orderData.pageIndex,
                    'pageSize': this.orderData.pageSize,
                    'countryType': this.filter.selectedCountry === null ? 0 : this.filter.selectedCountry.Id,
                    'timeType': this.filter.timeType.typeId
                },
                success: function (result) {
                    if (result.Error) return;

                    _vue.orderData.list = _vue.orderData.list.concat(result.Data);
                    _vue.orderData.pageIndex++;
                    _vue.isLoadMore = false;

                    if (result.Data.length < _vue.orderData.pageSize) {
                        _vue.isLoadComplete = true;
                    }
                }
            });
        },
        'loadItemsAjax': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'AllItems',
                success: function (result) {
                    if (result.Error) return;

                    result.Data.unshift({
                        'Id': 0,
                        'Title': '全部'
                    });
                    _vue.filter.payType.items = result.Data;
                }
            });
        },
        'popupClose': function () {
            if (APP.CONFIG.IS_RUNTIME) {
                var mainPage = plus.webview.getWebviewById('mainPage');
                if (mainPage !== null) {
                    mainPage.evalJS('_vue.setMaskVisible(false)');
                }
            }
        },
        'selectedPaytype': function (item) {
            this.filter.payType.typeId = item.Id;
            this.filter.selectedPaytype = item;
        },
        'selectedCountry': function (item) {
            this.filter.selectedCountry = item;
            this.isTypePopupShow = false;
            this.popupClose();

            this.isLoading = true;
            this.orderData.pageIndex = 1;
            this.loadPageData();
        },
        'selectedTimetype': function (timeType) {
            this.filter.timeType.typeId = timeType;
            this.isTimePopupShow = false;
            this.popupClose();

            this.isLoading = true;
            this.orderData.pageIndex = 1;
            this.loadPageData();
        },
        'openFilter': function (key) {
            this.isTimePopupShow = false;
            this.isTypePopupShow = false;
            this[key] = true;

            if (APP.CONFIG.IS_RUNTIME) {
                var mainPage = plus.webview.getWebviewById('mainPage');
                if (mainPage !== null) {
                    mainPage.evalJS('_vue.setMaskVisible(true)');
                }
            }
        },
        'scrollBottom': function () {
            if (!this.isLoadMore && !this.isLoadComplete) {
                this.isLoadMore = true;
                this.loadMoreAjax();
            }
        }
    },
    created: function () {
        if (APP.CONFIG.IS_RUNTIME) {
            this.statusbarHeight = plus.navigator.getStatusbarHeight();
        }
    },
    mounted: function () {
        this.loadItemsAjax();

        if (this.currentUser.Id !== 0) {
            this.loadPageData();
        }

        window.scrollBottom = this.scrollBottom;
    }
});