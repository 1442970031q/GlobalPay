var _vue = new Vue({
	el: '#app',
	data: {
		'currentUser': APP.GLOBAL.getUserModel(),
		'statusbarHeight': 20,
		'isLoading': true,
		'adviceList': new Array(),
		'form': {
			'p': 1,
			'pageSize': 5
		},
		'isLoadMore': false,
		'isLoadComplete': false

	},
	created: function() {
		if(APP.CONFIG.IS_RUNTIME) {
			this.statusbarHeight = plus.navigator.getStatusbarHeight();
		}
	},
	methods: {
		'gotoDetail': function(id) {
			APP.GLOBAL.gotoNewWindow('advice.detailPage', 'advice.detail', {
				'param': 'id=' + id
			})
		},
		'loadData': function() {
			APP.GLOBAL.ajax({
				url: APP.CONFIG.BASE_URL + 'CommitsList',
				data: this.form,
				success: function(result) {

					if(result.Error) {
						APP.GLOBAL.toastMsg(result.Msg);
						return;
					};

					_vue.adviceList = result.Data;
					_vue.isLoading = false;
					_vue.form.p++;
					_vue.isLoading = false;
				}
			});
		},
		'loadMoreAjax': function() {
			APP.GLOBAL.ajax({
				url: APP.CONFIG.BASE_URL + 'CommitsList',
				data: this.form,
				success: function(result) {
					if(result.Error) {
						APP.GLOBAL.toastMsg(result.Msg);
						return;
					}
					_vue.adviceList = _vue.adviceList.concat(result.Data);
					_vue.form.p++;
					_vue.isLoadMore = false;

					if(result.Data.length < _vue.form.pageSize) {
						_vue.isLoadComplete = true;
					}
				}
			});
		},
		'scrollBottom': function() {
			if(!this.isLoadMore && !this.isLoadComplete) {
				this.isLoadMore = true;
				this.loadMoreAjax();
			}
		}
	},
	mounted: function() {
		this.loadData();
		window.scrollBottom = this.scrollBottom;
	}
});