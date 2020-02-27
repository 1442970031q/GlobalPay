var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'id': APP.GLOBAL.queryString('aId'),
        'isLoading': true,
        'isDefault': false,
        'isShowArea': false,
        'displayName': '',
        'areaCode': 0,
        'address': '',
        'name': '',
        'tel': '',
        'areaList': testAreaList,
        'statusbarHeight': 20
    },
    methods: {
        'saveCallback': function () {
            if (!this.name) {
                APP.GLOBAL.toastMsg('请输入收货人姓名');
            } else if (this.name.length < 2) {
                APP.GLOBAL.toastMsg('收货人姓名最少需要2个字');
            } else if (!this.tel) {
                APP.GLOBAL.toastMsg('请输入联系电话');
            } else if (this.tel.length < 11) {
                APP.GLOBAL.toastMsg('请输入有效的联系电话')
            } else if (this.areaCode <= 0) {
                APP.GLOBAL.toastMsg('请选择所在地区');
            } else if (!this.address) {
                APP.GLOBAL.toastMsg('请输入详细地址');
            } else {
                this.doSubmitAjax();
            }
        },
        'doSubmitAjax': function () {
            APP.GLOBAL.toastLoading({ 'message': '正在修改' });

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'EditShippingAddress',
                data: {
                    'addressId': this.id,
                    'name': this.name,
                    'phone': this.tel,
                    'districtCode': this.areaCode,
                    'address': this.address,
                    'isdefault': this.isDefault
                },
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.closeToastLoading();
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    if (APP.CONFIG.IS_RUNTIME) {
                        var addressList = plus.webview.getWebviewById('my.addressPage');
                        if (addressList !== null) {
                            addressList.reload(true);
                        }
                        
                        APP.GLOBAL.closeWindow();
                    } else {
                        APP.GLOBAL.toastMsg('修改完毕');
                    }
                }
            });
        },
        'selected': function (value) {
            if (value[0].code === -1) {
                APP.GLOBAL.toastMsg('请选择省份！');
            } else if (value[1].code === -1) {
                APP.GLOBAL.toastMsg('请选择城市！');
            } else if (value[2].code === -1) {
                APP.GLOBAL.toastMsg('请选择地区！');
            } else {
                this.isShowArea = false;
                this.areaCode = value[2].code;
                this.displayName = value[0].name + ' / ' + value[1].name + ' / ' + value[2].name;
            }
        },
        'loadPageData': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'EditLoadingData',
                data: {
                    'addressId': this.id
                },
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.name = result.Data.Name;
                    _vue.address = result.Data.DetailedAddress;
                    _vue.tel = result.Data.Phone;
                    _vue.areaCode = result.Data.AreaCode;
                    _vue.isDefault = result.Data.IsDefault;
                    _vue.displayName = result.Data.ProvinceCode + ' / ' + result.Data.CityCode + ' / ' + result.Data.DistrictCode;
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