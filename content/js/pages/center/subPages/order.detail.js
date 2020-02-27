Vue.use(vant.Lazyload);

var _vue = new Vue({
	el: '#app',
	data: {
		'currentUser': APP.GLOBAL.getUserModel(),
		'isLoading': true,
		'isTipShow': false,
		'appType':1,
		'isTipAgain': false,
		'isExists': false,
		'isDownloadDialogShow': false,
		'statusbarHeight': 20,
		'downloadProgress': 0,
		'downloader': null,
		'request': {
			'oid': APP.GLOBAL.queryString('oId')
		},
		'pageModel': {}
	},
	methods: {
		'confirmReceive': function() {
			APP.GLOBAL.confirmMsg({
				'title': '确认收货',
				'message': '您确认已收到商品了吗？</br>点击“确认”后该订单将完成！',
				'confirmCallback': this.doReceiveAjax
			});
		},
		'doReceiveAjax': function() {
			APP.GLOBAL.toastLoading('正在操作');
			APP.GLOBAL.ajax({
				url: APP.CONFIG.BASE_URL + 'SureReceive',
				data: this.request,
				success: function(result) {
					APP.GLOBAL.closeToastLoading();
					if (result.Error) {
						APP.GLOBAL.toastMsg(result.Msg);
						return;
					}

					_vue.pageModel.Extend.Status = 32;
					_vue.pageModel.Extend.StatusName = '已收货';
					_vue.$toast.success('已确认收货');
				}
			});
		},
		'copyLogisticsNumber': function() {
			var wb = plus.webview.getWebviewById('mainPage');
			if (wb !== null) {
				wb.evalJS('_vue.setClipBoard("' + this.pageModel.Extend.LogisticsNo + '")');
				APP.GLOBAL.toastMsg('已复制');
			}
		},
		'getAddressName': function() {
			var arr = this.pageModel.Extend.ShippingAddress.split('|');
			return arr[0];
		},
		'getAddressPhone': function() {
			var arr = this.pageModel.Extend.ShippingAddress.split('|');
			return arr[1];
		},
		'getAddress': function() {
			var arr = this.pageModel.Extend.ShippingAddress.split('|');
			return arr[2] + ' / ' + arr[3] + ' / ' + arr[4] + ' ' + arr[5];
		},
		'openFile': function() {
			var index = this.pageModel.DataUrl.lastIndexOf('.');
			var ext = this.pageModel.DataUrl.substring(index);
			var fileName = '_downloads/file_' + this.pageModel.Title + ext;

			plus.runtime.openFile(fileName);
		},
		'cancelOrder': function() {
			APP.GLOBAL.confirmMsg({
				'title': '取消确认',
				'message': '<p>确定要取消这个订单吗？</p><p><b>注：如果您已支付，不要取消该订单！</b></p>',
				'confirmCallback': this.doCancelAjax
			});
		},
		'doCancelAjax': function() {
			APP.GLOBAL.toastLoading({
				'message': '正在取消'
			});

			APP.GLOBAL.ajax({
				url: APP.CONFIG.BASE_URL + 'CancelOrder',
				data: this.request,
				success: function(result) {
					APP.GLOBAL.closeToastLoading();

					if (result.Error) {
						APP.GLOBAL.toastMsg(result.Msg);
						return;
					}

					plus.webview.getWebviewById('orders.htmlPage').evalJS('_vue.reloadList()');
					_vue.isLoading = true;
					_vue.loadPageData();
				}
			});
		},
		'downloadFile': function() {
			this.isDownloadDialogShow = true;

			var index = this.pageModel.DataUrl.lastIndexOf('.');
			var ext = this.pageModel.DataUrl.substring(index);
			var fileName = '_downloads/file_' + this.pageModel.Title + ext;
			this.downloader = plus.downloader.createDownload(this.pageModel.DataUrl, {
				filename: fileName
			}, this.downloadComplete);

			this.downloader.addEventListener("statechanged", this.onStateChanged);
			this.downloader.start();
		},
		'downloadComplete': function(download, status) {
			if (status === 200) {
				this.downloadProgress = 0;
				this.isDownloadDialogShow = false;
				this.isExists = true;

				if (this.downloader !== null) {
					this.downloader.abort();
					this.downloader = null;
				}

				APP.GLOBAL.confirmMsg({
					'title': '打开攻略',
					'message': '文件已下载完毕，现在是否打开这个？',
					'confirmCallback': _vue.openFile
				});
			}
		},
		'onStateChanged': function(download, status) {
			if (download.state === 2 && status === 404) {
				download.abort();
				APP.GLOBAL.toastMsg('攻略文件不存在，请联系客服');
			} else {
				var p = download.downloadedSize / download.totalSize * 100;
				this.downloadProgress = numberFormat(p, 1);
			}
		},
		'gotoChat': function() {
			APP.GLOBAL.gotoNewWindow('chatPage', 'chat', {
				'param': 'oId=' + this.request.oid
			});
		},
		'openAPP': function() {
			if (!this.isTipAgain) {
				this.isTipShow = true;
			} else {
				this.launchAPP();
			}
		},
		'openQR': function() {
			vant.ImagePreview({
				images: [this.pageModel.QRCodeAddress.src],
				showIndex: false
			});
		},
		'launchAlipay':function(){
			APP.GLOBAL.toastLoading({
				'message': '正在操作'
			});
			 
			var index = this.pageModel.QRCodeAddress.src.lastIndexOf('.');
			var ext = this.pageModel.QRCodeAddress.src.substring(index);
			var fileName = '_downloads/qr_' + this.request.oid + ext;
			var downloader = plus.downloader.createDownload(this.pageModel.QRCodeAddress.src, {
				filename: fileName
			}, function(download, status) {
				if (status === 200) {
					plus.gallery.save(download.filename, function() {
						APP.GLOBAL.closeToastLoading();
						//
						if (APP.CONFIG.SYSTEM_NAME === 'ios') {
							plus.runtime.launchApplication({
								'action': 'alipayqr://platformapi/startapp?saId=10000007'
							}, _vue.launchError);
						} else {
							plus.runtime.openURL("alipayqr://platformapi/startapp?saId=10000007",_vue.launchError);
						}
					});
				} else {
					APP.GLOBAL.toastMsg('保存二维码失败');
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
			
			var index = this.pageModel.QRCodeAddress.src.lastIndexOf('.');
			var ext = this.pageModel.QRCodeAddress.src.substring(index);
			var fileName = '_downloads/qr_' + this.request.oid + ext;
			
			var downloader = plus.downloader.createDownload(this.pageModel.QRCodeAddress.src, {
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
					APP.GLOBAL.toastMsg('保存二维码失败');
					APP.GLOBAL.closeToastLoading();
				}
			});
			downloader.addEventListener("statechanged", this.onStateChanged);
			downloader.start();
		},
		'onStateChanged': function (download, status) {
		    if (download.state === 2 && status === 404) {
		        download.abort();
				APP.GLOBAL.closeToastLoading();
		        plus.nativeUI.alert('没有找到图片资源，请联系客服重新发码', null, '下载失败');
		    }
		},
		'launchAPP': function() {
			if(this.appType===3){
				this.launchWechat();
			}
			else if(this.appType===4){
				this.launchAlipay();
			}else{
				APP.GLOBAL.toastLoading({
					'message': '正在操作'
				});
				
				var index = this.pageModel.QRCodeAddress.src.lastIndexOf('.');
				var ext = this.pageModel.QRCodeAddress.src.substring(index);
				var fileName = '_downloads/qr_' + this.request.oid + ext;
				var downloader = plus.downloader.createDownload(this.pageModel.QRCodeAddress.src, {
					filename: fileName
				}, function(download, status) {
					if (status === 200) {
						plus.gallery.save(download.filename, function() {
							APP.GLOBAL.closeToastLoading();
				
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
						APP.GLOBAL.toastMsg('保存二维码失败');
						APP.GLOBAL.closeToastLoading();
					}
				});
				downloader.addEventListener("statechanged", this.onStateChanged);
				downloader.start();
			}
			
		},
		'launchError': function(err) {
			APP.GLOBAL.toastMsg('启动失败');
			APP.GLOBAL.closeToastLoading();
		},
		'loadPageData': function() {
			APP.GLOBAL.ajax({
				url: APP.CONFIG.BASE_URL + 'OrderDetail',
				data: this.request,
				success: function(result) {
					if (result.Error) {
						APP.GLOBAL.toastMsg(result.Msg);
						return;
					}

					if (result.Data.QRCodeAddress) {
						result.Data.QRCodeAddress = {
							'loading': '../../../content/img/default_wait.jpg?v=2',
							'error': '../../../content/img/default_wait.jpg?v=2',
							'src': result.Data.QRCodeAddress
						};
					}

					result.Data.ImageAddress = {
						'loading': '../../../content/img/default_product.jpg',
						'error': '../../../content/img/default_product.jpg',
						'src': result.Data.ImageAddress
					};
					
					_vue.pageModel = Object.assign({}, _vue.pageModel, result.Data);
					_vue.appType = _vue.pageModel.RootCategory;
					if (APP.CONFIG.IS_RUNTIME) {
						_vue.fileExists();
					}

					_vue.isLoading = false;
				}
			});
		},
		'fileExists': function() {
			var index = this.pageModel.DataUrl.lastIndexOf('.');
			var ext = this.pageModel.DataUrl.substring(index);
			var fileName = '_downloads/file_' + this.pageModel.Title + ext;

			plus.io.resolveLocalFileSystemURL(fileName, function() {
				_vue.isExists = true;
			}, function() {
				_vue.isExists = false;
			});
		},
		'gotoUploadPayCode': function() {
			if (this.pageModel.OrderStatus === -1) {
				APP.GLOBAL.gotoNewWindow('upload.pay.codePage', 'upload.pay.code', {
					'param': 'oid=' + this.request.oid
				})
			}
		}
	},
	watch: {
		'isTipAgain': function(value) {
			APP.GLOBAL.setItem(APP.CONFIG.SYSTEM_KEYS.DETAIL_TIP_AGAIN_KEY, value);
		}
	},
	created: function() {
		if (APP.CONFIG.IS_RUNTIME) {
			this.statusbarHeight = plus.navigator.getStatusbarHeight();
		}

		var tipAgain = APP.GLOBAL.getItem(APP.CONFIG.SYSTEM_KEYS.DETAIL_TIP_AGAIN_KEY);
		if (!tipAgain || tipAgain === 'false') {
			this.isTipAgain = false;
		} else {
			this.isTipAgain = true;
		}
	},
	mounted: function() {
		this.loadPageData();
	}
});
