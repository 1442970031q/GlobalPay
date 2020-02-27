var _vue = new Vue({
	el: '#app',
	data: {
		'currentUser': APP.GLOBAL.getUserModel(),
		'statusbarHeight': 20,
		'isLoading': true,
		'adviceList': new Array(),
		'adviceId': APP.GLOBAL.queryString("id")
	},
	created: function() {
		if(APP.CONFIG.IS_RUNTIME) {
			this.statusbarHeight = plus.navigator.getStatusbarHeight();
		}
		this.loadData();
	},
	methods: {
		'loadData': function() {
			APP.GLOBAL.ajax({
				url: APP.CONFIG.BASE_URL + 'CommitsDetails',
				data: {
					'id': this.adviceId,
					'key': this.currentUser.Key
				},
				success: function(result) {

					if(result.Error) {
						APP.GLOBAL.toastMsg(result.Msg);
						return;
					};

					_vue.adviceList = result.Data;
					_vue.isLoading = false;
				}
			});
		}
	}
});