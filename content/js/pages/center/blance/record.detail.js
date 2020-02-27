var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'statusbarHeight': 20,
        'id': APP.GLOBAL.queryString('id'),
        'detailData': '',
        'isLoading': true
    },
    created: function () {
        if (APP.CONFIG.IS_RUNTIME) {
            this.statusbarHeight = plus.navigator.getStatusbarHeight();
        }
        this.doSubmitAjax();
    },
    methods: {
        'doSubmitAjax': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'TakeCashDes',
                data: {
                    'id': this.id
                },
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.detailData = result.Data;
                    _vue.isLoading = false;

                }
            });
        }
    }
});