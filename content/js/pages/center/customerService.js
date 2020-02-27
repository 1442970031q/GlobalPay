Vue.use(vant.Lazyload, {
    'loading': '../../content/img/default_avatar.jpg',
    'error': '../../content/img/default_avatar.jpg'
});

var _vue = new Vue({
    el: '#app',
    data() {
        return {
            'currentUser': APP.GLOBAL.getUserModel(),
            'isLoading': true,
            'isActionsheet': false,
            'statusbarHeight': 20,
            'isSafeArea': true,
            'isSend': false,
            'isSocketError': true,
            'chats': [],
            'ServiceNotice': '',
            'form': {
                'message': ''
            },
            'socketState': {
                'State': 0,
                'Text': '正在连接客服系统...'
            },
            'actions': [{
                'name': '拍照选取',
                'callback': this.openCamera
            }, {
                'name': '从相册选取',
                'callback': this.openGallery
            }],
            'socket': null
        };
    },
    methods: {
        'actionSheet': function () {
            if (this.isSend) return;

            this.isActionsheet = true;
        },
        'checkSend': function () {
            if (!this.form.message) return;

            this.chats.push({
                'From': 1,
                'Text': this.form.message,
                'MsgType': 1
            });

            var msg = {
                'Cmd': 2,
                'Data': this.form.message,
                'MsgType': 1
            };

            this.socket.send(JSON.stringify(msg));

            _vue.$nextTick(function () {
                window.scrollTo(0, document.body.scrollHeight);
            });

            this.form.message = '';
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
                _vue.doSubmitImageMsg(base64);

                _vue.chats.push({
                    'From': 1,
                    'Image': 'data:image/jpeg;base64,' + base64,
                    'MsgType': 2
                });

                setTimeout(function () {
                    _vue.$nextTick(function () {
                        window.scrollTo(0, document.body.scrollHeight);
                    });
                }, 200);
            };
            reader.onerror = function (fe) {
                _vue.isSend = false;
                APP.GLOBAL.toastMsg('读取错误：' + fe.error);
            };
            reader.readAsDataURL(event.target.replace('file://', ''));
        },
        'doSubmitImageMsg': function (base64) {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'UploadChat',
                data: {
                    'base64': encodeURIComponent(base64)
                },
                success: function (result) {
                    _vue.isSend = false;

                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    var msg = {
                        'Cmd': 2,
                        'Data': result.Data,
                        'MsgType': 2
                    };

                    _vue.socket.send(JSON.stringify(msg));
                }
            });
        },
        'connect': function () {
            var msg = { 'Cmd': 1 };
            this.socket.send(JSON.stringify(msg));
            this.isSocketError = false;
        },
        'connectClose': function (error) {
            this.socketState = Object.assign({}, this.socketState, {
                'State': 2,
                'Text': '连接关闭，' + JSON.stringify(error)
            });
        },
        'receiveMessage': function (evt) {
            try {
                var jsonObj = JSON.parse(evt.data);
                if (jsonObj.Cmd === 1) {
                    if (jsonObj.Count > 0) {
                        this.socket.send(JSON.stringify({ 'Cmd': 3 }));
                    } else {
                        this.socketState = Object.assign({}, this.socketState, {
                            'State': 3,
                            'Text': '暂无在线客服，请稍后再试'
                        });
                    }
                } else if (jsonObj.Cmd === 2) {
                    if (jsonObj.Error) {
                        APP.GLOBAL.toastMsg(jsonObj.Msg);
                    }
                } else if (jsonObj.Cmd === 3) {
                    if (!jsonObj.Has) {
                        this.socketState = Object.assign({}, this.socketState, {
                            'State': 3,
                            'Text': '抱歉，客服繁忙中，请您耐心等待'
                        });
                    } else {
                        this.socketState = Object.assign({}, this.socketState, {
                            'State': 1,
                            'Text': '<i class="iconfont icon-kefu"></i>您好，我是 ' + jsonObj.DisplayName + '，有什么问题请问我吧！'
                        });
                    }
                } else if (jsonObj.Cmd === 4) {
                    this.chats.push({
                        'From': 2,
                        'Text': jsonObj.Data,
                        'MsgType': jsonObj.MsgType
                    });

                    this.$nextTick(function () {
                        window.scrollTo(0, document.body.scrollHeight);
                    });

                    document.getElementById('audioPlayer').play();
                } else if (jsonObj.Cmd === 6 || jsonObj.Cmd === 7) {
                    this.socketState = Object.assign({}, this.socketState, {
                        'State': 3,
                        'Text': '客服已离线，请稍后咨询'
                    });
                }
            } catch (e) {
                console.log(e.message);
            }
        },
        'connectError': function () {
            this.socketState = Object.assign({}, this.socketState, {
                'State': 2,
                'Text': '<i class="iconfont icon-cuowu"></i>连接客服系统失败'
            });
        }
    },
    created: function () {
        if (APP.CONFIG.IS_RUNTIME) {
            this.statusbarHeight = plus.navigator.getStatusbarHeight();
        }
    },
    mounted: function () {
        this.socket = new WebSocket('ws://chat.huimingroup.com/serviceCenter.ashx?identType=CLIENT&appName=GlobalBuy&key=' + this.currentUser.Key);
        this.socket.onopen = this.connect;
        this.socket.onmessage = this.receiveMessage;
        this.socket.onclose = this.connectError;
    }
});