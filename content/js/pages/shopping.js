Vue.use(vant.Lazyload, {
    'loading': '../content/img/flag/default_flag.jpg?v=2',
    'error': '../content/img/flag/default_flag.jpg?v=2',
    'attempt': 1
});

var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'isTabLoading': true,
        'isLeftLoading': true,
        'isRightLoading': true,
        'pageError': {
            'isError': false,
            'msg': ''
        },
        'isError': false,
        'statusbarHeight': 20,
        'tabIndex': 0,
        'pageData': {
            'tabs': [],
            'Products': {
                'pageIndex': 1,
                'pageSize': 10,
                'list': []
            }
        },
        'countryId': 0,
        'currentCountry': null,
		'isLoadMore':false,
		'isLoadComplete':false
    },
    methods: {
        'flushOrder': function () {
            this.countryId = 0;
			this.tabIndex=0;
            this.isTabLoading = true;
            this.isLeftLoading = true;
            this.isRightLoading = true;

            this.loadPageData();
        },
        'gotoDetail': function (item) {
            APP.GLOBAL.gotoNewWindow('detailPage', 'detail', {
                'param': 'pId=' + item.Id + '&product=' + item.IsEntity
            });
        },
        'tabChange': function (index) {
            this.pageData.Products.pageIndex = 1;

            var tab = this.pageData.tabs[index];
            if (!tab.IsCountryLoaded) {
                this.loadCategoriesAjax(tab);
            } else {
                if (tab.Countrys.length > 0) {
                    this.selectedCountry(tab.Countrys[0]);
                }
            }
        },
        'loadPageData': function () {
            this.pageError.isError = false;

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'Items',
                success: function (result) {
                    if (result.Error) {
                        _vue.pageError.isError = true;
                        _vue.pageError.msg = result.Msg;
                        _vue.isTabLoading = false;
                        return;
                    }

                    var tabData = [];
                    for (var i = 0; i < result.Data.length; i++) {
                        tabData.push({
                            'Id': result.Data[i].Id,
                            'Name': result.Data[i].Title,
                            'IsCountryLoaded': false,
                            'Countrys': []
                        });
                    }
                    _vue.pageData.tabs = tabData;
                    _vue.isTabLoading = false;

                    if (tabData.length > 0) {
                        _vue.loadCategoriesAjax(tabData[0]);
                    }
                }
            });
        },
        'loadCategoriesAjax': function (tab) {
            this.pageData.Products.pageIndex = 1;
            this.isLeftLoading = true;
            this.pageError.isError = false;

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'Categories',
                data: { 'item': tab.Id },
                success: function (result) {
                    if (result.Error) {
                        _vue.pageError.isError = true;
                        _vue.pageError.msg = result.Msg;
                        return;
                    }

                    for (var i = 0; i < result.Data.length; i++) {
                        tab.Countrys.push({
                            'Id': result.Data[i].Id,
                            'Name': result.Data[i].Title,
                            'Image': result.Data[i].Flag,
                            'TopImage': result.Data[i].TopImage,
                            'BackgroundColor': result.Data[i].BackgroundColor
                        });
                    }
                    tab.IsCountryLoaded = true;
                    _vue.isLeftLoading = false;

                    if (tab.Countrys.length > 0) {
                        _vue.selectedCountry(tab.Countrys[0]);
                    }
                }
            });
        },
        'loadProductAjax': function (country) {
            this.pageData.Products.pageIndex = 1;
            this.isRightLoading = true;
            this.pageError.isError = false;

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'CreditCardPros',
                data: {
                    'isEntity': this.tabIndex,
                    'categoryId': country.Id,
                    'p': this.pageData.Products.pageIndex,
                    'pageSize': this.pageData.Products.pageSize
                },
                success: function (result) {
                    if (result.Error) {
                        _vue.pageError.isError = true;
                        _vue.pageError.msg = result.Msg;
                        return;
                    }

                    for (var i = 0; i < result.Data.length; i++) {
                        result.Data[i]['ImageAddress'] = {
                            'src': result.Data[i]['ImageAddress'],
                            'loading': '../content/img/default_product.jpg',
                            'error': '../content/img/default_product.jpg'
                        };
                    }

                    _vue.pageData.Products.pageIndex++;
                    _vue.pageData.Products.list = result.Data;
                    _vue.isRightLoading = false;
                    _vue.isFlush = false;
                }
            });
        },
        'selectedCountry': function (country) {
            this.countryId = country.Id;
            this.currentCountry = country;

            this.loadProductAjax(country);
        },
        'updatePage': function () {
            this.currentUser = Object.assign({}, this.currentUser, APP.GLOBAL.getUserModel());
        },
        'stop': function (event) {
            event.stopPropagation();
        },
		'loadMore': function () {
			APP.GLOBAL.ajax({
				url: APP.CONFIG.BASE_URL + 'CreditCardPros',
				data:  {
                    'isEntity': this.tabIndex,
                    'categoryId': this.countryId,
                    'p': this.pageData.Products.pageIndex,
                    'pageSize': this.pageData.Products.pageSize
                } ,
				success: function (result) {
					if (result.Error) {
						APP.GLOBAL.toastMsg(result.Msg);
						return;
					}
		
					_vue.pageData.Products.list = _vue.pageData.Products.list.concat(result.Data);
					_vue.isLoadMore = false;
					_vue.pageData.Products.pageIndex++;
					if (result.Data.length < _vue.pageData.Products.pageSize) {
						_vue.isLoadComplete = true;
					}
				}
			});
		},
		'scrollBottom': function () {
			if (!this.isLoadMore && !this.isLoadComplete) {
				this.isLoadMore = true;
				this.loadMore();
			}
		}
    },
    computed: {
        'screenHeight': function () {
            if (APP.CONFIG.IS_RUNTIME && APP.CONFIG.SYSTEM_NAME !== 'ios') {
                return plus.display.resolutionHeight;
            } else {
                return document.body.clientHeight;
            }
        }
    },
    created: function () {
        if (APP.CONFIG.IS_RUNTIME) {
            this.statusbarHeight = plus.navigator.getStatusbarHeight();
        }
		window.scrollBottom = this.scrollBottom;
    },
    mounted: function () {
        if (!APP.CONFIG.IS_RUNTIME) {
            this.loadPageData();
        }
    }
});