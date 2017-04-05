/**
 * name: '__ loginView 登录视图 __'
 */

SYST.$(function(){

    var $ = SYST.$,
        $name = $('#username'),
        $pawd = $('#password'),
        $etip = $('#err-tip');

    var loginModel = SYST.Model({
        model: appModel,
        $mid: '#app',
        props: {
            name: SYST.T.getCookie('name') || SYST.T.getParams('name'),
            pass: SYST.T.getCookie('pass'),
            remember: SYST.T.getCookie('remember') || 1
        },
        init: function(){
            this.posting = false;
            if(this.props.remember){
                LegalSelector.check(true);
            }
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
            this.model.$http.login(postData, this.loginSuccess.bind(this), this.loginError.bind(this), { type: 'GET' });
        },
        loginSuccess: function(res){
            this.posting = false;
            if(200 === res.code){
                //保存30天
                if(LegalSelector.check()){
                    SYST.T.setCookie({ 'name': $name.val(), 'remember': 1 }, { expires: 30 });
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
        },

        logout: function(evt){
            this.model.$http.logout({name: SYST.T.getCookie('name')}, function(){
                SYST.T.setCookie('name', null);
                SYST.T.setCookie('remember', null);
                SYST.T.jumpTo('login.html');
            });
        }
    });

});