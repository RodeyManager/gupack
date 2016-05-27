;(function() {
    window.App = window.App || new Object();
    /**
     * 常量定义
     */
    App.IS_DEBUG = false;

    //短信发送间隔时间
    App.sendTime = 60;

    var href = window.location.href.replace(window.location.hash, '');
    var origin = window.location.origin;
    // 服务器地址
    var webServiceUrls = {};

    // 强制使用某个环境(测试用),默认就设置为空
    App.testEnv = 'int';

    if(App.testEnv == 'stg' || App.testEnv == 'prd' || App.testEnv == ''){
        //调配链接环境
        App.ServerHost = location.origin + '/' + location.pathname.split('/')[1] + '/';

    }else if(App.testEnv == 'int'){
        //开发环境
        App.ServerHost = 'http://10.141.139.52:8080/';  //（Rick Yu）

    }else if(App.testEnv == 'local'){
        //本地环境
        var ma = (location.pathname.match(/[\w-]+.(html|do|action)/gi))[0];
        href = origin + '/' + location.pathname.replace(ma, '');
        App.ServerHost = href;
        // 会员登陆验证
        webServiceUrls = {

            //测试接口用
            test                : 'module/test.json'
        };
    }

    // api接口地址
    webServiceUrls = {

        //获取投保人信息
        getInsuranceInfo        : 'online/sale/template/mobile/entrance/getInsuranceInfo',
        //提交签名
        signature               : 'online/sale/template/mobile/entrance/signature',
        getSignature            : 'online/sale/template/mobile/entrance/getSignature',
        //获取问卷调查列表
        getQuestions            : 'online/sale/template/mobile/entrance/getQuestionnaire',

        //退出
        logout          : 'members/logout',
        //测试接口用
        test            : 'module/test.json'

    };

    //更具key获取api地址
    App.webServiceUrls = webServiceUrls;
    App.getWebServiceUrl = function(name, host) {
        return (host || App.ServerHost) + webServiceUrls[name];
    };

}).call(this);
