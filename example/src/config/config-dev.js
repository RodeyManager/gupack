;(function() {
    window.App = window.App || {};

    //接口host
    App.ServerHost = '';

        // 会员登陆验证
    App.webServiceUrls = {
        //登录
        login               : '../src/mockData/login.json',
        logout              : '../src/mockData/logout.json'
    };

    //更具key获取api地址
    App.getWebServiceUrl = function(name, host) {
        return (host || App.ServerHost) + App.webServiceUrls[name];
    };

}).call(this);
