Vue.use(vant.Lazyload, {
    'loading': '../../content/img/default_avatar.jpg',
    'error': '../../content/img/default_avatar.jpg'
});

var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'isActionsheet': false,
        'actions': [{
            'name': '拍照选取',
            'callback': null
        }, {
            'name': '从相册选取',
            'callback': null
        }],
        'statusbarHeight': 20
    },
    methods: {
        'updatePage': function () {
            this.currentUser = Object.assign(this.currentUser, APP.GLOBAL.getUserModel());
        },
        'openCamera': function () {
            this.isActionsheet = false;

            var camera = plus.camera.getCamera();
            camera.captureImage(this.resolveFile);
        },
        'openGallery': function () {
            this.isActionsheet = false;
            plus.gallery.pick(function (path) {
                _vue.resolveFile(path);
            });
        },
        'resolveFile': function (captureFile) {
            APP.GLOBAL.toastLoading({ 'message': '正在加载' });

            plus.io.resolveLocalFileSystemURL(captureFile, function (entry) {
                var fileName = APP.CONFIG.SYSTEM_NAME === 'ios' ? entry.toRemoteURL() : entry.toLocalURL();

                APP.GLOBAL.gotoNewWindow('croppaPage', 'croppa', {
                    ani: 'slide-in-bottom',
                    param: 'fn=' + encodeURIComponent(fileName),
                    openCallback: function () {
                        plus.navigator.setStatusBarStyle('light');
                        APP.GLOBAL.closeToastLoading();
                    },
                    closeCallback: function () {
                        plus.navigator.setStatusBarStyle('dark');
                    }
                });
            });
        }
    },
    computed: {
        'phoneMask': function() {
            if (!this.currentUser.Phone || this.currentUser.Phone.length !== 11) return this.currentUser.Phone;

            return this.currentUser.Phone.substring(0, 3) + '*****' + this.currentUser.Phone.substring(8);
        }
    },
    created: function () {
        if (APP.CONFIG.IS_RUNTIME) {
            this.statusbarHeight = plus.navigator.getStatusbarHeight();
        }
		
		this.actions[0].callback = this.openCamera;
		this.actions[1].callback = this.openGallery;
    }
});