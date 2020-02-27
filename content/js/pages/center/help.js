var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'statusbarHeight': 20,
        'isLoading': true,
        'helpList': []
    },
    methods: {
        'gotoDetail': function (item) {
            APP.GLOBAL.gotoNewWindow('help.detailPage', 'subPages/help.detail', {
                'param': 'hId=' + item.Id + '&title=' + encodeURIComponent(item.Title)
            });
        },
        'loadDataPage': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'Courses',
                success: function (result) {
                    APP.GLOBAL.closeToastLoading();
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.helpList = result.Data;
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
        this.loadDataPage();
    }
});