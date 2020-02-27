Vue.use(vant.Lazyload, {
    'loading': '../content/img/default_avatar.jpg',
    'error': '../content/img/default_avatar.jpg'
});

var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'statusbarHeight': 20,
        'isLoading': false,
        'isPrivateMsg': false,
        'pageModel': {
            'TodayIncome': 0,
            'TotalIncome': 0,
            'Amount': 0
        }
    },
    methods: {
        'lockPage': function (id, page) {
            if (this.currentUser.Id === 0) {
                this.gotoLogin();
                return;
            }

            if (this.currentUser.IsSetHandPwd) {
                var value = '';
                if (id === 'my.teamPage') {
                    value = APP.GLOBAL.getItem(APP.CONFIG.GESTURE_LOCK_KEYS.IS_OPEN_TEAM);
                } else if (id === 'awardDetailPage') {
                    value = APP.GLOBAL.getItem(APP.CONFIG.GESTURE_LOCK_KEYS.IS_OPEN_AWARD);
                } else if (id === 'earningsPage') {
                    value = APP.GLOBAL.getItem(APP.CONFIG.GESTURE_LOCK_KEYS.IS_OPEN_EARNINGS);
                } else if (id === 'my.walletPage') {
                    value = APP.GLOBAL.getItem(APP.CONFIG.GESTURE_LOCK_KEYS.IS_OPEN_WALLET);
                }

                if (value === 'true') {
                    APP.GLOBAL.gotoNewWindow('unlockPage', 'center/subPages/unlock', {
                        'param': 'isClose=true&callback=' + encodeURIComponent('_vue.unlockCallback("' + id + '", "' + page + '")') + '&pageName=' + encodeURIComponent('center.htmlPage')
                    });
                } else {
                    APP.GLOBAL.gotoNewWindow(id, page);
                }
            } else {
                APP.GLOBAL.gotoNewWindow(id, page);
            }
        },
        'unlockCallback': function (id, page) {
            APP.GLOBAL.gotoNewWindow(id, page, {
                'openCallback': function () {
                    var wb = plus.webview.getWebviewById('unlockPage');
                    if (wb !== null) {
                        wb.evalJS('_vue.closeWindow()');
                    }
                }
            });
        },
        'createService': function () {
            if (this.currentUser.Id === 0) {
                this.gotoLogin();
                return;
            }

            APP.GLOBAL.gotoNewWindow('customerServicePage', 'center/customerService', {
                titleNView: {
                    titleText: '',
                    backgroundColor: '#ffffff',
                    buttons: [{
                        type: 'back',
                        background: '#ffffff',
                        float: 'left',
                        fontSrc: '../content/font/iconfont.ttf',
                        text: '\ue645',
                        width: '45px',
                        onclick: function () {
                            plus.webview.getWebviewById('customerServicePage').close();
                        }
                    }],
                    tags: [{
                        tag: 'font',
                        textStyles: {
                            weight: 'bold',
                            size: '18px'
                        },
                        id: 'font',
                        text: '在线客服'
                    }],
                    type: 'float'
                }
            });
        },
        'onRefresh': function () {
            this.isLoading = true;
            this.reloadPageModel();
        },
        'reloadPageModel': function () {
            if (this.currentUser.Id === 0) return;

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'SummaryAwards',
                success: function (result) {
                    if (typeof result.Exts !== 'undefined' && result.Exts.IsLogin) return;

                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.pageModel = Object.assign({}, _vue.pageModel, result.Data);
                    APP.GLOBAL.updateUserModel({
                        'LvName': result.Data.LvName
                    });
                    _vue.currentUser = Object.assign({}, _vue.currentUser, APP.GLOBAL.getUserModel());
                    setTimeout(function () { _vue.isLoading = false; }, 500);
                }
            });
        },
        'newPage': function (id, page) {
            if (this.currentUser.Id === 0) {
                this.gotoLogin();
            } else {
                APP.GLOBAL.gotoNewWindow(id, page);
            }
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
        'gotoVIP': function () {
            if (this.currentUser.Id === 0) {
                this.gotoLogin();
                return;
            }

            APP.GLOBAL.gotoNewWindow('VIPPage', 'center/VIP', {
                openCallback: function () {
                    plus.navigator.setStatusBarStyle('light');
                },
                closeCallback: function () {
                    plus.navigator.setStatusBarStyle('dark');
                }
            });
        },
        'logoutConfirm': function () {
           plus.nativeUI.confirm('确定要退出当前账号吗？', function (e) {
                if (e.index === 0) {
                    plus.nativeUI.showWaiting('正在退出');
                    _vue.webviewMaskVisible(true);
                    _vue.doLogoutAjax();
                }
            }, '安全退出'); 
        },
        'doLogoutAjax': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'Logout',
                success: function () {
                    APP.GLOBAL.removeModel();
                    APP.GLOBAL.updateUserModel({
                        'Id': 0,
                        'Key': ''
                    }, [{
                        'pageName': 'center.htmlPage',
                        'actionName': '_vue.updatePage()'
                    }, {
                        'pageName': 'home.htmlPage',
                        'actionName': '_vue.updatePage()'
                    }, {
                        'pageName': 'shopping.htmlPage',
                        'actionName': '_vue.updatePage()'
                    }, {
                        'pageName': 'orders.htmlPage',
                        'actionName': '_vue.updatePage()'
                    }]);

                    APP.GLOBAL.closeWaiting();
                    _vue.webviewMaskVisible(false);
                    APP.GLOBAL.toastMsg('已安全退出');
                }
            });
        },
        'webviewMaskVisible': function (isVisible) {
            if (APP.CONFIG.IS_RUNTIME) {
                var mainPage = plus.webview.getWebviewById('mainPage');
                if (mainPage !== null) {
                    mainPage.evalJS('_vue.setWebviewMask(' + (isVisible ? 'true' : 'false') + ')');
                }
            }
        },
        'maskVisible': function (isVisible) {
            if (APP.CONFIG.IS_RUNTIME) {
                var mainPage = plus.webview.getWebviewById('mainPage');
                if (mainPage !== null) {
                    mainPage.evalJS('_vue.setMaskVisible(' + (isVisible ? 'true' : 'false') + ')');
                }
            }
        },
        'updatePage': function () {
            this.currentUser = Object.assign({}, this.currentUser, APP.GLOBAL.getUserModel());
            if (this.currentUser.Id !== 0) {
                this.reloadPageModel();
            }
        },
        'gotoPrivateMessage': function () {
            if (this.currentUser.Id === 0) {
                this.gotoLogin();
                return;
            }

            APP.GLOBAL.gotoNewWindow('private.messagePage', 'center/private.message', {
                openCallback: function () {
                    _vue.isPrivateMsg = false;
                }
            });
        },
        'checkPrivateMessage': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'PrivateNotice',
                data: {
                    'p': this.pageModel.p,
                    'pageSize': this.pageModel.pageSize
                },
                success: function (result) {
                    if (!result.Error && result.Data.length !== 0) {
                        var lastId = APP.GLOBAL.getItem(APP.CONFIG.SYSTEM_KEYS.LAST_PRIVATE_MESSAGE_ID_KEY);
                        if (lastId === null || lastId * 1 !== result.Data[0].Id * 1) {
                            _vue.isPrivateMsg = true;
                            APP.GLOBAL.setItem(APP.CONFIG.SYSTEM_KEYS.LAST_PRIVATE_MESSAGE_ID_KEY, result.Data[0].Id.toString());
                        } else {
                            _vue.isPrivateMsg = false;
                        }
                    }
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
        document.addEventListener('resume', this.checkPrivateMessage);
    }
});