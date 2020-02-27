Vue.use(vant.Lazyload, {
    'loading': '../../../content/img/default_avatar.jpg',
    'error': '../../../content/img/default_avatar.jpg',
    'attempt': 1
});

var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'isLoading': true,
        'statusbarHeight': 20,
        'pageModel': {
            'RankCount': 0,
            'RankDate': '',
            'Ranks': []
        }
    },
    methods: {
        'viewAvatar': function (item) {
            vant.ImagePreview({
                images: [item.Avatar],
                showIndex: false,
                showIndicators: false
            });
        },
        'loadPageData': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'Ranks',
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.pageModel = Object.assign({}, _vue.pageModel, result.Data);
                    _vue.isLoading = false;
                }
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
    }
});