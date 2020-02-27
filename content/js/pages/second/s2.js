var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'isList': true,
        'statusbarHeight': 20,
        'form': {
            'bankId': '',
            'realName': '',
            'phone': ''
        },
        'selectedBank': null,
        'childPages': []
    },
    methods: {
        'loadPageData': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'CreditBanks',
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.childPages = result.Data;
                }
            });
        },
        'gotoChildPage': function (item) {
            this.selectedBank = item;
            this.form.bankId = item.Id;
            this.isList = false;
        },
        'closeForm': function () {
            this.form.bankId = '';
            this.form.realName = '';
            this.form.phone = '';
            this.isList = true;
        },
        'checkData': function () {
            if (!this.form.realName) {
                APP.GLOBAL.toastMsg('请填写您的真实姓名');
            } else if (this.form.realName.length < 2) {
                APP.GLOBAL.toastMsg('姓名必须大于2个汉字');
            } else if (!this.form.phone) {
                APP.GLOBAL.toastMsg('请填写您的手机号码');
            } else if (this.form.phone.length !== 11 || this.form.phone[0] !== '1') {
                APP.GLOBAL.toastMsg('手机号码格式不正确');
            } else {
                this.doSubmitAjax();
            }
        },
        'doSubmitAjax': function () {
            APP.GLOBAL.toastLoading({ 'message': '正在提交' });
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'SubmitCredit',
                data: this.form,
                success: function (result) {
                    APP.GLOBAL.closeToastLoading();

                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                    } else {
                        APP.GLOBAL.gotoNewWindow('s2_childPage', 's2_child', {
                            'param': 'url=' + encodeURIComponent(_vue.selectedBank.TargetAddress) +
                                '&title=' + encodeURI(_vue.selectedBank.BankName),
                            'openCallback': function () {
                                APP.GLOBAL.closeWindow('none');
                            }
                        });
                    }
                }
            });
        }
    },
    computed: {
        'screenHeight': function () {
            if (APP.CONFIG.IS_RUNTIME && APP.CONFIG.SYSTEM_NAME !== 'ios') {
                return plus.display.resolutionHeight;
            } else {
                return document.body.clientHeight;
            }
        },
        'bgHeight': function () {
            return document.getElementById('bg').clientHeight;
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