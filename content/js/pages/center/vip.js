Vue.use(vant.Lazyload, {
    'loading': '../../content/img/default_avatar.jpg',
    'error': '../../content/img/default_avatar.jpg'
});

var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'statusbarHeight': 20,
        'isLoadLevels': true,
        'isLoadCurrentLevel': true,
        'isLevelShow': false,
        'isMax': false,
        'display': {
            'levelName': '请选择',
            'amount': 0
        },
        'currentLevel': {
            'lv': 0,
            'name': ''
        },
        'nextLevelId': 0,
        'levelColumns': [],
        'alipayChannel': null
    },
    methods: {
        'checkData': function () {
            if (this.nextLevelId === 0) {
                APP.GLOBAL.toastMsg('请选择要升的等级');
            } else {
                this.doSubmitAjax();
            }
        },
        'doSubmitAjax': function () {
            APP.GLOBAL.toastLoading({ 'message': '准备支付' });

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'Investment',
                data: {
                    'id': this.nextLevelId
                },
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.closeToastLoading();
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    if (APP.CONFIG.IS_RUNTIME) {
                        plus.payment.request(_vue.alipayChannel,
                            result.Data,
                            _vue.paySuccess,
                            _vue.payError);
                    }
                }
            });
        },
        'paySuccess': function (result) {
            APP.GLOBAL.gotoNewWindow('upgrade.successPage', 'subPages/upgrade.success', {
                'param': 'amount=' + this.display.amount,
                'openCallback': function () {
                    APP.GLOBAL.closeWindow('none');
                }
            });
        },
        'payError': function (error) {
            APP.GLOBAL.closeToastLoading();

            if (error.code === -100) {
                APP.GLOBAL.toastMsg('已取消支付');
            }
        },
        'onConfirm': function (item) {
            this.display.levelName = item.value.Name;
            this.display.amount = item.value.Amount;
            this.nextLevelId = item.value.Id;
            this.isLevelShow = false;
        },
        'loadLevelsAjax': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'Levels',
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    var maxLevel = _vue.getMaxLevel(result.Data);
                    if (maxLevel !== null && _vue.currentLevel.lv === maxLevel.Id) {
                        _vue.isMax = true;
                    }

                    for (var i = 0; i < result.Data.length; i++) {
                        if (result.Data[i].Id > _vue.currentLevel.lv) {
                            _vue.levelColumns.push({
                                'text': result.Data[i].Name + ' (￥' + numberFormat(result.Data[i].Amount, 2) + ')',
                                'value': result.Data[i]
                            });
                        }
                    }
                    _vue.isLoadLevels = false;
                }
            });
        },
        'loadCurrentLevel': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'CalcLevel',
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    APP.GLOBAL.updateUserModel({
                        'LvName': result.Data.Name
                    }, [{
                        'pageName': 'center.htmlPage',
                        'actionName': '_vue.updatePage()'
                    }]);

                    _vue.currentLevel.lv = result.Data.LvId;
                    _vue.currentLevel.name = result.Data.Name;
                    _vue.isLoadCurrentLevel = false;

                    _vue.loadLevelsAjax();
                }
            });
        },
        'getMaxLevel': function (list) {
            for (var i = 0; i < list.length; i++) {
                if (list[i].IsMax) return list[i];
            }

            return null;
        }
    },
    created: function () {
        if (APP.CONFIG.IS_RUNTIME) {
            this.statusbarHeight = plus.navigator.getStatusbarHeight();
        }
    },
    mounted: function () {
        if (APP.CONFIG.IS_RUNTIME) {
            plus.payment.getChannels(function (channels) {
                var _any = function (c) {
                    for (var i = 0; i < c.length; i++) {
                        if (c[i].id === 'alipay') return c[i];
                    }

                    return null;
                };

                _vue.alipayChannel = _any(channels);
                if (_vue.alipayChannel === null) {
                    APP.GLOBAL.toastMsg('支付宝通道错误');
                } else {
                    _vue.loadCurrentLevel();
                }
            }, function (e) {
                APP.GLOBAL.toastMsg('获取支付通道失败：' + e.message);
            });
        } else {
            this.loadCurrentLevel();
        }
    }
});