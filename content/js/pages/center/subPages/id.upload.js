var _vue = new Vue({
    el: '#app',
    data() {
        return {
            'currentUser': APP.GLOBAL.getUserModel(),
            'statusbarHeight': 20,
            'imageType': '',
            'isLoading': true,
            'isActionsheet': false,
            'isEnable': false,
            'uploadState': 0,
            'reason': '',
            'actions': [{
                'name': '拍照选取',
                'callback': this.openCamera
            }, {
                'name': '从相册选取',
                'callback': this.openGallery
            }],
            'images': {
                'front': {
                    'image': '',
                    'base64': ''
                },
                'back': {
                    'image': '',
                    'base64': ''
                }
            }
        };
    },
    methods: {
        'doUploadAjax': function () {
            APP.GLOBAL.toastLoading({ 'message': '正在上传' });

            plus.zip.compressImage({
                'src': this.images.front.image,
                'dst': "_downloads/front.jpg",
                'overwrite': true,
                'format': 'jpg',
                'width': 'auto',
                'height': 'auto',
                'quality': 40
            }, function (event) {
                _vue.compressCompleted(event, 'front');
            });

            plus.zip.compressImage({
                'src': this.images.back.image,
                'dst': '_downloads/back.jpg',
                'overwrite': true,
                'format': 'jpg',
                'width': 'auto',
                'height': 'auto',
                'quality': 40
            }, function (event) {
                _vue.compressCompleted(event, 'back');
            });
        },
        'compressCompleted': function (event, type) {
            var reader = new plus.io.FileReader();
            reader.onloadend = function (e) {
                _vue.images[type].base64 = e.target.result.toString().replace('data:image/jpeg;base64,', '');

                if (_vue.images.front.base64 && _vue.images.back.base64) {
                    _vue.doSubmitAjax();
                }
            };
            reader.readAsDataURL(event.target.replace('file://', ''));
        },
        'doSubmitAjax': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'UploadIDCard',
                data: {
                    'front': encodeURIComponent(this.images.front.base64),
                    'reverse': encodeURIComponent(this.images.back.base64)
                },
                success: function (result) {
                    APP.GLOBAL.closeToastLoading();

                    if (result.Error) {
                        _vue.images.front.base64 = '';
                        _vue.images.back.base64 = '';
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.uploadState = 1;

                    _vue.$dialog.alert({
                        'title': '上传成功',
                        'message': '我们已收到您的证件照，请耐心等待我们的审核结果，这可能需要1-2个工作日'
                    }).then(function () {
                        APP.GLOBAL.closeWindow();
                    });
                }
            });
        },
        'openSheet': function (type) {
            this.imageType = type;
            this.isActionsheet = true;
        },
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
            plus.io.resolveLocalFileSystemURL(captureFile, function (entry) {
                _vue.images[_vue.imageType].image = entry.toLocalURL();
                _vue.isEnable = _vue.images.front.image && _vue.images.back.image;
            });
        },
        'loadPageData': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'IDCardState',
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.reason = typeof result.Data.Reason === 'undefined' ? '' : result.Data.Reason;
                    _vue.uploadState = result.Data.IDCardUploaded;
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