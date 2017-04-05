;(function() {
    window.App = window.App || {};

    //接口host
    App.ServerHost = '';

    // 会员登陆验证
    App.webServiceUrls = {
        //登录
        login               : 'members/login',
        logout              : 'members/logout'
    };

    //更具key获取api地址
    App.getWebServiceUrl = function(name, host) {
        return (host || App.ServerHost) + App.webServiceUrls[name];
    };

}).call(this);
