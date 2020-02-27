var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'statusbarHeight': 20,
        'isLoading': true,
        'isLoadMore': false,
        'isLoadComplete': false,
        'pageModel': {
            'p': 1,
            'pageSize': 15,
            'list': []
        }
    },
    methods: {
        'loadPageData': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'PrivateNotice',
                data: {
                    'p': this.pageModel.p,
                    'pageSize': this.pageModel.pageSize
                },
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.pageModel.p++;
                    _vue.pageModel.list = result.Data;
                    _vue.isLoading = false;
                }
            });
        },
        'loadMoreAjax': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'PrivateNotice',
                data: {
                    'p': this.pageModel.p,
                    'pageSize': this.pageModel.pageSize
                },
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.pageModel.p++;
                    _vue.pageModel.list = _vue.pageModel.list.concat(result.Data);
                    if (result.Data.length < _vue.pageModel.pageSize) {
                        _vue.isLoadComplete = true;
                    }
                    _vue.isLoadMore = false;
                }
            });
        },
        'gotoDetail': function (item) {
            APP.GLOBAL.gotoNewWindow('messageDetailPage', 'subPages/messageDetail', {
                'param': 'nId=' + item.Id + '&f=p'
            });
        },
        'getText': function (text) {
            var re = new RegExp('<[^<>]+>', 'g');
            text = text.replace(re, '');

            var space = new RegExp('&nbsp;', 'g');
            text = text.replace(space, '');

            return text.length > 20 ? text.substring(0, 20) + '...' : text;
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