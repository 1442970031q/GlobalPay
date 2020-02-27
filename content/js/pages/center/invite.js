Vue.use(vant.Lazyload, {
    'loading': '../../content/img/default_avatar.jpg',
    'error': '../../content/img/default_avatar.jpg'
});

var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'isLoading': true,
        'isLoadPoster': true,
        'isPosterShow': false,
        'statusbarHeight': 20,
        'swiperIndex': 0,
        'posterList': [],
        'shareService': null,
        'base64': ''
    },
    methods: {
        'gotoMyTeam': function () {
            APP.GLOBAL.gotoNewWindow('my.teamPage', 'my.team', {
                openCallback: function () {
                    plus.navigator.setStatusBarStyle('dark');
                },
                closeCallback: function () {
                    plus.navigator.setStatusBarStyle('light');
                }
            });
        },
        'gotoAwardDetail': function () {
            APP.GLOBAL.gotoNewWindow('awardDetailPage', 'awardDetail', {
                openCallback: function () {
                    plus.navigator.setStatusBarStyle('dark');
                },
                closeCallback: function () {
                    plus.navigator.setStatusBarStyle('light');
                }
            });
        },
        'generatePoster': function () {
            if (this.shareService === null) {
                APP.GLOBAL.toastMsg('微信分享失败');
                return;
            }

            APP.GLOBAL.toastLoading({ 'message': '正在生成' });

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'MakePoster',
                data: {
                    'tId': this.posterList[this.swiperIndex].Id
                },
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.closeToastLoading();
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.doShare(result.Data.ImageData);
                }
            });
        },
        'doShare': function (imageUrl) {
            if (!this.shareService.authenticated) {
                this.shareService.authorize(function (aut) {
                    _vue.shareService = aut;
                    _vue.doShare(imageUrl);
                }, function (err) {
                    APP.GLOBAL.toastMsg(err.message);
                });
                return;
            }

            APP.GLOBAL.closeToastLoading();
            this.isPosterShow = false;

            this.shareService.send({
                type: 'image',
                pictures: [imageUrl],
                extra: {
                    scene: 'WXSceneSession'
                }
            }, function () {
                APP.GLOBAL.toastMsg('已转发');
            }, function (err) {
                APP.GLOBAL.closeToastLoading();
                APP.GLOBAL.toastMsg(err.message);
            });
        },
        'loadPageData': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'MyQRCode',
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.base64 = result.Data.ImageData;
                    _vue.isLoading = false;
                }
            });
        },
        'loadPosterList': function () {
            this.isPosterShow = true;

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'RecommendPosters',
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    for (var i = 0; i < result.Data.length; i++) {
                        result.Data[i].ImageAddress = {
                            'loading': '../../content/img/default_poster.jpg',
                            'error': '../../content/img/default_poster.jpg',
                            'src': result.Data[i].ImageAddress
                        };
                    }
                    _vue.posterList = result.Data;
                    _vue.isLoadPoster = false;
                }
            });
        },
        'swipeChanged': function (index) {
            this.swiperIndex = index;
        },
        'ServiceSuccess': function (services) {
            for (var i = 0; i < services.length; i++) {
                if (services[i].id === 'weixin') {
                    this.shareService = services[i];
                    return;
                }
            }
        },
        'ServiceError': function (err) {
            APP.GLOBAL.toastMsg(err.message);
        }
    },
    created: function () {
        if (APP.CONFIG.IS_RUNTIME) {
            this.statusbarHeight = plus.navigator.getStatusbarHeight();
            plus.share.getServices(this.ServiceSuccess, this.ServiceError);
        }
    },
    mounted: function () {
        this.loadPageData();
    }
});