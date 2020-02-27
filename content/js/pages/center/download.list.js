var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'statusbarHeight': 20,
        'fileList': [],
        'isLoading': false
    },
    methods: {
        'openFile': function (item) {
            var fn = '_downloads/' + item.name;
            plus.runtime.openFile(fn, {}, function (err) {
                APP.GLOBAL.toastMsg(err.message);
            });
        },
        'loadFiles': function () {
            plus.io.resolveLocalFileSystemURL('_downloads/', function (entry) {
                var reader = entry.createReader();
                reader.readEntries(function (entrys) {
                    _vue.entrysList(entrys);
                });
            }, function (err) {
                APP.GLOBAL.toastMsg(err.message);
            });
        },
        'entrysList': function (entrys) {
            for (var i = 0; i < entrys.length; i++) {
                if (entrys[i].isFile && entrys[i].name.indexOf('file_') !== -1) {
                    entrys[i].file(function (f) {
                        var d = new Date(f.lastModifiedDate);
                        var size = 0;
                        if (f.size < 1024) {
                            size = numberFormat(f.size, 2) + 'B';
                        } else if (f.size > 1024 && f.size < Math.pow(1024, 2)) {
                            size = numberFormat(f.size / 1024, 2) + 'KB';
                        } else {
                            size = numberFormat(f.size / Math.pow(1024, 2), 2) + 'MB';
                        }

                        _vue.fileList.push({
                            'name': f.name,
                            'size': size,
                            'datetime': d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes()
                        });

                        f.close();
                    });
                }
            }
        }
    },
    created: function () {
        if (APP.CONFIG.IS_RUNTIME) {
            this.statusbarHeight = plus.navigator.getStatusbarHeight();
        }
    },
    mounted: function () {
        if (APP.CONFIG.IS_RUNTIME) {
            this.loadFiles();
        }
    }
});