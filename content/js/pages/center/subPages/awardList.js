var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'isLoading': true,
        'isLoadMore': false,
        'isLoadComplete': false,
        'statusbarHeight': 20,
        'pageParam': {
            'p': 1,
            'pageSize': 15,
            'startTime': APP.GLOBAL.queryString('s'),
            'endTime': APP.GLOBAL.queryString('e'),
            'cId': APP.GLOBAL.queryString('cId')
        },
        'pageModel': {
            'list': [],
            'totalAmount': 0
        }
    },
    methods: {
        'loadPageData': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'Awards',
                data: this.pageParam,
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.pageModel.list = result.Data.List;
                    _vue.pageModel.totalAmount = result.Data.TotalPrice;
                    _vue.pageParam.p++;
                    _vue.isLoading = false;
                }
            });
        },
        'loadMoreAjax': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'Awards',
                data: this.pageParam,
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.pageModel.list = _vue.pageModel.list.concat(result.Data.List);
                    _vue.pageParam.p++;
                    _vue.isLoadMore = false;

                    if (result.Data.List.length < _vue.pageParam.pageSize) {
                        _vue.isLoadComplete = true;
                    }
                }
            });
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
        this.loadPageData();

        window.scrollBottom = this.scrollBottom;
    }
});