(function (prototype) {
    prototype.getContext = (function (_super) {
        return function (type) {
            var backingStore, ratio,
				context = _super.call(this, type);

            if (type === '2d') {
                backingStore = context.backingStorePixelRatio ||
							context.webkitBackingStorePixelRatio ||
							context.mozBackingStorePixelRatio ||
							context.msBackingStorePixelRatio ||
							context.oBackingStorePixelRatio || 1;

                ratio = (window.devicePixelRatio || 1) / backingStore;

                if (ratio > 1) {
                    this.style.height = this.height + 'px';
                    this.style.width = this.width + 'px';
                    this.width *= ratio;
                    this.height *= ratio;
                    context.scale(ratio, ratio);
                }
            }

            return context;
        };
    })(prototype.getContext);
})(HTMLCanvasElement.prototype);

(function () {
    window.H5lock = function (obj) {
        this.chooseType = 3;
        this.firstComplete = obj.firstComplete || function () { };
        this.secondComplete = obj.secondComplete || function () { };
    };

    H5lock.prototype.drawCle = function (x, y) { // 初始化解锁密码面板
        this.ctx.strokeStyle = '#757575';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.r + 10, 0, Math.PI * 2, true);
        this.ctx.closePath();
        this.ctx.stroke();
    };

    H5lock.prototype.drawPoint = function () { // 初始化圆心
        for (var i = 0; i < this.lastPoint.length; i++) {
            this.ctx.fillStyle = '#757575';
            this.ctx.beginPath();
            this.ctx.arc(this.lastPoint[i].x, this.lastPoint[i].y, this.r / 2, 0, Math.PI * 2, true);
            this.ctx.closePath();
            this.ctx.fill();
        }
    };

    H5lock.prototype.drawStatusPoint = function (type) { // 初始化状态线条
        for (var i = 0; i < this.lastPoint.length; i++) {
            this.ctx.strokeStyle = type;
            this.ctx.beginPath();
            this.ctx.arc(this.lastPoint[i].x, this.lastPoint[i].y, this.r, 0, Math.PI * 2, true);
            this.ctx.closePath();
            this.ctx.stroke();
        }
    };

    H5lock.prototype.drawLine = function (po, lastPoint) {// 解锁轨迹
        this.ctx.beginPath();
        this.ctx.lineWidth = 3;
        this.ctx.moveTo(this.lastPoint[0].x, this.lastPoint[0].y);
        for (var i = 1; i < this.lastPoint.length; i++) {
            this.ctx.lineTo(this.lastPoint[i].x, this.lastPoint[i].y);
        }
        this.ctx.lineTo(po.x, po.y);
        this.ctx.stroke();
        this.ctx.closePath();

    };

    H5lock.prototype.createCircle = function () {// 创建解锁点的坐标，根据canvas的大小来平均分配半径
        var backingStore = this.ctx.backingStorePixelRatio ||
            this.ctx.webkitBackingStorePixelRatio ||
            this.ctx.mozBackingStorePixelRatio ||
            this.ctx.msBackingStorePixelRatio ||
            this.ctx.oBackingStorePixelRatio || 1;

        var ratio = (window.devicePixelRatio || 1) / backingStore;
        var n = this.chooseType;
        var count = 0;
        this.r = this.ctx.canvas.width / (2 + 4 * n) / ratio;// 公式计算
        this.lastPoint = [];
        this.arr = [];
        this.restPoint = [];
        var r = this.r;
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        for (var i = 0; i < n; i++) {
            for (var j = 0; j < n; j++) {
                count++;
                var obj = {
                    x: j * 4 * r + 3 * r,
                    y: i * 4 * r + 3 * r,
                    index: count
                };

                this.arr.push(obj);
                this.restPoint.push(obj);
                this.drawCle(obj.x, obj.y);
            }
        }
    };

    H5lock.prototype.getPosition = function (e) {// 获取touch点相对于canvas的坐标
        var rect = e.currentTarget.getBoundingClientRect();
        var po = {
            x: e.touches[0].clientX - rect.left,
            y: e.touches[0].clientY - rect.top
        };
        return po;
    };

    H5lock.prototype.update = function (po) {// 核心变换方法在touchmove时候调用
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        for (var i = 0; i < this.arr.length; i++) { // 每帧先把面板画出来
            this.drawCle(this.arr[i].x, this.arr[i].y);
        }

        this.drawPoint(this.lastPoint);// 每帧花轨迹
        this.drawLine(po, this.lastPoint);// 每帧画圆心

        for (var i = 0; i < this.restPoint.length; i++) {
            if (Math.abs(po.x - this.restPoint[i].x) < this.r && Math.abs(po.y - this.restPoint[i].y) < this.r) {
                this.drawPoint(this.restPoint[i].x, this.restPoint[i].y);
                this.lastPoint.push(this.restPoint[i]);
                this.restPoint.splice(i, 1);
                break;
            }
        }
    };

    //H5lock.prototype.checkPass = function (psw1, psw2) {// 检测密码
    //    var p1 = '',
    //    p2 = '';
    //    for (var i = 0 ; i < psw1.length ; i++) {
    //        p1 += psw1[i].index + psw1[i].index;
    //    }
    //    for (var i = 0 ; i < psw2.length ; i++) {
    //        p2 += psw2[i].index + psw2[i].index;
    //    }
    //    return p1 === p2;
    //}

    H5lock.prototype.getPassword = function (passwordArr) {
        var pStr = '';
        for (var i = 0; i < passwordArr.length; i++) {
            pStr += passwordArr[i].index;
        }

        return pStr;
    };

    H5lock.prototype.storePass = function (psw) {// touchend结束之后对密码和状态的处理
        if (this.pswObj.step === 1) {
            var firstPwd = this.getPassword(this.pswObj.fpassword);
            var secPwd = this.getPassword(psw);
            var result = this.secondComplete(firstPwd, secPwd);
            if (!result) {
                this.drawStatusPoint('red');
                delete this.pswObj.step;
            } else {
                this.drawStatusPoint('#2CFF26');
            }
            //if (this.checkPass(this.pswObj.fpassword, psw)) {
            //    this.pswObj.step = 2;
            //    this.pswObj.spassword = psw;
            //    document.getElementById('title').innerHTML = '密码保存成功';
            //    this.drawStatusPoint('#2CFF26');
            //    window.localStorage.setItem('passwordxx', JSON.stringify(this.pswObj.spassword));
            //    window.localStorage.setItem('chooseType', this.chooseType);
            //} else {
            //    document.getElementById('title').innerHTML = '两次不一致，重新输入';
            //    this.drawStatusPoint('red');
            //    delete this.pswObj.step;
            //}
        } else {
            var password = this.getPassword(psw);
            var isSuccess = this.firstComplete(password);
            if (isSuccess) {
                this.pswObj.step = 1;
                this.pswObj.fpassword = psw;
            }
        }
    };

    H5lock.prototype.initDom = function (id) {
        var size = document.getElementById(id).clientWidth;
        var wrap = document.createElement('div');
        var str = '<canvas id="canvas" width="' + size + '" height="' + size + '"></canvas>';
        wrap.innerHTML = str;
        wrap.id = 'wrap';
        document.getElementById(id).appendChild(wrap);
    };

    H5lock.prototype.init = function (id) {
        this.initDom(id);

        this.pswObj = {};
        this.lastPoint = [];
        this.touchFlag = false;
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.createCircle();
        this.bindEvent();
    };

    H5lock.prototype.reset = function () {
        this.createCircle();
    };

    H5lock.prototype.bindEvent = function () {
        var self = this;
        this.canvas.addEventListener("touchstart", function (e) {
            e.preventDefault();// 某些android 的 touchmove不宜触发 所以增加此行代码
            var po = self.getPosition(e);
            for (var i = 0; i < self.arr.length; i++) {
                if (Math.abs(po.x - self.arr[i].x) < self.r && Math.abs(po.y - self.arr[i].y) < self.r) {
                    self.touchFlag = true;
                    self.drawPoint(self.arr[i].x, self.arr[i].y);
                    self.lastPoint.push(self.arr[i]);
                    self.restPoint.splice(i, 1);
                    break;
                }
            }
        }, false);
        this.canvas.addEventListener("touchmove", function (e) {
            if (self.touchFlag) {
                self.update(self.getPosition(e));
            }
        }, false);
        this.canvas.addEventListener("touchend", function (e) {
            if (self.touchFlag) {
                self.touchFlag = false;
                self.storePass(self.lastPoint);
                setTimeout(function () {
                    self.reset();
                }, 300);
            }
        }, false);
    };
})();