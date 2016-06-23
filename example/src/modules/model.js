/**
 * Created by Rodey on 2015/7/20.
 */

var appModel;
$(function(){

    appMpdel = SYST.Model({
        $mid: 'appModel',
        init: function(){
            //全局ajax请求方式
            this.$http.ajaxType = 'POST';

            //生产对应的接口请求方法
            this.initGenerateApis();
        },

        initGenerateApis: function(){
            var apis = {};
            for(var key in App.webServiceUrls){
                if(App.webServiceUrls.hasOwnProperty(key)){
                    apis[key] = App.getWebServiceUrl(key);
                }
            }
            this.generateApi(apis);
        },

        /*---------------------------------------会员相关----------------------------------------*/

        showPage: function(){
            document.getElementsByTagName('html')[0].classList.remove('loading');
            document.body.style.display = 'block';
        },

        //接口测试用
        test: function(postData, su, fail){
            this.$http.doAjax(App.getWebServiceUrl('test'), postData, su, fail, { callTarget: this });
        }

    });

    var requestTipDom = $('#request-tip');

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

