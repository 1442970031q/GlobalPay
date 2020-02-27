var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'request': {
            'newId': APP.GLOBAL.queryString('oId'),
            'itemId': APP.GLOBAL.queryString('itemId')
        },
        'lastQueryTime': new Date(),
        'lastHandler': null,
        'pageModel': {
            'IsUploaded': false,
            'ImageAddress': '',
            'OrderStatus': 4,
            'Sec': 0
        },
		'isJust':false,
		'rootCategoryId':1,
        'statusbarHeight': 20
    },
    methods: {
        'loopQuery': function () {
            this.lastQueryTime = new Date();
            clearTimeout(this.lastHandler);

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'MyNewOrder',
                data: { 'oid': this.request.newId },
                success: function (result) {
                    if (!result.Error) {
                        _vue.pageModel = Object.assign({}, _vue.pageModel, result.Data);
						_vue.isJust = result.Data.IsJust;
						_vue.rootCategoryId = result.Data.RootCategoryId;
                        return;
                    }

                    var ts = new Date().getTime() - _vue.lastQueryTime.getTime();
                    var timeout = 1 * 1500 - ts;

                    _vue.lastHandler = setTimeout(_vue.loopQuery, timeout);
                }
            });
        },
        'goPay': function () {
            this.$dialog.alert({
                'title': '付款码',
                'message': '二维码将会自动保存至您的手机相册并启动云闪付/微信/支付宝，打开云闪付/微信/支付宝后进入“扫一扫”界面点击“打开相册”即可。'
            }).then(function () {
                _vue.launchAPP();
            });
        },
		'launchAlipay':function(){
			APP.GLOBAL.toastLoading({
				'message': '正在操作'
			});
			
			var index = this.pageModel.ImageAddress.lastIndexOf('.');
			var ext = this.pageModel.ImageAddress.substring(index);
			var fileName = '_downloads/qr_' + this.request.oid + ext;
			var downloader = plus.downloader.createDownload(this.pageModel.ImageAddress, {
				filename: fileName
			}, function(download, status) {
				if (status === 200) { 
					plus.gallery.save(download.filename, function() {
						APP.GLOBAL.closeToastLoading();
						if (APP.CONFIG.SYSTEM_NAME === 'ios') {
							plus.runtime.launchApplication({
								'action': 'alipayqr://platformapi/startapp?saId=10000007'
							}, _vue.launchError);
						} else {
							plus.runtime.openURL("alipayqr://platformapi/startapp?saId=10000007",_vue.launchError);
						}
					});
				} else {
					APP.GLOBAL.closeToastLoading();
				}
			});
			downloader.addEventListener("statechanged", this.onStateChanged);
			downloader.start();
			
		},
		'launchWechat':function(){
			APP.GLOBAL.toastLoading({
				'message': '正在操作'
			});
			
			var index = this.pageModel.ImageAddress.lastIndexOf('.');
			var ext = this.pageModel.ImageAddress.substring(index);
			var fileName = '_downloads/qr_' + this.request.oid + ext;
			
			var downloader = plus.downloader.createDownload(this.pageModel.ImageAddress, {
				filename: fileName
			}, function(download, status) {
				if (status === 200) {
					plus.gallery.save(download.filename, function() {
						APP.GLOBAL.closeToastLoading();
						if (APP.CONFIG.SYSTEM_NAME === 'ios') {
							plus.runtime.launchApplication({
								'action': 'weixin://'
							}, _vue.launchError);
						} else {
							
							var Intent = plus.android.importClass("android.content.Intent");
							var intent = new Intent(Intent.ACTION_MAIN);  
							intent.addCategory(Intent.CATEGORY_LAUNCHER);  
							var ComponentName = plus.android.importClass("android.content.ComponentName");  
							var comp = new ComponentName("com.tencent.mm","com.tencent.mm.ui.LauncherUI");  
							intent.setComponent(comp);  
							//只想唤起微信就不要下面这句传参代码  com.tencent.mm.ui.contact.SelectLabelContactUI
							intent.putExtra("LauncherUI.From.Scaner.Shortcut", true);  
							intent.setAction("android.intent.action.VIEW");
							var main = plus.android.runtimeMainActivity();  
							main.startActivity(intent);  
						}
					});
				} else {
					APP.GLOBAL.closeToastLoading();
				}
			});
			downloader.addEventListener("statechanged", this.onStateChanged);
			downloader.start();
		},
        'launchAPP': function () {
			
			if(this.rootCategoryId === 3){
				this.launchWechat();
			}else if(this.rootCategoryId === 4){
				
				this.launchAlipay();
			}else{
				APP.GLOBAL.toastLoading({ 'message': '正在操作' });
				
				var index = this.pageModel.ImageAddress.lastIndexOf('.');
				var ext = this.pageModel.ImageAddress.substring(index);
				var fileName = '_downloads/qr_' + this.request.newId + ext;
				var downloader = plus.downloader.createDownload(this.pageModel.ImageAddress, {
				    filename: fileName
				}, function (download, status) {
				    if (status === 200) {
				        plus.gallery.save(download.filename, function () {
				            APP.GLOBAL.closeToastLoading();
				
				            document.addEventListener("resume", _vue.confirmPay);
				
				            if (APP.CONFIG.SYSTEM_NAME === 'ios') {
				                plus.runtime.launchApplication({
				                    'action': 'upwallet://'
				                }, _vue.launchError);
				            } else {
				                plus.runtime.launchApplication({
				                    'pname': 'com.unionpay',
				                    'action': 'com.unionpay'
				                }, _vue.launchError);
				            }
				        });
				    } else {
				        APP.GLOBAL.closeToastLoading();
				    }
				}); 
				downloader.addEventListener("statechanged", this.onStateChanged);
				downloader.start();
			}
            
        },
		'onStateChanged': function (download, status) {
		    if (download.state === 2 && status === 404) {
		        download.abort();
				APP.GLOBAL.closeToastLoading();
		        plus.nativeUI.alert('没有找到图片资源，请联系客服重新发码', null, '下载失败');
		    }
		},
        'launchError': function (err) {
            APP.GLOBAL.toastMsg('启动失败');
            APP.GLOBAL.closeToastLoading();
        },
        'confirmPay': function () {
            document.removeEventListener("resume", this.confirmPay);
            plus.webview.getWebviewById('orders.htmlPage').evalJS('_vue.flushOrder()');

            APP.GLOBAL.confirmMsg({
                'title': '订单详情',
                'message': '是否前往订单详情页面？',
                'confirmCallback': function () {
                    APP.GLOBAL.gotoNewWindow('order.detailPage', 'center/subPages/order.detail', {
                        'param': 'oId=' + _vue.request.newId,
                        'openCallback': function () {
                            APP.GLOBAL.closeWindow('none');
                        }
                    });
                },
                'cancelCallback': function () {
                    APP.GLOBAL.closeWindow();
                }
            });
        }
    },
    created: function () {
        if (APP.CONFIG.IS_RUNTIME) {
            this.statusbarHeight = plus.navigator.getStatusbarHeight();
        }
    },
    mounted: function () {
        this.loopQuery();
    }
});