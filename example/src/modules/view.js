/**
 * Created by r9luox on 2016/4/15
 * name: '__ VIEW 公共视图 __'
 */

var appView;
$(function(){

    appView = SYST.View({

        model: appModel,
        events: {
            //退出登录
            'click #logout-btn':    'userLogout'
        },
        init: function(){
            //console.log('初始化公共View');
        },
        //用户退出登录
        userLogout: function(evt){
            if(confirm('您确定需要退出该系统吗？')){
                SYST.T.jumpTo('login.html');
            }
            //console.log('您确定需要退出该系统吗？');
        }

    });

});