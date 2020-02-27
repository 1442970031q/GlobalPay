var _vue = new Vue({
    el: '#bottom',
    data: {
        'menus': [{
            'index': 0,
            'text': '全球购',
            'default': 'icon-homepage',
            'active': 'icon-homepage_fill'
        }, {
            'index': 1,
            'text': '跨境购物',
            'default': 'icon-service',
            'active': 'icon-service_fill'
        }, {
            'index': 2,
            'text': '订单',
            'default': 'icon-activity',
            'active': 'icon-activity_fill'
        }, {
            'index': 3,
            'text': '个人中心',
            'default': 'icon-people',
            'active': 'icon-people_fill'
        }],
        'isChecking': false,
        'currentUser': APP.GLOBAL.getUserModel(),
        'currentIndex': 0,
        'isMask': false,
        'runtimeMainActivity': null,
        'pushOptions': {
            'message': '推送设置没有开启！这将无法及时获得团队新成员提醒和您的奖励信息，是否去开启？',
            'opt': {
                'title': '推送通知',
                'buttons': ['不了', '立即开启']
            }
        },
        'newMemberPlayer': null,
        'newBonusPlayer': null
    },
    methods: {
        'setWebviewMask': function (isVisible) {
            var self = plus.webview.currentWebview();
            self.setStyle({
                'mask': isVisible ? 'rgba(0,0,0,.8)' : 'none'
            });
        },
        'setMaskVisible': function (isVisible) {
            this.isMask = isVisible;
        },
        'ready': function () {
            if (!APP.CONFIG.IS_RUNTIME) return;

            this.newMemberPlayer = plus.audio.createPlayer({
                'src': '_www/content/sound/new_member.mp3'
            });

            this.newBonusPlayer = plus.audio.createPlayer({
                'src': '_www/content/sound/new_bonus.mp3'
            });

            var isSafeArea = APP.CONFIG.IPHONE.isIPhoneX || APP.CONFIG.IPHONE.isIPhoneXR || APP.CONFIG.IPHONE.isIPhoneXSMax;
            if (isSafeArea) {
                document.getElementById('bottom').style.paddingBottom = '25px';
            }

            //获取当前页面所属的Webview窗口对象
            var self = plus.webview.currentWebview();
            for (var i = APP.CONFIG.SUB_PAGES.length - 1; i >= 0; i--) {
                //创建webview子页
                var sub = plus.webview.create(
                    APP.CONFIG.SUB_PAGES[i].pageName, //子页url
                    APP.CONFIG.SUB_PAGES[i].pageName + 'Page', {
                        top: '0px', //设置距离顶部的距离
                        bottom: isSafeArea ? '80px' : '55px', //设置距离底部的距离
                        zindex: 1,
                        scrollIndicator: 'none',
                        scalable: false,
                        kernel: 'WKWebview',
                        contentAjust: false
                    }
                );

                //将webview对象填充到窗口
                self.append(sub);
            }

            this.initDefaultItems();
            var isAutoUpgrade = APP.GLOBAL.getItem(APP.CONFIG.SYSTEM_KEYS.AUTO_UPGRADE_KEY);
            if (isAutoUpgrade === 'true') {
                this.checkUpgrade();
            }
        },
        'initDefaultItems': function () {
            var value = APP.GLOBAL.getItem(APP.CONFIG.SYSTEM_KEYS.NEW_MEMBER_KEY);
            if (value === null) {
                APP.GLOBAL.setItem(APP.CONFIG.SYSTEM_KEYS.NEW_MEMBER_KEY, 'true');
            }

            value = APP.GLOBAL.getItem(APP.CONFIG.SYSTEM_KEYS.NEW_BONUS_KEY);
            if (value === null) {
                APP.GLOBAL.setItem(APP.CONFIG.SYSTEM_KEYS.NEW_BONUS_KEY, 'true');
            }

            value = APP.GLOBAL.getItem(APP.CONFIG.SYSTEM_KEYS.AUTO_UPGRADE_KEY);
            if (value === null) {
                APP.GLOBAL.setItem(APP.CONFIG.SYSTEM_KEYS.AUTO_UPGRADE_KEY, 'true');
            }

            value = APP.GLOBAL.getItem(APP.CONFIG.SYSTEM_KEYS.CG_FIRST_KEY);
            if (value === null) {
                APP.GLOBAL.setItem(APP.CONFIG.SYSTEM_KEYS.CG_FIRST_KEY, 'true');
            }
        },
        'firstScreen': function () {
            var webView = plus.webview.currentWebview();
            webView.setStyle({ mask: 'rgba(0,0,0,0.8)' });

            var screenObj = plus.screen;
            var screenWidth = screenObj.resolutionWidth;
            var screenHeight = screenObj.resolutionHeight;
            var innerVer = plus.runtime.innerVersion;
            var verArray = innerVer.split('.');
            var verNumber = 0;
            for (var i = 0; i < verArray.length; i++) {
                verNumber += verArray[i] * 1;
            }

            var screenSize = {
                'height': screenHeight * (APP.CONFIG.SYSTEM_NAME !== 'ios' && verNumber === 61644 ? screenObj.scale : 1),
                'width': screenWidth * (APP.CONFIG.SYSTEM_NAME !== 'ios' && verNumber === 61644 ? screenObj.scale : 1)
            };

            var hotScreenSize = {
                'width': 300 * (APP.CONFIG.SYSTEM_NAME !== 'ios' && verNumber === 61644 ? screenObj.scale : 1),
                'height': 274.5 * (APP.CONFIG.SYSTEM_NAME !== 'ios' && verNumber === 61644 ? screenObj.scale : 1)
            };

            var hotScreen = plus.webview.create(
                'notice.html',
                'noticePage', {
                    'top': (screenSize.height - hotScreenSize.height) / 2,
                    'left': (screenSize.width - hotScreenSize.width) / 2,
                    'zindex': 10,
                    'width': hotScreenSize.width,
                    'height': hotScreenSize.height,
                    'scrollIndicator': 'none',
                    'scalable': false,
                    'kernel': 'WKWebview',
                    'background': 'transparent'
                }
            );
            hotScreen.addEventListener('loaded', function () {
                hotScreen.show('zoom-fade-out');
                _vue.runtimeMainActivity = plus.android.runtimeMainActivity();
            });
        },
        'switchPage': function (item) {
            if (this.currentIndex === item.index) return;

            this.currentIndex = item.index;
            if (APP.CONFIG.IS_RUNTIME) {
                var itemPage = APP.CONFIG.SUB_PAGES[item.index];
                var wb = plus.webview.getWebviewById(itemPage.pageName + 'Page');
                if (itemPage.isLoaded === false) {
                    itemPage.isLoaded = true;
                    wb.evalJS(itemPage.loadAction);
                }

                wb.show();
            }
        },
        'switchPageByIndex': function (index) {
            if (index < 0 || index >= this.menus.length) return;

            this.switchPage(this.menus[index]);
        },
        'hiddenApp': function () {
            if (APP.CONFIG.SYSTEM_NAME !== 'ios') {
                var activity = this.getActivity();
                activity.moveTaskToBack(false);
            }
        },
        'setClipBoard': function (text) {
            if (APP.CONFIG.SYSTEM_NAME === 'ios') {
                var UIPasteboard = plus.ios.importClass("UIPasteboard");
                var generalPasteboard = UIPasteboard.generalPasteboard();
                generalPasteboard.setValueforPasteboardType(text, "public.utf8-plain-text");
            } else {
                var Context = plus.android.importClass("android.content.Context");
                var activity = this.getActivity();
                var clip = activity.getSystemService(Context.CLIPBOARD_SERVICE);
                plus.android.invoke(clip, "setText", text);
            }
        },
        'getClipBoard': function (page, methodName) {
            var text = '';
            if (this.systemName === 'ios') {
                var UIPasteboard = plus.ios.importClass("UIPasteboard");
                var generalPasteboard = UIPasteboard.generalPasteboard();
                text = generalPasteboard.valueForPasteboardType("public.utf8-plain-text");
            } else {
                var Context = plus.android.importClass("android.content.Context");
                var activity = this.getActivity();
                var clip = activity.getSystemService(Context.CLIPBOARD_SERVICE);
                text = plus.android.invoke(clip, "getText");
            }

            var wb = plus.webview.getWebviewById(page);
            if (wb === null) return;

            wb.evalJS(methodName + '("' + text + '")');
        },
        'isEnablePushForIOS': function () {
            if (!APP.CONFIG.IS_RUNTIME) return;

            var UIApplication = plus.ios.import("UIApplication");
            var app = UIApplication.sharedApplication();
            var enabledTypes = 0;
            if (app.currentUserNotificationSettings) {
                var settings = app.currentUserNotificationSettings();
                enabledTypes = settings.plusGetAttribute("types");
            } else {
                enabledTypes = app.enabledRemoteNotificationTypes();
            }
            plus.ios.deleteObject(app);

            if (enabledTypes === 0) {
                plus.nativeUI.confirm(this.pushOptions.message, function (e) {
                    if (e.index === 1) {
                        var nsURL = plus.ios.import("NSURL");
                        var appSettings = nsURL.URLWithString("app-settings:");
                        var sharedApp = UIApplication.sharedApplication();
                        sharedApp.openURL(appSettings);

                        plus.ios.deleteObject(sharedApp);
                        plus.ios.deleteObject(appSettings);
                        plus.ios.deleteObject(nsURL);
                    }
                }, this.pushOptions.opt);
            }
        },
        'isEnablePushForAndroid': function () {
            if (!APP.CONFIG.IS_RUNTIME) return;

            var NotificationManagerCompat = plus.android.importClass("android.support.v4.app.NotificationManagerCompat");
            var activity = this.getActivity();
            var packageNames = NotificationManagerCompat.from(activity);
            if (!packageNames.areNotificationsEnabled()) {
                plus.nativeUI.confirm(this.pushOptions.message, function (e) {
                    if (e.index === 1) {
                        var Intent = plus.android.importClass('android.content.Intent');
                        var intent = new Intent('android.settings.APP_NOTIFICATION_SETTINGS');
                        intent.putExtra('android.provider.extra.APP_PACKAGE', activity.getPackageName());
                        activity.startActivity(intent);
                    }
                }, this.pushOptions.opt);
            }
        },
        'checkUpgrade': function (isCheckonly) {
            if (this.isChecking) return;

            this.isChecking = true;
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'CheckVersion',
                data: {
                    'ver': APP.CONFIG.VERSION
                },
                success: function (result) {
                    _vue.isChecking = false;
                    if (result.Error) return;

                    if (result.IsUpgrade) {
                        if (typeof isCheckonly === 'boolean') {
                            plus.webview.getWebviewById('settingPage').evalJS('_vue.checkCallback(true, "' + result.BaseUrl + '", "' + result.Version + '")');
                        } else {
                            _vue.downloadWGT(result.BaseUrl, result.Version);
                        }
                    } else {
                        if (typeof isCheckonly === 'boolean') {
                            plus.webview.getWebviewById('settingPage').evalJS('_vue.checkCallback(false, "' + result.BaseUrl + '", "' + result.Version + '")');
                        }
                    }
                }
            });
        },
        'downloadWGT': function (baseUrl, ver) {
            plus.nativeUI.showWaiting('正在下载更新\r\n这可能需要一段时间...', {
                'back': 'none'
            });

            var wgtUrl = baseUrl + 'upgrade/' + ver + '.wgt';
            var downloader = plus.downloader.createDownload(wgtUrl, {
                'filename': '_doc/update/kb_' + ver + '.wgt',
                'timeout': 60000
            }, this.completed);

            downloader.addEventListener("statechanged", this.onStateChanged);
            downloader.start();
        },
        'completed': function (d, status) {
            if (status !== 200) {
                plus.nativeUI.closeWaiting();
                return;
            }

            plus.runtime.install(d.filename, {}, function () {
                plus.nativeUI.closeWaiting();
                plus.nativeUI.alert('APP升级完成，点击“确定”按钮后重新启动。', function () {
                    plus.runtime.restart();
                }, '更新完成');
            }, function (e) {
                plus.nativeUI.closeWaiting();
                plus.nativeUI.alert('升级过程中出现了异常，详情：' + e.message, null, '更新失败');
            });
        },
        'onStateChanged': function (download, status) {
            if (download.state === 2 && status === 404) {
                download.abort();
                plus.nativeUI.closeWaiting();
                plus.nativeUI.alert('没有找到更新包资源，请联系技术人员进行排查', null, '更新失败');
            }
        },
        'pushMessageReceive': function (pushMessage) {
            if (typeof pushMessage.payload['isLocal'] !== 'undefined') return;

            var isCreateLocal = false;
            var msg = typeof pushMessage.payload === 'string' ? JSON.parse(pushMessage.payload) : pushMessage.payload;
            if (msg.PushType === 1) {
                isCreateLocal = APP.GLOBAL.getItem(APP.CONFIG.SYSTEM_KEYS.NEW_MEMBER_KEY) === 'true';
                if (isCreateLocal) {
                    this.newMemberPlayer.play();
                }
            } else if (msg.PushType === 2) {
                isCreateLocal = APP.GLOBAL.getItem(APP.CONFIG.SYSTEM_KEYS.NEW_BONUS_KEY) === 'true';
                if (isCreateLocal) {
                    this.newBonusPlayer.play();
                }
            }

            if (isCreateLocal) {
                var options = { cover: false };
                msg['isLocal'] = true;
                plus.push.createMessage(msg.Content, msg, options);
            }
        },
        'pushClick': function (pushMessage) {
            var msg = typeof pushMessage.payload === 'string' ? JSON.parse(pushMessage.payload) : pushMessage.payload;
            var currentPage = plus.webview.getTopWebview();

            if (msg.PushType === 2) {
                if (currentPage.id !== 'awardDetailPage') {
                    var date = new Date();
                    var dateStr = date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate();
                    APP.GLOBAL.gotoNewWindow('awardListPage', 'center/subPages/awardList', {
                        param: 's=' + encodeURIComponent(dateStr + ' 00:00:00') +
                            '&e=' + encodeURIComponent(dateStr + ' 23:59:59') +
                            '&cId=' + msg.CurrencyId
                    });
                }
            } else {
                if (currentPage.id !== 'my.teamPage') {
                    APP.GLOBAL.gotoNewWindow('my.teamPage', 'center/my.team');
                }
            }
        },
        'getActivity': function () {
            if (this.runtimeMainActivity === null) {
                this.runtimeMainActivity = plus.android.runtimeMainActivity();
            }

            return this.runtimeMainActivity;
        },
        'updatePage': function () {
            this.currentUser = Object.assign(this.currentUser, APP.GLOBAL.getUserModel());
        }
    },
    created: function () {
        if (APP.CONFIG.IS_RUNTIME) {
            plus.navigator.setStatusBarStyle('dark');
        }
    },
    mounted: function () {
        this.ready();
    }
});

//当APP重新激活时检查是否需要更新
document.addEventListener('resume', function () {
    var isAutoUpgrade = APP.GLOBAL.getItem(APP.CONFIG.SYSTEM_KEYS.AUTO_UPGRADE_KEY);
    if (isAutoUpgrade === 'true') {
        _vue.checkUpgrade();
    }
});
plus.push.addEventListener("receive", _vue.pushMessageReceive);
plus.push.addEventListener('click', _vue.pushClick);