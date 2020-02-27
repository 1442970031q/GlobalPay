Vue.use(vant.Lazyload, {
    'loading': '../../content/img/flag/default_flag.jpg',
    'error': '../../content/img/flag/default_flag.jpg'
});

var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'walletData': [],
        'myPoint': {},
        'statusbarHeight': 20,
        'isLoading': true
    },
    methods: {
        'gotoExchange': function () {
            APP.GLOBAL.gotoNewWindow('exchangePage', 'blance/exchange', {
                openCallback: function () {
                    plus.navigator.setStatusBarStyle('dark');
                },
                closeCallback: function () {
                    if (plus.webview.getWebviewById('exchange.successPage') === null) {
                        plus.navigator.setStatusBarStyle('light');
                    }
                }
            });
        },
        'gotoCash': function () {
            APP.GLOBAL.gotoNewWindow('realityMoneyPage', 'realityMoney', {
                openCallback: function () {
                    plus.navigator.setStatusBarStyle('dark');
                },
                closeCallback: function () {
                    plus.navigator.setStatusBarStyle('light');
                }
            });
        },
        'gotoRecord': function () {
            APP.GLOBAL.gotoNewWindow('exchange.recordPage', 'blance/exchange.record', {
                openCallback: function () {
                    plus.navigator.setStatusBarStyle('dark');
                },
                closeCallback: function () {
                    plus.navigator.setStatusBarStyle('light');
                }
            });
        },
        'loadPageData': function () {
            this.isLoading = true;

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'MyAssets',
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.walletData = [];
                    if (result.Data.length !== 0) {
                        _vue.myPoint = Object.assign({}, _vue.myPoint, result.Data[0]);
                        for (var i = 1; i < result.Data.length; i++) {
                            _vue.walletData.push(result.Data[i]);
                        }
                    }

                    if (APP.CONFIG.IS_RUNTIME) {
                        var mainPage = plus.webview.getWebviewById('mainPage');
                        if (APP.CONFIG.SYSTEM_NAME === 'ios') {
                            mainPage.evalJS('_vue.isEnablePushForIOS()');
                        } else {
                            mainPage.evalJS('_vue.isEnablePushForAndroid()');
                        }
                    }

                    _vue.isLoading = false;
                }
            });
        }
    },
    created: function () {
        if (APP.CONFIG.IS_RUNTIME) {
            this.statusbarHeight = plus.navigator.getStatusbarHeight();

            plus.navigator.setStatusBarStyle('light');
            plus.webview.currentWebview().addEventListener('close', function () {
                plus.navigator.setStatusBarStyle('dark');
            });
        }
    },
    mounted: function () {
        this.loadPageData();
    }
});