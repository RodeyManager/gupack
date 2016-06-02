/**
 * Created by r9luox on 2016/5/18
 * name: '__ loginView 登录视图 __'
 */

$(function(){

    var $name = $('#username'),
        $pawd = $('#password'),
        $etip = $('#err-tip');

    var loginModel = SYST.Model({
        $mid: 'loginModel',
        props: {
            name: SYST.T.Cookie('name') || SYST.T.getParams('name'),
            pass: SYST.T.Cookie('pass')
        }
    });

    var loginView = SYST.View({
        model: appModel,
        events: {
            'click #login-btn'       : 'login'
        },
        init: function(){
            this.posting = false;
        },
        login: function(evt){
            if(this.posting)    return;
            var name = $name.val(),
                pass = $pawd.val();
            if(SYST.V.isEmpty(name)){
                $etip.html('用户名不能为空');
                return false;
            }
            if(SYST.V.isEmpty(pass)){
                $etip.html('密码不能为空');
                return false;
            }

            var postData = { name: name, pass: pass };
            this.posting = true;
            this.model.login(postData, this.loginSuccess.bind(this), this.loginError.bind(this), { type: 'GET' });

        },

        loginSuccess: function(res){
            this.posting = false;
            if(200 === res.code){
                //保存30天
                if(LegalSelector.check()){
                    SYST.T.Cookie('name', $name.val(), { expires: 30 });
                    SYST.T.jumpTo('index.html');
                }else{
                    SYST.T.jumpTo('index.html', { name: $name.val() });
                }

            }else{
                this.loginError(res);
            }
        },
        loginError: function(err){
            this.posting = false;
            $etip.html('登录失败, 用户名或密码错误!');
        }

    });

});