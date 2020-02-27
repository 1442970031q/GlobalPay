var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'statusbarHeight': 20,
        'isLoading': true,
        'pageModel': {
            'p': 1,
            'pageSize': 15,
            'list': [],
            'isLoadMore': false,
            'isLoadComplete': false
        }
    },
    methods: {
        'gotoDetail': function (item) {
            APP.GLOBAL.gotoNewWindow('article.detailPage', 'subPages/article.detail', {
                'param': 'aId=' + item.Id
            });
        },
        'loadDataPage': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'TweetList',
                data: {
                    'p': this.pageModel.p,
                    'pageSize': this.pageModel.pageSize
                },
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.pageModel.list = result.Data;
                    _vue.pageModel.p++;
                    _vue.isLoading = false;
                }
            });
        },
        'loadMoreAjax': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'TweetList',
                data: {
                    'p': this.pageModel.p,
                    'pageSize': this.pageModel.pageSize
                },
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.pageModel.list = _vue.pageModel.list.concat(result.Data);
                    _vue.pageModel.p++;
                    _vue.pageModel.isLoadMore = false;

                    if (result.Data.length < _vue.pageModel.pageSize) {
                        _vue.pageModel.isLoadComplete = true;
                    }
                }
            });
        },
        'scrollBottom': function () {
            if (!this.pageModel.isLoadMore && !this.pageModel.isLoadComplete) {
                this.pageModel.isLoadMore = true;
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
        this.loadDataPage();

        window.scrollBottom = this.scrollBottom;
    }
});