var _vue = new Vue({
				el: '#app',
				data: {
					'currentUser': APP.GLOBAL.getUserModel(),
					'value': '',
					'statusbarHeight': 20,
					'form': {
						'pass': '',
						'code': ''
					},
					'phone': ''
				},
				created: function() {
					if(APP.CONFIG.IS_RUNTIME) {
						this.statusbarHeight = plus.navigator.getStatusbarHeight();
					}
				},
				methods: {
					'getCode': function() {
						APP.GLOBAL.toastLoading({
							'message': '正在发送'
						})
						APP.GLOBAL.ajax({
							url: APP.CONFIG.BASE_URL + 'SendChangePasswordPhoneCode',
							success: function(result) {
								APP.GLOBAL.closeToastLoading();
								_vue.form.code = result.Data;
							}
						})
					},
					'doSubmitAjax': function() {
						if(this.form.pass == '' || this.form.pass.length < 6) {
							APP.GLOBAL.toastMsg('请输入正确密码');
							return;
						} else if(this.value != this.form.pass) {
							APP.GLOBAL.toastMsg('密码不一致');
							return;
						}else if(this.form.code==''||this.form.code.length<6){
							APP.GLOBAL.toastMsg('请输入正确验证码');
							return;
						}
						APP.GLOBAL.toastLoading({'message':'正在保存'});
						APP.GLOBAL.ajax({
							url:APP.CONFIG.BASE_URL+'ChangePassword',
							data:{
								'phoneCode':this.form.code,
								'pwd':this.form.pass
							},
							success:function(result){
								APP.GLOBAL.closeToastLoading();
								
								if(result.Error){
									APP.GLOBAL.toastMsg(result.Msg);
									return;
								}
								
								APP.GLOBAL.toastMsg('修改成功');
								APP.GLOBAL.closeWindow();
							}
						})
					}
				}
			})