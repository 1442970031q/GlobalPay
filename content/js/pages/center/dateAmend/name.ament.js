var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'statusbarHeight': 20,
        'nickName': ''
    },
    methods: {
        'changeName': function () {
            if (!this.nickName) {
                APP.GLOBAL.toastMsg("请输入新昵称");
            } else if (this.nickName === this.currentUser.NickName) {
                APP.GLOBAL.toastMsg("新昵称与当前相同");
            } else {
                this.doSubmitAjax();
            }
        },
        'doSubmitAjax': function () {
            APP.GLOBAL.toastLoading({ 'message': '正在修改' });
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'SaveUserExtend',
                data: {
                    'nickName': this.nickName
                },
                success: function (result) {
                    APP.GLOBAL.closeToastLoading();
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    APP.GLOBAL.updateUserModel({
                        'NickName': _vue.nickName
                    }, [{
                        'pageName': 'center.htmlPage',
                        'actionName': '_vue.updatePage()'
                    }, {
                        'pageName': 'presonDataPage',
                        'actionName': '_vue.updatePage()'
                    }]);
                    APP.GLOBAL.toastMsg('修改成功');
                    APP.GLOBAL.closeWindow();
                }
            });
        }
    },
    created: function () {
        if (APP.CONFIG.IS_RUNTIME) {
            this.statusbarHeight = plus.navigator.getStatusbarHeight();
        }

        this.nickName = this.currentUser.NickName;
    }
});