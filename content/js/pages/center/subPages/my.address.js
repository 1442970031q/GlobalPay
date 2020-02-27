var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'isLoading': true,
        'chosenAddressId': 0,
        'list': [],
        'statusbarHeight': 20
    },
    methods: {
        'onAdd': function () {
            APP.GLOBAL.gotoNewWindow('new.addressPage', 'new.address', {
                ani: 'slide-in-bottom'
            });
        },
        'onEdit': function (item, index) {
            APP.GLOBAL.gotoNewWindow('modify.addressPage', 'modify.address', {
                ani: 'slide-in-bottom',
                param: 'aId=' + item.id
            });
        },
        'onSelect': function (item, index) {
            if (APP.GLOBAL.queryString('isClickClose')) {
                setTimeout(function () {
                    _vue.chosenAddressId = item.id;
                    _vue.onAddressChange(item);
                    APP.GLOBAL.closeWindow();
                }, 200);
            } else if (APP.GLOBAL.queryString('isSwitch')) {
                setTimeout(function () {
                    _vue.chosenAddressId = item.id;
                    _vue.onSwitchAddress(item);
                    APP.GLOBAL.closeWindow();
                }, 200);
            }
        },
        //'onSwitchAddress': function (item) {
        //    var webView = plus.webview.getWebviewById('receive.productPage');
        //    if (webView === null) return;

        //    webView.evalJS('_vue.changeAddress(' + item.id + ', "' + item.name + '", "' + item.tel + '", "' + item.address + '")');
        //},
        'onAddressChange': function (item) {
            var webView = plus.webview.getWebviewById('detailPage');
            if (webView === null) return;

            webView.evalJS('_vue.confirmAddress(' + item.id + ', "' + item.name + '", "' + item.tel + '", "' + item.address + '")');
        },
        'setDefault': function () {
            if (this.list.length === 0) return;

            for (var i = 0; i < this.list.length; i++) {
                if (this.list[i].IsDefault) {
                    this.chosenAddressId = this.list[i].id;
                    break;
                }
            }
        },
        'loadPageData': function () {
            this.isLoading = true;

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'MyShippingAddressList',
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.list = result.Data;
                    if (_vue.list.length !== 0) {
                        _vue.setDefault();
                    }

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