Vue.use(vant.Lazyload, {
    'loading': '../../../content/img/default_avatar.jpg',
    'error': '../../../content/img/default_avatar.jpg'
});

var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'searchKey': '',
        'isSearch': false,
        'isLoading': false,
        'isFound': false,
        'pageModel': {},
        'statusbarHeight': 20
    },
    methods: {
        'getRelationship': function (fs) {
            if (fs === 'S') {
                return 'A';
            } else if (fs === 'D') {
                return 'B';
            } else {
                return 'T';
            }
        },
        'doSearch': function () {
            if (this.searchKey.length < 5) {
                APP.GLOBAL.toastMsg('ID号至少5位数字');
            } else if (isNaN(this.searchKey)) {
                APP.GLOBAL.toastMsg('ID号是纯数字');
            } else {
                this.doSearchAjax();
            }
        },
        'doSearchAjax': function () {
            this.isSearch = true;
            this.isLoading = true;

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'MyTeamUser',
                data: {
                    'flowNumber': this.searchKey
                },
                success: function (result) {
                    if (result.Error) {
                        _vue.isLoading = false;
                        _vue.isFound = false;
                        return;
                    }

                    Vue.set(_vue, 'pageModel', result.Data);
                    _vue.isFound = true;
                    _vue.isLoading = false;
                }
            });
        }
    },
    created: function () {
        if (APP.CONFIG.IS_RUNTIME) {
            this.statusbarHeight = plus.navigator.getStatusbarHeight();
        }
    }
});