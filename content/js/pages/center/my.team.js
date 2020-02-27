Vue.use(vant.Lazyload, {
    'loading': '../../content/img/default_avatar.jpg',
    'error': '../../content/img/default_avatar.jpg',
    'attempt': 1
});

var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'isLoading': true,
        'isShowPhone': false,
        'tabIndex': 0,
        'statusbarHeight': 20,
        'tabData': {
            'tabs': [{
                'name': '普通',
                'id': 0,
                'p': 1,
                'pageSize': 15,
                'isLoaded': false,
                'isLoadMore': false,
                'isLoadComplete': false,
                'list': []
            }, {
                'name': '白银',
                'id': 1,
                'p': 1,
                'pageSize': 15,
                'isLoaded': false,
                'isLoadMore': false,
                'isLoadComplete': false,
                'list': []
            }, {
                'name': '黄金',
                'id': 2,
                'p': 1,
                'pageSize': 15,
                'isLoaded': false,
                'isLoadMore': false,
                'isLoadComplete': false,
                'list': []
            }, {
                'name': '钻石',
                'id': 3,
                'p': 1,
                'pageSize': 15,
                'isLoaded': false,
                'isLoadMore': false,
                'isLoadComplete': false,
                'list': []
            }]
        },
        'userInfo': {
            'TeamCreditAmount': 0,
            'TeamInvestAmount': 0,
            'UserCreditAmount': 0,
            'UserInvestAmount': 0
        }
    },
    methods: {
        'gotoSearch': function () {
            APP.GLOBAL.gotoNewWindow('search.teamPage', 'subPages/search.team');
        },
        'bigAvarat': function (item) {
            vant.ImagePreview({
                images: [item.Avatar],
                showIndex: false,
                showIndicators: false
            });
        },
        'loadPageData': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'MyAchievement',
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.userInfo = Object.assign({}, _vue.userInfo, result.Data);

                    if (APP.CONFIG.IS_RUNTIME) {
                        var mainPage = plus.webview.getWebviewById('mainPage');
                        if (APP.CONFIG.SYSTEM_NAME === 'ios') {
                            mainPage.evalJS('_vue.isEnablePushForIOS()');
                        } else {
                            mainPage.evalJS('_vue.isEnablePushForAndroid()');
                        }
                    }

                    _vue.loadTeamDataAjax();
                    _vue.isLoading = false;
                }
            });
        },
        'loadTeamDataAjax': function () {
            var tab = this.tabData.tabs[this.tabIndex];

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'MyTeamData',
                data: {
                    'p': tab.p,
                    'lv': tab.id,
                    'pageSize': tab.pageSize
                },
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    tab.p++;
                    tab.list = result.Data;
                    tab.isLoaded = true;
                }
            });
        },
        'tabChanged': function () {
            var tab = this.tabData.tabs[this.tabIndex];
            if (!tab.isLoaded) {
                window.scrollTo(0, 0);
                this.loadTeamDataAjax();
            }
        },
        'splitLevelName': function (item) {
            if (!item.LvName) return '无';

            var arr = item.LvName.split(' ');
            return arr.length > 1 ? arr[1] : arr[0];
        },
        'loadMoreAjax': function () {
            var tab = this.tabData.tabs[this.tabIndex];

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'MyTeamData',
                data: {
                    'p': tab.p,
                    'lv': tab.id,
                    'pageSize': tab.pageSize
                },
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    tab.list = tab.list.concat(result.Data);
                    tab.p++;
                    tab.isLoadMore = false;

                    if (result.Data.length < tab.pageSize) {
                        tab.isLoadComplete = true;
                    }
                }
            });
        },
        'scrollBottom': function () {
            var tab = this.tabData.tabs[this.tabIndex];

            if (tab.isLoaded && !tab.isLoadMore && !tab.isLoadComplete) {
                tab.isLoadMore = true;
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