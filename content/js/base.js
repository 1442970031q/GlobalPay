//移动端meta（ios自动添加viewport-fit）
var metaEl = document.createElement('meta');
metaEl.setAttribute('name', 'viewport');
metaEl.setAttribute('content', 'initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no' + (/iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase()) ? ',viewport-fit=cover' : ''));
document.querySelector('head').appendChild(metaEl);

var APP_NAME = 'GLOBAL_PAY_';//APP名字
var _openw = null;//当前打开窗体
var BASE_IP = 'app.huizhifu.ltd';  // API服务器的域名或IP地址
//var BASE_IP = '47.92.108.219:8050';
var APP = {//APP核心对象
    'CONFIG': {
        'TIME_OUT': 59,
        'VERSION': 40,
        'BASE_URL': 'http://' + BASE_IP + '/API/',
        'IS_RUNTIME': navigator.userAgent.indexOf("Html5Plus") > -1,
        'TIME_STAMP': new Date().getTime(),
        'SYSTEM_KEYS': {
            'USER_MODEL_KEY': APP_NAME + '_user_model',
            'AUTO_LOGIN_KEY': APP_NAME + '_auto_login',
            'LOCAL_LOGIN_INFO_KEY': APP_NAME + '_local_login_info',
            'AUTO_UPGRADE_KEY': APP_NAME + '_auto_upgrade',
            'NEW_MEMBER_KEY': APP_NAME + '_new_member_push',
            'NEW_BONUS_KEY': APP_NAME + '_new_bonus_push',
            'DETAIL_TIP_AGAIN_KEY': APP_NAME + '_detail_tip_again',
            'LAST_PRIVATE_MESSAGE_ID_KEY': APP_NAME + '_last_private_msg_id',
            'CG_FIRST_KEY': APP_NAME + '_cg_first'
        },
        'GESTURE_LOCK_KEYS': {
            'IS_OPEN_WALLET': APP_NAME + 'is_open_wallet',
            'IS_OPEN_AWARD': APP_NAME + 'is_open_award',
            'IS_OPEN_TEAM': APP_NAME + 'is_open_team',
            'IS_OPEN_EARNINGS': APP_NAME + 'is_open_earnings',
            'IS_OPEN_ALIPAY': APP_NAME + 'is_open_alipay'
        },
        'SUB_PAGES': [{
            'pageName': 'home.html'
        }, {
            'pageName': 'shopping.html',
            'loadAction': '_vue.loadPageData()',
            'isLoaded': false
        }, {
            'pageName': 'orders.html',
            'isLoaded': true
        }, {
            'pageName': 'center.html',
            'loadAction': '_vue.reloadPageModel()',
            'isLoaded': false
        }],
        'IPHONE': {
            // iPhone X、iPhone XS
            isIPhoneX: /iphone/gi.test(window.navigator.userAgent) && window.devicePixelRatio && window.devicePixelRatio === 3 && window.screen.width === 375 && window.screen.height === 812,
            // iPhone XS Max
            isIPhoneXSMax: /iphone/gi.test(window.navigator.userAgent) && window.devicePixelRatio && window.devicePixelRatio === 3 && window.screen.width === 414 && window.screen.height === 896,
            // iPhone XR
            isIPhoneXR: /iphone/gi.test(window.navigator.userAgent) && window.devicePixelRatio && window.devicePixelRatio === 2 && window.screen.width === 414 && window.screen.height === 896,
        },
        'IsSafeArea': function () {
            return APP.CONFIG.IPHONE.isIPhoneX || APP.CONFIG.IPHONE.isIPhoneXSMax || APP.CONFIG.IPHONE.isIPhoneXR;
        },
        'TOAST_DEFAULT': {
            mask: true,
            message: '加载中...',
            duration: 0,
            forbidClick: true
        },
        'CONFIRM_DEFAULT': {
            title: '确认对话框',
            message: '确认对话框内容',
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            confirmCallback: function () { },
            cancelCallback: function () { }
        },
        'SYSTEM_NAME': function () {
            var ua = navigator.userAgent.toLowerCase();
            if (/iphone|ipad|ipod/.test(ua)) {
                return 'ios';
            } else {
                return 'andr';
            }
        }()
    },
    'GLOBAL': {
        'getItem': function (key) {
            if (APP.CONFIG.IS_RUNTIME) {
                return plus.storage.getItem(key);
            } else {
                return window.localStorage.getItem(key);
            }
        },
        'setItem': function (k, v) {
            if (APP.CONFIG.IS_RUNTIME) {
                plus.storage.setItem(k, v);
            } else {
                window.localStorage.setItem(k, v);
            }
        },
        'removeItem': function (key) {
            if (APP.CONFIG.IS_RUNTIME) {
                plus.storage.removeItem(key);
            } else {
                window.localStorage.removeItem(key);
            }
        },
        'getUserModel': function () {
            var jsonText = APP.GLOBAL.getItem(APP.CONFIG.SYSTEM_KEYS.USER_MODEL_KEY);
            if (jsonText === null) {
                return APP.USER.MODEL;
            }

            APP.USER.MODEL = JSON.parse(jsonText);
            return APP.USER.MODEL;
        },
        'updateUserModel': function (model, pages) {
            APP.USER.MODEL = Object.assign(APP.USER.MODEL, model);
            APP.GLOBAL.setItem(APP.CONFIG.SYSTEM_KEYS.USER_MODEL_KEY, JSON.stringify(APP.USER.MODEL));

            if (pages instanceof Array && APP.CONFIG.IS_RUNTIME) {
                for (var i = 0; i < pages.length; i++) {
                    var wb = plus.webview.getWebviewById(pages[i].pageName);
                    wb.evalJS(pages[i].actionName);
                }
            }
        },
        'removeModel': function () {
            if (APP.CONFIG.IS_RUNTIME) {
                plus.storage.removeItem(APP.CONFIG.SYSTEM_KEYS.USER_MODEL_KEY);
            } else {
                window.localStorage.removeItem(APP.CONFIG.SYSTEM_KEYS.USER_MODEL_KEY);
            }

            APP.USER.MODEL = {
                'Id': 0,
                'Key': ''
            };
        },
        'gotoNewWindow': function (id, page, an) {
            var newWindow = function newWindow(id, page, ext) {
                if (_openw === null) {
                    ext = typeof ext !== 'object' ? {} : ext;
                    _openw = plus.webview.create(page + (ext.param ? '.html?' + ext.param : '.html'), id, {
                        scrollIndicator: 'none',
                        scalable: false,
                        popGesture: 'close',
                        kernel: 'WKWebview',
                        contentAjust: false,
                        titleNView: ext.titleNView
                    }, { 'paramObject': ext.paramObject });

                    var ani = ext.ani || 'pop-in';
                    var aniTime = APP.CONFIG.SYSTEM_NAME === 'ios' ? 250 : 200;
                    _openw.addEventListener('loaded', function () {
                        _openw.show(ani, aniTime, function () {
                            if (typeof ext.openCallback === 'function') {
                                ext.openCallback();
                            }
                        });

                        _openw = null;
                    });

                    _openw.addEventListener('close', function () {
                        if (typeof ext.closeCallback === 'function') {
                            ext.closeCallback();
                        }
                    });
                }
            };

            if (APP.CONFIG.IS_RUNTIME) {
                newWindow(id, page, {
                    ani: typeof an === 'object' && an.ani ? an.ani : 'pop-in',
                    openCallback: typeof an === 'object' && an.openCallback ? an.openCallback : null,
                    closeCallback: typeof an === 'object' && an.closeCallback ? an.closeCallback : null,
                    'param': typeof an === 'object' && typeof an.param !== 'undefined' ? an.param : null,
                    'paramObject': typeof an === 'object' && typeof an.paramObject !== 'undefined' ? an.paramObject : null,
                    titleNView: typeof an === 'object' && typeof an.titleNView !== 'undefined' ? an.titleNView : null
                });
            } else {
                if (typeof an !== 'undefined' && typeof an.param !== 'undefined') {
                    window.location = page + '.html?' + an.param;
                } else {
                    window.location = page + '.html';
                }
            }
        },
        'closeWindow': function (ani) {
            if (!APP.CONFIG.IS_RUNTIME) {
                window.history.back();
                return;
            }

            if (typeof window.onPageClose === 'function') {
                window.onPageClose();
            }

            plus.webview.currentWebview().close(typeof ani === 'string' ? ani : 'auto');
        },
        'showWaiting': function (text) {
            if (APP.CONFIG.IS_RUNTIME) {
                plus.nativeUI.showWaiting(text);
            } else {
                APP.GLOBAL.toastLoading({ 'message': text });
            }
        },
        'closeWaiting': function () {
            if (APP.CONFIG.IS_RUNTIME) {
                plus.nativeUI.closeWaiting();
            } else {
                APP.GLOBAL.closeToastLoading();
            }
        },
        'toastLoading': function (option) {
            if (typeof _vue === 'undefined') return;

            option = Object.assign({}, APP.CONFIG.TOAST_DEFAULT, option);
            _vue.$toast.loading({
                mask: option.mask,
                duration: option.duration,
                message: option.message
            });
        },
        'closeToastLoading': function () {
            if (typeof _vue === 'undefined') return;

            _vue.$toast.clear();
        },
        'toastMsg': function (text) {
            if (!APP.CONFIG.IS_RUNTIME) {
                _vue.$toast({
                    'message': text,
                    'position': 'bottom',
                    'duration': 2000
                });
            } else {
                plus.nativeUI.toast(text);
            }
        },
        'confirmMsg': function (option) {
            option = Object.assign({}, APP.CONFIG.CONFIRM_DEFAULT, option);
            _vue.$dialog.confirm(option).then(option.confirmCallback).catch(option.cancelCallback);
        },
        'queryString': function (name) {
            var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
            var r = window.location.search.substr(1).match(reg);

            if (r !== null) {
                return decodeURIComponent(r[2]);
            }
            return null;
        },
        'ajax': function (option) {
            option = option || {};
            option.method = "POST";
            option.url = option.url || '';
            option.dataType = "JSON";
            option.async = option.async || true;
            option.data = option.data || {};
            option.timeout = option.timeout || 20000;
            option.data['key'] = APP.USER.MODEL.Key;
            option.data['v'] = APP.CONFIG.TIME_STAMP;
            option.success = option.success || function () { };
            option.error = option.error || function (XMLHttpRequest, textStatus, errorThrown) {
                if (typeof _vue !== 'undefined' && typeof _vue.$toast !== 'undefined') {
                    _vue.$toast.clear();
                }
                console.log('status:' + XMLHttpRequest.status);
                console.log('XMLHttpRequest：' + JSON.stringify(XMLHttpRequest));
                console.log('readyStatetus:' + XMLHttpRequest.readyState);
                console.log('textStatus:' + textStatus);
                console.log('errorThrown:' + errorThrown);
            };

            if (!XMLHttpRequest) {
                console.log("不支持XMLHttpRequest对象。");
                return;
            }

            var xhr = new XMLHttpRequest();
            xhr.timeout = option.timeout;
            xhr.ontimeout = option.ontimeout || function () {
                if (typeof _vue !== 'undefined' && typeof _vue.$toast !== 'undefined') {
                    _vue.$toast.clear();
                }

                APP.GLOBAL.toastMsg('服務器目前繁忙，請稍後重試該操作！');
            };

            if (typeof xhr === 'undefined' || xhr === null) {
                console.log("XMLHttpRequest对象创建失败！");
                return;
            }

            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        try {
                            var json = JSON.parse(xhr.responseText || xhr.response);
                            if (typeof json.Exts !== 'undefined' && typeof json.Exts.IsLogin !== 'undefined') {
                                APP.GLOBAL.toastMsg('请登录您的账号');
                            } else {
                                option.success(json);
                            }
                        } catch (e) {
                            console.error('Response:' + (xhr.responseText || xhr.response) + '\r\nMessage:' + e.message + '\r\nStack:' + e.stack);
                            option.error(xhr, xhr.status);
                        }
                    } else {
                        option.error(xhr, xhr.status);
                    }
                }
            };

            var params = [];
            for (var key in option.data) {
                if (option.data.hasOwnProperty(key)) {
                    params.push(key + '=' + option.data[key]);
                }
            }

            try {
                var postData = params.join('&');
                xhr.open(option.method, option.url, option.async);
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
                xhr.send(postData);
            } catch (e) {
                console.log(e);
            }
        }
    },
    'USER': {
        'MODEL': {
            'Id': 0,
            'Key': '',
            'Avatar': '',
            'FlowNumber': 0,
            'NickName': '',
            'Phone': '',
            'CreateTime': '',
            'IsSetPin': false,
            'LvName': '',
            'ClientId': '',
            'ShowRank': false,
            'IsSetHandPwd': false
        }
    }
};

//页面加载完毕事件
function pageLoaded() {
    //监听滚动事件
    window.addEventListener('scroll', function () {
        var clientHeight = 0;
        if (document.body.clientHeight && document.documentElement.clientHeight) {
            clientHeight = document.body.clientHeight < document.documentElement.clientHeight ? document.body.clientHeight : document.documentElement.clientHeight;
        } else {
            clientHeight = document.body.clientHeight > document.documentElement.clientHeight ? document.body.clientHeight : document.documentElement.clientHeight;
        }

        var scrollTop = document.body.scrollTop > document.documentElement.scrollTop ? document.body.scrollTop : document.documentElement.scrollTop;
        var scrollBottom = document.body.scrollHeight - scrollTop;
        if (typeof window.scrollChange === 'function') {
            window.scrollChange(scrollTop);
        }

        if ((scrollBottom >= clientHeight && scrollBottom <= clientHeight + 70)) {
            if (typeof window.scrollBottom === 'function') window.scrollBottom();
        }
    });

    if (APP.CONFIG.IS_RUNTIME) {
        if (APP.CONFIG.SYSTEM_NAME !== 'ios') {//如果安卓则绑定返回按钮事件
            //绑定后退按钮事件（安卓按钮）
            plus.key.addEventListener('backbutton', function () {
                //如果窗体自身实现后退按钮
                if (typeof window.backButton === 'function') {
                    window.backButton();
                    return;//不再处理其他业务
                }

                //判断是否需要处理“提示框”和“加载框”
                if (typeof window.isPageControlBackButton === 'undefined' || window.isPageControlBackButton === false) {
                    //首先检测是否有对话框存在
                    var modal = getFirstByClass('van-modal');
                    if (typeof _vue !== 'undefined' && modal !== null && modal.style.display !== 'none') {
                        var toastObject = getFirstByClass('van-toast');
                        var dialogObject = getFirstByClass('van-dialog');

                        if (toastObject !== null) {
                            _vue.$toast.clear();
                        }

                        if (dialogObject !== null) {
                            _vue.$dialog.close();
                        }

                        return;//关闭后不再处理其他业务
                    }
                }

                //检查是否需要退出app
                if (plus.webview.all().length !== APP.CONFIG.SUB_PAGES.length + 1) {
                    APP.GLOBAL.closeWindow();
                } else {
                    plus.webview.getWebviewById('mainPage').evalJS('_vue.hiddenApp()');
                }
            });
        }
    }

    //绑定顶部返回按钮事件
    var back = document.getElementById('app-back-button');
    if (back !== null) {
        back.addEventListener('click', APP.GLOBAL.closeWindow);
    }
}

/*
*   获取第一个检索到的元素
*/
function getFirstByClass(classname) {
    var oChild = document.getElementsByTagName('*');

    for (var i = 0, len = oChild.length; i < len; i++) {
        if (oChild[i].className.toString().indexOf(classname) >= 0) {
            return oChild[i];
        }
    }
    return null;
}

/*
* 参数说明：
* @param：要格式化的数字
* @param：保留几位小数
* @param：小数点符号
* @param：千分位符号
* */
function numberFormat(number, decimals, dec_point, thousands_sep) {
    number = (number + '').replace(/[^0-9+-Ee.]/g, '');
    var n = !isFinite(+number) ? 0 : +number,
        prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
        sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
        dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
        s = '',
        toFixedFix = function (n, prec) {
            var k = Math.pow(10, prec);
            return '' + Math.floor(n * k) / k;
        };
    s = (prec ? toFixedFix(n, prec) : '' + Math.floor(n)).split('.');
    var re = /(-?\d+)(\d{3})/;
    while (re.test(s[0])) {
        s[0] = s[0].replace(re, "$1" + sep + "$2");
    }

    if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1).join('0');
    }
    return s.join(dec);
}

if (!Object.assign) {
    Object.defineProperty(Object, "assign", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (target, firstSource) {
            "use strict";
            if (target === undefined || target === null)
                throw new TypeError("Cannot convert first argument to object");

            var to = Object(target);
            for (var i = 1; i < arguments.length; i++) {
                var nextSource = arguments[i];
                if (nextSource === undefined || nextSource === null) continue;
                var keysArray = Object.keys(Object(nextSource));

                for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                    var nextKey = keysArray[nextIndex];
                    var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                    if (desc !== undefined && desc.enumerable) to[nextKey] = nextSource[nextKey];
                }
            }
            return to;
        }
    });
}

//取消浏览器的所有事件，使得active的样式在手机上正常生效
document.addEventListener('touchstart', function () { return false; }, true);
// 禁止选择
//document.oncontextmenu = function () { return false; };

document.addEventListener('DOMContentLoaded', pageLoaded);
