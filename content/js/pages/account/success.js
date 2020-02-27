var _vue = new Vue({
    el: '#app',
    data: {
        'statusbarHeight': 20
    },
    methods: {
        'go': function () {
            APP.GLOBAL.closeWindow();
        }
    }
});