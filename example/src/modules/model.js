/**
 * Created by Rodey on 2015/7/20.
 */

var appModel;
SYST.$(function(){

    var appHttp = SYST.Http({
        init: function(){
            this.generateApi(App.webServiceUrls);
        }
    });

    appModel = SYST.Model({
        $http: appHttp,
        init: function(){
            //全局ajax请求方式
            this.$http.ajaxType = 'POST';
        },

        /*---------------------------------------会员相关----------------------------------------*/

        showPage: function(){
            this.$('html').removeClass('loading');
            this.$('body').show();
        },

        //接口测试用
        test: function(postData, su, fail){
            this.$http.test(postData, su, fail, { callTarget: this });
        }

    });

    var requestTipDom = SYST.$('#request-tip');

    SYST.httpConfig = {
        commonData: {
            token: 'SDFDFA5SD1F5AS1D8FE15D'
        },
        //-------------ajax请求过程的每一个回调回调（注意每一个请求都会调用）----------------------------------
        ajaxBefore: function(){
            //console.log('发起请求之前执行');
            requestTipDom.show();
        },
        ajaxEnd: function(res){
            //console.log('请求结束 success error 之前执行', res);
            requestTipDom.hide();
        },
        ajaxComplete: function(res){
            //console.log('请求完成 success error主题执行之后', res);
        },
        ajaxSuccess: function(res){
            //console.log('请求成功');
        },
        ajaxError: function(err, xhr){
            //console.log('请求失败', this);
        }
    };

});

