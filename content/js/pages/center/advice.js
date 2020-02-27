var _vue = new Vue({
	el: '#app',
	data: {
		'currentUser': APP.GLOBAL.getUserModel(),
		'statusbarHeight': 20,
		'form': {
			'text': '',
			'typeText': '请选择',
			'type': 0
		},
		'show': false,
		'type': ['界面布局', '功能优化', '错误报告', '其他']
	},
	created: function() {
		if(APP.CONFIG.IS_RUNTIME) {
			this.statusbarHeight = plus.navigator.getStatusbarHeight();
		}
	},
	methods: {
		'checkData': function() {
			if(!this.form.text) {
				APP.GLOBAL.toastMsg("提交的意见不能为空");
			} else if(this.form.type === 0) {
				APP.GLOBAL.toastMsg("请选择提交意见类型");
			} else {
				this.submitAjax();
			}
		},
		'submitAjax': function() {
            APP.GLOBAL.toastLoading({ 'message': '正在提交' });

			APP.GLOBAL.ajax({
				url: APP.CONFIG.BASE_URL + 'SubmitCommits',
				data: this.form,
				success: function(result) {
                    if (result.Error) {
                        APP.GLOBAL.closeToastLoading();
						APP.GLOBAL.toastMsg(result.Msg);
						return;
					}

					APP.GLOBAL.gotoNewWindow('advice.successPage', 'advice.success', {
						'openCallback': function() {
							if(APP.CONFIG.IS_RUNTIME) {
                                APP.GLOBAL.closeWindow('none');
							}
						}
					});
				}
			});
		},
		'onConfirm': function(value, index) {
			this.form.typeText = value;
			this.form.type = index + 1;
			this.show = false;
		}
	}
});