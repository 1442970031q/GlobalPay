var _vue = new Vue({
	el: '#app',
	data: {
		'currentUser': APP.GLOBAL.getUserModel(),
		'statusbarHeight': 20,
		'request': {
			'amount': APP.GLOBAL.queryString('amount')
		}
    },
    methods: {
        'onPageClosing': function () {
            var detailPage = plus.webview.getWebviewById('orders.htmlPage');
            if (detailPage !== null) {
                detailPage.evalJS('_vue.loadPageData()');
            }

            var mainPage = plus.webview.getWebviewById('mainPage');
            if (mainPage !== null) {
                mainPage.evalJS('_vue.switchPageByIndex(2)');
            }
        }
    },
	created: function() {
		if (APP.CONFIG.IS_RUNTIME) {
			this.statusbarHeight = plus.navigator.getStatusbarHeight();
        }

        window.onPageClose = this.onPageClosing;
	}
});
