;(function() {
    window.App = window.App || new Object();
    //调式模式
    App.IS_DEBUG = false;

    /*-------项目其他配置参数 Start--------*/
    //短信发送间隔时间
    App.sendTime = 60;

    /*-------项目其他配置参数 End--------*/

    /*-------项目所有api接口配置 Start--------*/
    var href = window.location.href.replace(window.location.hash, ''),
        port = location.port,
        host = location.host,
        origin = window.location.origin || (function(){
                return location.protocol  + '//' + host + (port != '' ? ':' + port : port);
            })();
    var webServiceUrls = {
        //登录
        login          : 'members/logout'
    };

    // 强制使用某个环境(测试用),默认就设置为空
    App.testEnv = 'local';

    if(App.testEnv == 'stg' || App.testEnv == 'prd' || App.testEnv == ''){
        //调配链接环境
        App.ServerHost = origin + '/' + location.pathname.split('/')[1] + '/';

    }else if(App.testEnv == 'int'){
        //开发环境
        App.ServerHost = 'http://10.141.139.52:8080/';  //（Jack）

    }else if(App.testEnv == 'local'){
        //本地环境
        var ma = (location.pathname.match(/[\w-]+.(html|do|action)/gi))[0];
        App.ServerHost = origin + location.pathname.replace(ma, '');
        // 会员登陆验证
        webServiceUrls = {
            //登录
            login               : 'assets/mockData/login.json'
        };
    }

    //更具key获取api地址
    App.webServiceUrls = webServiceUrls;
    App.getWebServiceUrl = function(name, host) {
        return (host || App.ServerHost) + webServiceUrls[name];
    };

    /*-------项目所有api接口配置 End--------*/

}).call(this);
