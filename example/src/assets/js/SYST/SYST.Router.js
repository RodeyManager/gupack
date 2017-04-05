/*
* SYST.Router.js v 1.0
* Copyright  2016, Rodey Luo
* Released under the MIT License.
* Date Tue Dec 06 2016 15:45:14 GMT+0800 (中国标准时间)
*/
/**
 * Created by Rodey on 2015/10/16.
 * Module Router 路由相关
 */

;(function(SYST){

    var uri = window.location,
        hash = uri.hash,
        supportPushState = 'pushState' in history,
        isReplaceState = 'replaceState' in history;

    var optionalParam = /\((.*?)\)/g,
        namedParam    = /(\(\?)?:\w+/g,
        splatParam    = /\*\w+/g,
        escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g,
        emptyFunc     = function(){};

    var _getRouteKey = function(hash){
        return hash.replace(/[#!]/gi, '').split('?')[0];
    };

    //Router info
    /**
     * @type {Function}
     */
    var Router = function(){
        this.__instance_SYST__ = 'SYST Router';
        this.__Name__ = 'SYST Router';
    };
    SYST.Router = function(){
        var router = SYST.extendClass(arguments, Router);
        router._initialize();
        return router;
    };

    SYST.R = Router.prototype = {
        $: SYST.$,
        //一个路由对象，包涵当前所有的路由列表
        //exp:
        // routes: {
        //      'user/': 'listController',
        //      'user/add': 'addController'
        // }

        /**
         * $private 初始化
         * @private
         */
        _initialize: function(){
            this._reset();
            if(SYST.V.isObject(this.routes) && this.routes != {}){

                var routes = this.routes;
                for(var k in routes){
                    this._initRouters(k, routes[k]);
                }

                this.start();

            }
            //this.init && SYST.V.isFunction(this.init) && this.init.apply(this);
        },
        _reset: function(){
            this._cache = this._cache || {};
            this._stateCache = this._stateCache || [];
            this.routes = this.routes || null;
            this.container = this.container || 'body';
            this.router = this.router || null;
            this.params = this.params || null;
            this.isRender = this.isRender || false;
        },

        /**
         * $private 将路由加入到缓存
         * @param route    路由字符串
         * @param object   路由处理对象
         * @private
         */
        _initRouters: function(route, object){

            if(SYST.V.isString(object) && this[object]){
                object = this[object];
            }
            this._cache[route] = object;

        },

        /**
         * $public 控制执行路由
         * @returns {SYST.Router}
         */
        start: function(){
            //如果初始化带有hash
            var redirectTo = this['redirectTo'];
            if(hash && '' !== hash){
                var currentRoute = _getRouteKey(hash);
                this.switcher(currentRoute);
            }else{
                if(redirectTo){
                    this._updateHash(redirectTo);
                }
            }

            this._changeStart();
            return this;
        },
        stop: function(){
            this._changeStop();
        },

        /**
         * $public 匹配路由，添加到缓存
         * @param route
         * @param object
         */
        when: function(route, object){
            if(SYST.V.isEmpty(route))  return;
            if(SYST.V.isObject(object)){
                this._cache[route] = object;
            }else if(SYST.V.isFunction(object)){
                this._cache[route] = object.apply(this);
            }

            return this;
        },

        /**
         * $public 路由更新时执行对应操作
         * @param route
         * @param router
         * @returns {SYST.Router}
         */
        switcher: function(route, router){
            if(!this._cache || {} === this._cache)  return;
            var routeOption = this._getRouter(route),
                router = router || routeOption.router;
            if(router){
                this._cache[route] = router;
            }
            //获取url参数列表
            this.params = SYST.T.params(null, window.location.href);
            //执行
            this._exec(route);
            return this;
        },
        //渲染前 或 加载模板前
        renderBefore: emptyFunc,
        rendering: emptyFunc,
        rendered: emptyFunc,

        //$public
        getRouter: function(route){
            return this._getRouter(route);
        },
        //$private 根据路由获取当前路由配置对象
        _getRouter: function(route){

            if(!this._cache || this._cache === {})  return;
            var router, routeKey, k, rt;
            for(k in this._cache){
                rt = this._routeToRegExp(k);
                if(rt.test(route)){
                    routeKey = k;
                    router = this._cache[k];
                    break;
                }
            }

            //router = SYST.V.isObject(router) ? router : SYST.V.isFunction(router) ? router.apply(this) : null;
            return {routeKey: routeKey, router: router};

        },

        /**
         * $private 路由到正则
         * @param route
         * @returns {RegExp}
         * @private
         */
        _routeToRegExp: function(route) {
            route = route.replace(escapeRegExp, '\\$&')
                .replace(optionalParam, '(?:$1)?')
                .replace(namedParam, function(match, optional) {
                    return optional ? match : '([^/?]+)';
                })
                .replace(splatParam, '([^?]*?)');
            return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
        },

        /**
         * $private 提取路由中的参数
         * @param route     路由匹配正则
         * @param route     路由配置中的规则字符串
         * @param fragment  当前url上的路由（hash）
         * @private
         */
        _extractParameters: function(route, rawRoute, fragment) {
            var params = route.exec(fragment).slice(1),
                keys = route.exec(rawRoute).slice(1),
                ps = [], rs = {};

            if(SYST.V.isArray(params) && params.length > 0){
                SYST.T.each(params, function(param){
                    ps.push(param ? decodeURIComponent(param) : null);
                });
            }

            if(SYST.V.isArray(keys) && keys.length > 0){
                SYST.T.each(keys, function(key, i){
                    if(key){
                        rs[key.replace(/^[^\w]|[^\w]$/i, '')] = ps[i];
                    }
                });
            }

            return {paramsObject: rs, params: ps};
        },

        /**
         * $private 执行
         * @param route
         */
        _exec: function(route){
            var routeOption = this._getRouter(route),
                router = routeOption.router,
                routeKey = routeOption.routeKey;
            //保存当前路由控制对象
            if(!router) return this;
            this.router = router;
            this.router['route'] = routeKey;

            if(!SYST.V.isRegExp(routeKey))
                route = this._routeToRegExp(routeKey);
            var path = _getRouteKey(uri.hash);
            var parameter = this._extractParameters(route, routeKey, path),
                paramsObject = parameter.paramsObject,
                params = parameter.params;

            //合并参数列表
            this.params = SYST.extend(this.params, paramsObject);
            this.router['params'] = this.params;

            //路由开始状态事件
            this._onReady();
            this._execRouter();

        },
        _execRouter: function(){
            var self = this;

            var router = this.router;
            if(!router) return;
            var container = router['container'] || this.container || 'body';
            if(router['template']){
                this._template(router.template, container, function(htmlStr){

                    self._execMAction(htmlStr);
                    //路由模板渲染完成状态事件
                    self._onRender();
                });
            }else{
                self._execMAction();
            }

        },
        _execMAction: function(tpl){
            //保存当前模板字符串
            this.tpl = tpl;
            this.router['tpl'] = tpl;
            var router  = this.router,
                view    = router['view'],
                action  = router['action'];
            //执行对应的action
            SYST.V.isFunction(router) && router.apply(this);
            //如果action是Object，并且object的action方法存在
            action && SYST.V.isFunction(action) && action.call(this, view, this.params, tpl);

        },

        /**
         * $private 开始监听路由变化
         * @param callback
         * @private
         */
        _changeStart: function(){
            this._changeStop();
            window.addEventListener('hashchange', SYST.T.proxy(this, '_changeHandler'), false);
        },
        _changeStop: function(){
            window.removeEventListener('hashchange', SYST.T.proxy(this, '_changeHandler'), false);
        },
        _changeHandler: function(evt){

            var self = this,
                currentRouter;

            //前后路由数据保存
            if(evt.newURL){
                this.newURL = '#' + evt.newURL.split('#')[1];
            }else{
                this.newURL = '#' + location.hash.split('#')[1];
            }
            //获取当前路由字符串
            var currentURL = _getRouteKey(this.newURL);
            if(currentURL)
                currentRouter = this._getRouter(currentURL);
            //消费当前路由，加载下一个路由
            if(currentRouter && currentRouter.router){
                this._onDestroy(function(){
                    self.router = currentRouter;
                    //开始路由
                    self.switcher(currentURL);
                });
            }
        },

        /**
         * $private 解释html
         * @param html      模板字符串|模板地址
         * @param cid       当前路由容器id
         * @param callback  如果template为地址，则加载完成后的回调
         * @private
         */
        _template: function(html, cid, callback){
            var self = this;
            this.container = SYST.Dom(cid);

            //渲染前执行 renderBefore
            SYST.V.isFunction(self.renderBefore) && self.renderBefore.apply(self);
            //模板是文件 字符串前面加上 load[@|!|#|>]
            var reg = /^(load[\@|\!|\#|\>])+?/gi;
            if(reg.test(html)){
                html = html.replace(reg, '');
                this.container.load(html, function(res){
                    execHtml(res);
                }, function(err){
                    throw new Error('load template is failed!');
                });

            //模板是html字符串
            }else{
                execHtml(html);
            }

            function execHtml(str){
                //渲染完成执行 rendered
                SYST.V.isFunction(self.rendered) && self.rendered.apply(self);
                callback && SYST.V.isFunction(callback) && callback.call(self, str);
            }

        },
        //路由状态相关事件
        //$private 路由开始状态
        _onReady: function(){

            var router = this.router, view;
            if(router && SYST.V.isFunction(router['onReady'])){
                router.onReady.call(this);
            }
            view = router['view'];
            if(view){
                view['router'] = router;
                view.init && view.init(router);
                view.offEvent().onEvent();
            }

        },
        //$private 路由模板渲染完成状态
        _onRender: function(){

            var router  = this.router,
                html    = this.tpl;

            //模板渲染
            if(router.data || (router.isRender || this.isRender)){
                html = SYST.T.render(html, router.data);
            }
            this.container.html(html);
            this.tpl = html;
            this.router['tpl'] = html;

            SYST.V.isFunction(router['onRender']) && router.onRender.call(this, html);

        },
        //$private 路由销毁状态
        _onDestroy: function(cb){
            var currentRouter = this.router,
                view, onDestroy, route, destroyState;

            if(SYST.V.isObject(currentRouter)){
                onDestroy = currentRouter['onDestroy'];
                route = currentRouter['route'];
                destroyState = currentRouter['_destroyState'];
                view = currentRouter['view'];

                if(view){
                    currentRouter['view'] = null;
                    delete currentRouter['view'];
                    view.offEvent();
                }

                if(SYST.V.isFunction(onDestroy)){
                    //根据前端返回的值，决定执行行为
                    var ds = onDestroy.apply(this);
                    if(ds !== false){
                        currentRouter['_destroyState'] = true;
                        SYST.V.isFunction(cb) && cb.apply(this);
                    }else{
                        currentRouter['_destroyState'] = false;
                        this._updateHash(route);
                    }
                }else{
                    SYST.V.isFunction(cb) && cb.apply(this);
                }

            }else{
                SYST.V.isFunction(cb) && cb.apply(this);
            }

        },
        //$private 更新hash值
        _updateHash: function(hash){
            window.location.hash = '#!' + hash.replace(/^#!/i, '');
        }

    };

})(SYST);

