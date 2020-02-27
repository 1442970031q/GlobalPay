var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'statusbarHeight': 20,
        'isAutoUpgrade': true,
        'isNewMember': true,
        'isNewBonus': true,
        'isCGFirst': true,
        'fileTotalSize': 0,
        'versons': '1.0'
    },
    methods: {
        'checkUpgrade': function () {
            APP.GLOBAL.toastLoading({ 'message': '正在检查' });

            var wb = plus.webview.getWebviewById('mainPage');
            wb.evalJS('_vue.checkUpgrade(true)');
        },
        'autoUpgradeChange': function () {
            APP.GLOBAL.setItem(APP.CONFIG.SYSTEM_KEYS.AUTO_UPGRADE_KEY, this.isAutoUpgrade.toString());
        },
        'newMemberChange': function () {
            APP.GLOBAL.setItem(APP.CONFIG.SYSTEM_KEYS.NEW_MEMBER_KEY, this.isNewMember.toString());
        },
        'newBonusChange': function () {
            APP.GLOBAL.setItem(APP.CONFIG.SYSTEM_KEYS.NEW_BONUS_KEY, this.isNewBonus.toString());
        },
        'CGFirstUpgradeChange': function () {
            APP.GLOBAL.setItem(APP.CONFIG.SYSTEM_KEYS.CG_FIRST_KEY, this.isCGFirst.toString());
        },
        'checkCallback': function (isUpgrade, baseUrl, ver) {
            APP.GLOBAL.closeToastLoading();

            if (!isUpgrade) {
                this.$toast.success({
                    'message': '已是最新版本',
                    'duration': 800
                });
            } else {
                this.$dialog.confirm({
                    'title': '有更新',
                    'message': '发现了新版本，是否要现在升级？'
                }).then(function () {
                    var wb = plus.webview.getWebviewById('mainPage');
                    wb.evalJS('_vue.downloadWGT("' + baseUrl + '", "' + ver + '")');
                });
            }
        },
        'cofirmClear': function () {
            APP.GLOBAL.confirmMsg({
                'title': '清理缓存',
                'message': '确定要清理手机缓存吗？',
                'confirmCallback': this.clearCache
            });
        },
        'clearCache': function () {
            APP.GLOBAL.toastLoading({ 'message': '正在清理' });
            this.loadLocalFiles(true);
        },
        'loadLocalFiles': function (isRemove) {
            var pathList = ['_downloads/', '_doc/update/'];
            for (var i = 0; i < pathList.length; i++) {
                plus.io.resolveLocalFileSystemURL(pathList[i], function (entry) {
                    var reader = entry.createReader();
                    reader.readEntries(function (entrys) {
                        _vue.entrysList(entrys, isRemove);
                    });
                });
            }
        },
        'entrysList': function (entrys, isRemove) {
            for (var i = 0; i < entrys.length; i++) {
                if (entrys[i].isFile) {
                    if (isRemove) {
                        entrys[i].remove();
                    } else {
                        entrys[i].getMetadata(function (meta) {
                            _vue.fileTotalSize += meta.size;
                        });
                    }
                }
            }

            if (isRemove) {
                this.fileTotalSize = 0;
                APP.GLOBAL.closeToastLoading();
            }
        }
    },
    computed: {
        'version': function () {
            return 'v' + numberFormat(APP.CONFIG.VERSION / 10, 1);
        },
        'fileSize': function () {
            if (this.fileTotalSize === 0) {
                return '';
            } else if (this.fileTotalSize < 1024) {
                return numberFormat(this.fileTotalSize, 2) + 'B';
            } else if (this.fileTotalSize > 1024 && this.fileTotalSize < Math.pow(1024, 2)) {
                return numberFormat(this.fileTotalSize / 1024, 2) + 'KB';
            } else if (this.fileTotalSize > Math.pow(1024, 2)) {
                return numberFormat(this.fileTotalSize / Math.pow(1024, 2), 2) + 'MB';
            }
        }
    },
    created: function () {
        if (APP.CONFIG.IS_RUNTIME) {
            this.statusbarHeight = plus.navigator.getStatusbarHeight();
            this.loadLocalFiles(false);
        }
    },
    mounted: function () {
        var value = APP.GLOBAL.getItem(APP.CONFIG.SYSTEM_KEYS.NEW_MEMBER_KEY);
        this.isNewMember = value === 'true';

        value = APP.GLOBAL.getItem(APP.CONFIG.SYSTEM_KEYS.AUTO_UPGRADE_KEY);
        this.isAutoUpgrade = value === 'true';

        value = APP.GLOBAL.getItem(APP.CONFIG.SYSTEM_KEYS.NEW_BONUS_KEY);
        this.isNewBonus = value === 'true';

        value = APP.GLOBAL.getItem(APP.CONFIG.SYSTEM_KEYS.CG_FIRST_KEY);
        this.isCGFirst = value === 'true';
    }
});