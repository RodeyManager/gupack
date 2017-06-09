/**
 * Created by Rodey on 2017/6/9.
 */
;(function() {

    //接口host
    App.ServerHost = '';

    // 会员登陆验证
    App.webServiceUrls = {
        //登录
        login               : 'member/login',
        logout              : 'member/logout'
    };

    // 更具key获取api地址
    var protocolReg = /^(https?:)?\/\//i;
    App.getWebServiceUrl = function(name, host) {
        var APINAME = App.webServiceUrls[name];
        return protocolReg.test(APINAME) ? APINAME : App.getHosts((host || App.ServerHost) + APINAME + (App.apiSuffix || ''));
    };
    App.getHosts = function(page){
        if(protocolReg.test(page) || /^\.+\//.test(page))  return page;
        return location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '') + '/' + page;
    };

}).call(this);
