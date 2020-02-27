Vue.use(vant.Lazyload, {
    'loading': '../content/img/default_product_800_600.jpg',
    'error': '../content/img/default_product_800_600.jpg',
    'attempt': 1
});

var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'isLoading': true,
        'isLoadCollect': true,
        'isLoadAddress': true,
        'isCollect': false,
        'isBankCardShow': false,
        'isFocus': false,
        'isReloading': false,
        'isFull': false,
        'statusbarHeight': 20,
        'headOpacity': 0,
        'addressObject': null,
        'pageData': {
            'images': [],
            'Limit': false
        },
        'request': {
            'id': APP.GLOBAL.queryString('pId'),
            'product': APP.GLOBAL.queryString('product')
        },
        'form': {
            'fNumber': '',
            'lNumber': '',
            'shippingId': '',
            'buyRemark': ''
        }
    },
    methods: {
        'selectAddress': function () {
            if (this.currentUser.Id === 0) {
                APP.GLOBAL.gotoNewWindow('loginPage', 'account/login', {
                    'param': 'from=detail'
                });
            } else {
                APP.GLOBAL.gotoNewWindow('my.addressPage', 'center/subPages/my.address', {
                    param: 'isClickClose=true'
                });
            }
        },
        'confirmAddress': function (id, name, tel, address) {
            this.addressObject = {
                id: id,
                name: name,
                tel: tel,
                address: address
            };
            this.form.shippingId = id;
        },
        'flushQueue': function () {
            this.isLoading = true;
            this.loadPageData();
        },
        'reloadCollect': function () {
            this.currentUser = Object.assign(this.currentUser, APP.GLOBAL.getUserModel());
            this.loadCollectionAjax();
        },
        'collection': function () {
            if (this.currentUser.Id === 0) {
                APP.GLOBAL.gotoNewWindow('loginPage', 'account/login', {
                    'param': 'from=detail'
                });
            } else {
                this.doCollectionAjax();
            }
        },
        'cancelCollection': function () {
            this.isLoadCollect = true;

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'Collect',
                data: {
                    'id': this.request.id,
                    'isCollect': false
                },
                success: function (result) {
                    _vue.isLoadCollect = false;

                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                    } else {
                        _vue.isCollect = false;
                        _vue.$toast.success({
                            'message': '已取消',
                            'duration': 800
                        });
                    }
                }
            });
        },
        'doCollectionAjax': function () {
            this.isLoadCollect = true;

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'Collect',
                data: {
                    'id': this.request.id,
                    'isCollect': true
                },
                success: function (result) {
                    _vue.isLoadCollect = false;

                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                    } else {
                        _vue.isCollect = true;
                        _vue.$toast.success({
                            'message': '已收藏',
                            'duration': 800
                        });
                    }
                }
            });
        },
        'loadPageData': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'ProductDetail',
                data: this.request,
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.closeToastLoading();
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    if (result.Data.IsFull) {
                        _vue.isFull = true;
                        _vue.isLoading = false;
                        return;
                    }

                    _vue.pageData.images = [];
                    var imgList = result.Data.Text.toString().match(/<img.*?(?:>|\/>)/gi);
                    for (var i = 0; i < imgList.length; i++) {
                        var url = imgList[i].match(/src=[\'\"]?([^\'\"]*)[\'\"]?/i);
                        _vue.pageData.images.push(url[1]);
                    }

                    _vue.pageData = Object.assign({}, _vue.pageData, result.Data);
                    _vue.isLoading = false;

                    setTimeout(function () {
                        _vue.isReloading = false;
                    }, 500);
                }
            });
        },
        'loadCollectionAjax': function () {
            this.isLoadCollect = true;

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'IsCollected',
                data: this.request,
                success: function (result) {
                    if (result.Error) {
                        _vue.isCollect = false;
                    } else {
                        _vue.isCollect = result.Data.IsCollected;
                    }

                    _vue.isLoadCollect = false;
                }
            });
        },
        'loadDefaultAddress': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + "MyDefaultAddress",
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    if (result.IsHave) {
                        _vue.addressObject = {
                            id: result.id,
                            name: result.name,
                            tel: result.tel,
                            address: result.address
                        };
                        _vue.form.shippingId = result.id;
                    }

                    _vue.isLoadAddress = false;
                }
            });
        },
        'confirmPayment': function () {
            if (this.currentUser.Id === 0) {
                APP.GLOBAL.gotoNewWindow('loginPage', 'account/login', {
                    'param': 'from=detail'
                });
            } else if (this.pageData.Limit) {
                this.$dialog.alert({
                    'title': '无法支付',
                    'message': '平台检测到您频繁下单，请明天再来吧<p style="text-align:center">(￣_,￣ )</p>'
                });
            }

            if (this.pageData.QueueCount === this.pageData.MaxQueueCount) {
                APP.GLOBAL.toastMsg('当前排队人数已满，请稍后再试');
            } else {
                this.isBankCardShow = true;
            }
        },
        'checkCardNumber': function () {
            if (!this.form.fNumber || this.form.fNumber.length !== 6) {
                APP.GLOBAL.toastMsg('请输入完整的前6位卡号');
            } else if (!this.form.lNumber || this.form.lNumber.length !== 4) {
                APP.GLOBAL.toastMsg('请输入完整的后4位卡号');
            } else if (this.pageData.IsEntity) {
                APP.GLOBAL.confirmMsg({
                    'title': '再次确认',
                    'message': '<p>' + this.pageData.EntityWarn + '</p><p><b>请再次确认是否购买？</b></p>',
                    'confirmButtonText': '确认购买',
                    'cancelButtonText': '取消',
                    'confirmCallback': this.doCreateOrderAjax
                });
            } else {
                APP.GLOBAL.confirmMsg({
                    'title': '再次确认',
                    'message': '<p>此攻略为有偿咨询，一经购买概不退款</p><p><b>请再次确认是否购买？</b></p>',
                    'confirmButtonText': '确认购买',
                    'cancelButtonText': '取消',
                    'confirmCallback': this.doCreateOrderAjax
                });
            }
        },
        'doCreateOrderAjax': function () {
            APP.GLOBAL.toastLoading({
                'message': '正在下单'
            });

            this.form['cId'] = this.request.id;
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'NewOrder',
                data: this.form,
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.closeToastLoading();
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    if (APP.IS_RUNTIME) {
                        plus.webview.getWebviewById('orders.htmlPage').evalJS('_vue.reloadList()');
                    }
                    if (result.Data.IsJust) {
                        APP.GLOBAL.gotoNewWindow('order.waitPage', 'order.wait', {
                            'param': 'oId=' + result.Data.NewId +
                                '&itemId=' + result.Data.ItemId +
                                '&isAuto=' + _vue.pageData.IsAuto,
                            'openCallback': function () {
                                if (APP.CONFIG.IS_RUNTIME) {
                                    plus.webview.getWebviewById('orders.htmlPage').evalJS('_vue.flushOrder()');
                                }

                                APP.GLOBAL.closeWindow('none');
                            }
                        });
                        return;
                    }
                    APP.GLOBAL.gotoNewWindow('upload.pay.codelPage', 'center/subPages/upload.pay.code', {
                        'param': 'oId=' + result.Data.NewId,
                        'openCallback': function () {
                            if (APP.CONFIG.IS_RUNTIME) {
                                plus.webview.getWebviewById('orders.htmlPage').evalJS('_vue.flushOrder()');
                            }

                            APP.GLOBAL.closeWindow('none');
                        }
                    });
                }
            });
        },
        'scrollChange': function (top) {
            var rat = top / (this.statusbarHeight + 45);
            this.headOpacity = rat > 1 ? 1 : rat;
        }
    },
    watch: {
        'isBankCardShow': function (newValue, oldValue) {
            if (newValue && !oldValue) {
                this.form.fNumber = '';
                this.form.lNumber = '';
            }
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

        if (this.currentUser.Id !== 0) {
            this.loadCollectionAjax();
            this.loadDefaultAddress();
        } else {
            this.isLoadCollect = false;
        }
    }
});
