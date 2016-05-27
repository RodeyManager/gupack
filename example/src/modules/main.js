/**
 * Created with JetBrains WebStorm.
 * User: Rodey
 */

require.config({
    baseUrl : '',
    shim : {
        'jQuery'         : { exports: '$' },
        'EasyUI'        : { deps: ['jQuery'] },
        'SYST'          : { deps: ['jQuery'] }
    },
    paths : {
        text            : 'assets/js/require/text.min',
        jQuery          : 'assets/js/jquery/jquery.min',
        EasyUI          : 'assets/js/easyui/jquery.easyui.min',
        SYST            : 'assets/js/SYST/SYST'
    }
});
//引入公共js模块
define(['jQuery', 'EasyUI', 'SYST'], function($){

    //定位当前页面
    var _page = location.href.match(/[\w\d_-]+(.do|.html)/ig);
    var currentPageName = _page ? _page.join().match(/[\w\d_-]+/ig)[0] : "index";
    App.currentPage = currentPageName;
    //当前页面的当前模块
    var module;
    if($('script[data-module]').attr('data-module')){
        module = $('script[data-module]').attr('data-module');
    }else{
        module = 'module/' + currentPageName;
    }

    // 模块自动解析，以便引入时使用 ( 使用此功能需要 html文件名 和 js文件夹的名称相同,区分大小写 )
    require.config({
        paths : {
            appModel            : 'module/model',
            appController       : 'module/controller',
            appView             : 'module/view',
            currentModule       : module,
            currentModel        : module +'/model',
            currentController   : module +'/controller',
            currentView         : module +'/view',
            currentTemplate     : module +'/template'
        }
    });

    autoLoad();

    //自动加载入口文件
    //根据在script标签上配置的属性值来进行加载
    function autoLoad(){

        //如果有指定的app存在，则引入指定的app入口
        if($('script[data-app]').attr('data-app')){
            require([$('script[data-app]').attr('data-app')]);
        }
        //不需要引入
        if('no' === $('script[data-view]').attr('data-view')){
            require(['appView']);
            return false;
        }
        else if($('script[data-view]').attr('data-view')){
            //如果有指定的视图入口，则引入
            require(['appView', $('script[data-view]').attr('data-view')]);
        }else{
            //自动引入与文件名对应的视图
            require(['appView', 'currentView']);
        }

    }

});

