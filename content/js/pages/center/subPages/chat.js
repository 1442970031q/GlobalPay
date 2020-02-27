Vue.use(vant.Lazyload, {
    'loading': '../../../content/img/default_avatar.jpg',
    'error': '../../../content/img/default_avatar.jpg'
});

var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'isLoading': true,
        'isActionsheet': false,
        'statusbarHeight': 20,
        'isSafeArea': true,
        'isSend': false,
        'chats': [],
        'ServiceNotice': '',
        'form': {
            'oId': APP.GLOBAL.queryString('oId'),
            'txt': ''
        },
        'lastQueryTime': new Date(),
        'lastHandler': null,
        'actions': [{
            'name': '拍照选取',
            'callback': null
        }, {
            'name': '从相册选取',
            'callback': null
        }]
    },
    methods: {
        'openCamera': function () {
            this.isActionsheet = false;
            var camera = plus.camera.getCamera();
            camera.captureImage(this.resolveFile);
        },
        'openGallery': function () {
            this.isActionsheet = false;
            plus.gallery.pick(this.resolveFile);
        },
        'resolveFile': function (captureFile) {
            this.isSend = true;

            plus.io.resolveLocalFileSystemURL(captureFile, function (entry) {
                plus.zip.compressImage({
                    'src': entry.toLocalURL(),
                    'dst': '_downloads/chat_' + _vue.form.oId + '.jpg',
                    'overwrite': true,
                    'format': 'jpg',
                    'width': 'auto',
                    'height': 'auto',
                    'quality': 40
                }, function (event) {
                    _vue.compressCompleted(event);
                }, function (error) {
                    _vue.isSend = false;
                    APP.GLOBAL.toastMsg(error.message);
                });
            });
        },
        'compressCompleted': function (event) {
            var reader = new plus.io.FileReader();
            reader.onloadend = function (e) {
                var base64 = e.target.result.toString().replace('data:image/jpeg;base64,', '');
                _vue.chats.push({
                    'Text': 'data:image/jpeg;base64,' + base64,
                    'CommentType': 2
                });

                _vue.$nextTick(function () {
                    window.scrollTo(0, document.body.scrollHeight);
                });

                _vue.doSubmitImageAjax(base64);
            };
            reader.onerror = function (fe) {
                _vue.isSend = false;
                APP.GLOBAL.toastMsg('读取错误：' + fe.error);
            };
            reader.readAsDataURL(event.target.replace('file://', ''));
        },
        'doSubmitImageAjax': function (base64) {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'OrderImageComment',
                data: {
                    'oid': this.form.oId,
                    'base64': encodeURIComponent(base64)
                },
                success: function (result) {
                    _vue.isSend = false;

                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                    } else {
                        APP.GLOBAL.toastMsg('图片已发送');
                    }
                }
            });
        },
        'loadMessageAjax': function () {
            this.lastQueryTime = new Date();
            clearTimeout(this.lastHandler);

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'MyOrderComments',
                data: {
                    'oid': this.form.oId
                },
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.ServiceNotice = result.Data.ServiceNotice;
                    _vue.chats = result.Data.List;
                    _vue.isLoading = false;

                    var ts = new Date().getTime() - _vue.lastQueryTime.getTime();
                    var timeout = 1 * 3000 - ts;

                    _vue.lastHandler = setTimeout(_vue.loadMessageAjax, timeout);
                }
            });
        },
        'checkSend': function () {
            if (!this.form.txt) return;

            this.isSend = true;
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'OrderComment',
                data: this.form,
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    var d = new Date();
                    _vue.chats.push({
                        'Text': _vue.form.txt,
                        'CommentType': 1,
                        'CreateTime': d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes()
                    });
                    _vue.isSend = false;
                    _vue.form.txt = '';

                    _vue.$nextTick(function () {
                        window.scrollTo(0, document.body.scrollHeight);
                    });
                }
            });
        }
    },
    created: function () {
        if (APP.CONFIG.IS_RUNTIME) {
            this.statusbarHeight = plus.navigator.getStatusbarHeight();
        }
		
		this.actions[0].callback = this.openCamera;
		this.actions[1].callback = this.openGallery;
    },
    mounted: function () {
        this.loadMessageAjax();
    }
});