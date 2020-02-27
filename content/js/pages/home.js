Vue.use(vant.Lazyload, {
    'attempt': 1
});

var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'isLoading': true,
        'isReloading': false,
        'pageData': {
            'ComNotices':[],
            'Swipers': [],
            'Products': [],
            'Recommends': []
        },
        'statusbarHeight': 20,
        'scrollTop': 0
    },
    methods: {
        'gotoS2': function () {
            APP.GLOBAL.gotoNewWindow('s1Page', 'second/s2', {
                openCallback: function () {
                    plus.navigator.setStatusBarStyle('light');
                },
                closeCallback: function () {
                    plus.navigator.setStatusBarStyle('dark');
                }
            });
        },
        'gotoLogin': function () {
            APP.GLOBAL.gotoNewWindow('loginPage', 'account/login', {
                openCallback: function () {
                    plus.navigator.setStatusBarStyle('light');
                },
                closeCallback: function () {
                    plus.navigator.setStatusBarStyle('dark');
                }
            });
        },
        'gotoNewsDetail': function (item) {
            APP.GLOBAL.gotoNewWindow('messageDetailPage', 'center/subPages/messageDetail', {
                param:'nId=' + item.Id
            });
        },
        'gotoInvite': function () {
            if (this.currentUser.Id === 0) {
                this.gotoLogin();
                return;
            }

            APP.GLOBAL.gotoNewWindow('invitePage', 'center/invite', {
                openCallback: function () {
                    plus.navigator.setStatusBarStyle('light');
                },
                closeCallback: function () {
                    plus.navigator.setStatusBarStyle('dark');
                }
            });
        },
        'gotoDetail': function (item) {
            APP.GLOBAL.gotoNewWindow('detailPage', 'detail', {
                'param': 'pId=' + item.Id
            });
        },
        'loadPageData': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'IndexData',
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    for (var i = 0; i < result.Data.Swipers.length; i++) {
                        result.Data.Swipers[i]['ImageAddress'] = {
                            'loading': '../content/img/default_swipe.jpg',
                            'error': '../content/img/default_swipe.jpg',
                            'src': result.Data.Swipers[i]['ImageAddress']
                        };
                    }

                    for (var k = 0; k < result.Data.Recommends.length; k++) {
                        result.Data.Recommends[k]['ImageAddress'] = {
                            'loading': '../content/img/default_recommend.jpg',
                            'error': '../content/img/default_recommend.jpg',
                            'src': result.Data.Recommends[k]['ImageAddress']
                        };
                    }

                    for (var j = 0; j < result.Data.Products.length; j++) {
                        result.Data.Products[j]['ImageAddress'] = {
                            'src': result.Data.Products[j]['ImageAddress'],
                            'loading': '../content/img/default_product.jpg',
                            'error': '../content/img/default_product.jpg'
                        };
                    }

                    _vue.pageData = Object.assign({}, _vue.pageData, result.Data);
                    _vue.isLoading = false;

                    setTimeout(function () { _vue.isReloading = false; }, 500);
                }
            });
        },
        'scrollChange': function (s) {
            this.scrollTop = s;
        },
        'updatePage': function () {
            this.currentUser = Object.assign({}, this.currentUser, APP.GLOBAL.getUserModel());
        }
    },
    created: function () {
        if (APP.CONFIG.IS_RUNTIME) {
            this.statusbarHeight = plus.navigator.getStatusbarHeight();
        }

        window.scrollChange = this.scrollChange;
    },
    mounted: function () {
        this.loadPageData();
    }
});