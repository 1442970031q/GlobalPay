Vue.use(vant.Lazyload, {
    'loading': '../../content/img/default_produce_80.jpg',
    'error':'../../content/img/default_produce_80.jpg'
});

var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'statusbarHeight': 20,
        'isLoading': true,
        'isLoadMore': false,
        'isLoadComplete': false,
        'likeProduct': '',
        'pageParam': {
            'p': 1,
            'pageSize': 15
        }
    },
    methods: {
        'loadPageData': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'MyCollects',
                data: this.pageParam,
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        _vue.isLoading = false;
                        return;
                    }

                    _vue.likeProduct = result.Data;
                    _vue.pageParam.p++;
                    _vue.isLoading = false;
                }
            });
        },
        'loadMoreAjax': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'MyCollects',
                data: this.pageParam,
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        _vue.isLoading = false;
                        return;
                    }

                    _vue.likeProduct = _vue.likeProduct.concat(result.Data);
                    _vue.isLoadMore = false;
                    _vue.pageParam.p++;

                    if (result.Data.length < _vue.pageParam.pageSize) {
                        _vue.isLoadComplete = true;
                    }
                }
            });
        },
        'gotoDetail': function (pid) {
            APP.GLOBAL.gotoNewWindow('detailPage', '../detail', {
                'param': 'pId=' + pid,
                'openCallback': function () {
                    APP.GLOBAL.closeWindow('none');
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