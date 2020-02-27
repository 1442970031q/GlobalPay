var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'statusbarHeight': 20,
        'dateRange': {
            'beginDisplay': '起始日期',
            'begin': '',
            'endDisplay': '结束日期',
            'end': ''
        },
        'isStartShow': false,
        'isEndShow': false,
        'startDate': new Date(),
        'endDate': new Date(),
        'minDate': new Date(2019, 2, 1),
        'maxDate': new Date(),
        'pageData': new Array(),
        'activeNames': ['2'],
        'isLoading': true,
        'isloadTwo': true,
        'loadData': {
            "sum": new Array(),
            "toDay": new Array()
        }
    },
    methods: {
        'gotoRanking': function () {
            APP.GLOBAL.gotoNewWindow('rankingPage', 'subPages/ranking', {
                openCallback: function () {
                    plus.navigator.setStatusBarStyle('light');
                },
                closeCallback: function () {
                    plus.navigator.setStatusBarStyle('dark');
                }
            });
        },
        'getTime': function (d) {
            return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
        },
        'searchData': function () {
            if (!this.dateRange.begin) {
                APP.GLOBAL.toastMsg('请选择起始日期');
            } else if (!this.dateRange.end) {
                APP.GLOBAL.toastMsg('请选择结束日期');
            } else if (this.dateRange.end < this.dateRange.begin) {
                APP.GLOBAL.toastMsg('结束日期不能小于起始日期');
            } else {
                APP.GLOBAL.toastLoading({ 'message': '正在搜索' });
                this.doSearchAjax(this.getTime(this.dateRange.begin), this.getTime(this.dateRange.end));
            }
        },
        'doSearchAjax': function (start, end) {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'AwardsEarnings',
                data: {
                    'startTime': start,
                    'endTime': end
                },
                success: function (result) {
                    APP.GLOBAL.closeToastLoading();
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.pageData = [];
                    for (var key in result.Data) {
                        _vue.pageData.push({
                            "name": key,
                            "data": result.Data[key]
                        });
                    }

                    _vue.isLoading = false;
                    _vue.$nextTick(function () {
                        _vue.draw(result.TimeRange, _vue.pageData);
                    });
                }
            });
        },
        'startConfirm': function (date) {
            this.dateRange.begin = date;
            this.dateRange.beginDisplay = date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日';
            this.isStartShow = false;
        },
        'endConfirm': function (date) {
            this.dateRange.end = date;
            this.dateRange.endDisplay = date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日';
            this.isEndShow = false;
        },
        'formatter': function (type, value) {
            if (type === 'year') {
                return value + '年';
            } else if (type === 'month') {
                return value + '月';
            } else if (type === 'day') {
                return value + '日';
            }
            return value;
        },
        'draw': function (xData, yData) {
            Highcharts.chart('container', {
                title: { text: null },
                credits: { enabled: false },
                xAxis: {
                    type: 'datetime',
                    categories: xData,
                    labels: {
                        formatter: function () {
                            var d = new Date(this.value);
                            return d.getMonth() + 1 + '/' + d.getDate();
                        }
                    }
                },
                yAxis: {
                    title: {
                        text: null
                    }
                },
                series: yData
            });
        },
        'loadPageData': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'AwEarnings',
                success: function (result) {
                    APP.GLOBAL.closeToastLoading();
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    for (var dataKey in result.Data) {
                        _vue.loadData.sum.push({
                            "name": dataKey,
                            "number": result.Data[dataKey]
                        });
                    }

                    for (var key in result.Exts.PerData) {
                        _vue.loadData.toDay.push({
                            "name": key,
                            "number": result.Exts.PerData[key]
                        });
                    }

                    _vue.isloadTwo = false;
                    _vue.doSearchAjax("", "");
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
        this.loadPageData();
    }
});