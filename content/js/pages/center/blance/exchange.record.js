var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'statusbarHeight': 20,
        'tabIndex': 0,
        'tabData': {
            'tab0': {
                'isLoading': true,
                'isLoadMore': false,
                'isLoadComplete': false,
                'p': 1,
                'pageSize': 10,
                'list': []
            },
            'tab1': {
                'isLoading': true,
                'isLoadMore': false,
                'isLoadComplete': false,
                'p': 1,
                'pageSize': 10,
                'list': []
            },
            'tab2': {
                'isLoading': true,
                'isLoadMore': false,
                'isLoadComplete': false,
                'p': 1,
                'pageSize': 10,
                'list': []
            }
        }
    },
    methods: {
        'tabChange': function (index) {
            var key = 'tab' + index;
            if (this.tabData[key].isLoading) {
                this.loadPageData();
            }
        },
        'loadPageData': function () {
            var key = 'tab' + this.tabIndex;
            var url = '';
            if (this.tabIndex === 0) {
                url = APP.CONFIG.BASE_URL + 'ExchangeRecords';
            } else if (this.tabIndex === 1) {
                url = APP.CONFIG.BASE_URL + 'TakeCashRecords';
            }else {
                url = APP.CONFIG.BASE_URL + 'DeductAmountList';
            }

            APP.GLOBAL.ajax({
                url: url,
                data: {
                    'p': this.tabData[key].p,
                    'pageSize': this.tabData[key].pageSize
                },
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.tabData[key].list = result.Data;
                    _vue.tabData[key].p++;
                    _vue.tabData[key].isLoading = false;
                }
            });
        },
        'loadMoreData': function () {
            var key = 'tab' + this.tabIndex;
            this.tabData[key].isLoadMore = true;
            var url = '';

            if (this.tabIndex === 0) {
                url = APP.CONFIG.BASE_URL + 'ExchangeRecords';
            } else if (this.tabIndex === 1) {
                url = APP.CONFIG.BASE_URL + 'TakeCashRecords';
            } else {
                url = APP.CONFIG.BASE_URL + 'DeductAmountList';
            }

            APP.GLOBAL.ajax({
                url: url,
                data: {
                    'p': this.tabData[key].p,
                    'pageSize': this.tabData[key].pageSize
                },
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.tabData[key].list = _vue.tabData[key].list.concat(result.Data);
                    _vue.tabData[key].isLoadMore = false;
                    _vue.tabData[key].p++;

                    if (result.Data.length < _vue.tabData[key].pageSize) {
                        _vue.tabData[key].isLoadComplete = true;
                    }
                }
            });
        },
        'scrollBottom': function () {
            var key = 'tab' + this.tabIndex;

            if (!this.tabData[key].isLoadMore && !this.tabData[key].isLoadComplete) {
                this.loadMoreData();
            }
        },
        'gotoDetailt': function (Id) {
            APP.GLOBAL.gotoNewWindow('record.detailPage', 'record.detail', {
                'param': 'id=' + Id
            });
        }
    },
    created: function () {
        if (APP.CONFIG.IS_RUNTIME) {
            this.statusbarHeight = plus.navigator.getStatusbarHeight();
        }
    },
    mounted: function () {
        this.loadPageData();
        window.scrollBottom = this.scrollBottom;
    }
});
