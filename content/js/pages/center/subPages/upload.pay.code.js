var _vue = new Vue({
	el: '#app',
	data: {
		'currentUser': APP.GLOBAL.getUserModel(),
		'statusbarHeight': 20,
		'width': document.body.clientWidth - 30,
		'show': true,
		'form': {
			'oId': APP.GLOBAL.queryString('oid'),
			'base64': ''
		},
	},
	methods: {
		'isLoading': function(file) {
            if (file.file.name.substr(file.file.name.length - 4, 4) !== '.jpg' &&
                file.file.name.substr(file.file.name.length - 4, 4) !== '.png') {
				APP.GLOBAL.toastMsg('不是jpg、png格式');
				return;
            }

			if (file.file.size > 5242880) {
				APP.GLOBAL.toastMsg('照片大小不能大于5M');
				return;
            }

			this.form.base64 = encodeURIComponent(file.content.split(',')[1]);
			this.show = false;
		},
		'uploadingPDF': function() {
			APP.GLOBAL.toastLoading({
				'message': '正在上传'
			});
			APP.GLOBAL.ajax({
				url: APP.CONFIG.BASE_URL + 'UploadingTheSweepYard',
				data: this.form,
				success: function(result) {
					APP.GLOBAL.closeToastLoading();
					if (result.Error) {
						APP.GLOBAL.toastMsg(result.Msg);
						return;
					}

                    APP.GLOBAL.gotoNewWindow('upload.code.successPage', 'upload.code.success', {
                        'openCallback': function () {
                            APP.GLOBAL.closeWindow('none');
                        }
                    });
				}
			});
		}
	},
	created: function() {
		if (APP.CONFIG.IS_RUNTIME) {
			this.statusbarHeight = plus.navigator.getStatusbarHeight();
		}
	}
});
