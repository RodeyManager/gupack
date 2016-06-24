/**
 * Created with JetBrains WebStorm.
 * Author: Rodey Luo
 * Date: 15-6-12
 * Time: 下午1:06
 * To change this template use File | Settings | File Templates.
 * 此框架依赖于: jQuery || Zepto || Ender   依赖于模板插件: Arttemplate || Underscore
 * 使用前请先引入依赖插件
 *
 * requireJS 引入:
 *                  'SYST' : {
                        deps : ['jQuery || Zepto || Ender'],
                        exports: 'SYST'
                    }
 */

;(function(root){

    'use strict';

    var SYST = {}; //function(){};
    //框架属性
    SYST.VERSION = '2.0.47';
    SYST.AUTHOR = 'Rodey Luo';
    //判断是否有jquery，zepto插件
    try{
        SYST.$ = root.jQuery || root.Zepto || undefined;
    }catch(e){
        throw new Error('$不存在，请先引入jQuery|Zepto插件，依赖其中一个' + e);
    }

    var _clone = function(targetObject){
        var target = targetObject, out = {}, proto;
        for(proto in target)
            if(target.hasOwnProperty(proto))
                out[proto] = target[proto];
        return out;
    };

    /**
     * 继承函数
     * @param parent 父对象
     * @param child  子对象
     * @return {*}
     * @private
     */
    var _extend = function(parent, child){
        if(!parent) return child;
        if(!child) return parent;
        var clone = _clone(parent);
        for(var prop in child)
            //if(child.hasOwnProperty(prop))
                clone[prop] = child[prop];
        return clone;
    };

    /**
     * 生成或者是继承类对象
     * @param args
     * @param className
     * @returns {*}
     * @private
     */
    var _extendClass = function(args, className){
        var args = Array.prototype.slice.call(args),
            firstArgument = args[0], i = 0, mg = {}, len;
        var hasProto = '__proto__' in mg;
        if(SYST.V.isObject(firstArgument)){
            //if firstArgument is SYST's Object
            if('__instance_SYST__' in firstArgument){
                //实现继承
                args.shift();
                for(len = args.length; i < len; ++i){
                    mg = _extend(mg, args[i]);
                }
                if(!hasProto)
                    mg = _extend(mg, firstArgument);
                else
                    mg.__proto__ = firstArgument;
                return mg;
            }else{
                //直接创建对象
                for(len = args.length; i < len; ++i){
                    mg = _extend(mg, args[i]);
                }
                if(!hasProto)
                    mg = _extend(mg, className.prototype);
                else
                    mg.__proto__ = new className();
                return mg;
            }
        }else{
            //直接创建原始对象
            if(!hasProto)
                mg = new className();
            else
                mg.__proto__ = new className();
            return mg;
        }
    };

    SYST.extend = _extend;
    SYST.extendClass = _extendClass;
    SYST.clone = _clone;

    //Object.keys
    (!'keys' in Object) && (Object.keys = function(o){
        if(o !== Object(o))
            throw new TypeError('Object.keys called on a non-object');
        var k = [], p;
        for(p in o) if(Object.prototype.hasOwnProperty.call(o, p)) k.push(p);
        return k;
    });

    if( typeof module === 'object' && typeof module.exports === 'object' ){
        module.exports = SYST;
    }else{
        root.SYST = SYST;
    }

    return SYST;

}).call(this, window);
/**
 * Created by Rodey on 2015/10/16.
 *
 * Module web通用验证数据对象
 * @type {Function}
 */

;(function(SYST){

    'use strict';

    var toString = Object.prototype.toString;

    var Validate = function(){
        this.__instance_SYST__ = 'SYST Validate';
        this.__Name__ = 'Validate';
    };
    SYST.Validate = function(){
        return SYST.extendClass(arguments, Validate);
    };
    SYST.V = Validate.prototype = {
        //为空时
        isEmpty     : function(val){        return (!val || val.length === 0 || val == null) ? true : false; },
        //是否含有中文 （flag存在则完全匹配中文，默认不完全匹配）
        isCN        : function(str, flag){
            if(flag)                        return (/^[\u4e00-\u9fa5]+$/.test(str));
            else                            return (/[\u4e00-\u9fa5]+/gi.test(str));
        },
        //验证 E-mail 地址
        isEmail     : function(email){      return /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/gi.test(email); },
        //验证 URL 地址
        isURL       : function(url){        return /^http:\/\/[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"\"])*$/i.test(url); },
        //验证电话号码
        isTel       : function(tel){        return /^(\(\d{3,4}\)|\d{3,4}-)?\d{7,8}$/gi.test(tel); },
        //验证手机号码
        isMobile    : function(mobile){     return /^1[3|4|5|7|8]{1}\d{9}$/.test(mobile); },
        //邮编
        isZip       : function(zipCode){    return /^\d{6}$/.test(zipCode); },
        //验证日期, 日期时间, 时间
        isDateLocal : function(date){       return /^(\d{4})-(\d{1,2})-(\d{1,2})$/.test(date); },
        isDateTime  : function(dateTime){   return /^(\d{4})-(\d{1,2})-(\d{1,2})\s+(\d{1,2}):(\d{1,2}):(\d{1,2})$/.test(dateTime); },
        isTime      : function(time){       return /^(\d{1,2}):(\d{1,2}):(\d{1,2})$/.test(time); },
        //常用对象判断
        isNull      : function(value){      return value == null; },
        isString    : function(value){      return typeof value === 'string'; },
        isNumber    : function(value){      return typeof value === 'number'; },
        isArray     : function(value){      return toString.call(value) === '[object Array]'; },
        isDate      : function(value){      return toString.call(value) === '[object Date]'; },
        isObject    : function(value){      return toString.call(value) === '[object Object]'; },
        isFunction  : function(value){      return typeof value === 'function'; },
        isFile      : function(value){      return toString.call(value) === '[object File]'; },
        isBlob      : function(value){      return toString.call(value) === '[object Blob]'; },
        isBoolean   : function(value){      return typeof value === 'boolean'; },
        isdefined   : function(value){      return typeof value !== 'undefined';},
        isRegExp    : function(value){      return toString.call(value) === '[object RegExp]'; },
        isWindow    : function(value){      return value && value.document && value.location && value.alert && value.setInterval; },
        isElement   : function(value){      return !!(value && (value.nodeName || (value.prop && value.attr && value.find))); }

    };


})(SYST);
/**
 * Created by Rodey on 2015/10/16.
 */

;(function(SYST){

    'use strict';

    //需要转移的字符
    var escapeMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '`': '&#x60;'
    };

    /**
     * Module web通用公共函数对象
     * @type {Function}
     */
    var Tools = function(){
        this.__instance_SYST__ = 'SYST Tools';
        this.__Name__ = 'Tools';
    };
    SYST.Tools = function(){
        return SYST.extendClass(arguments, Tools);
    };
    SYST.T = Tools.prototype = {
        /**
         * Function 触发事件
         * @param  {[type]}   element  [触发对象]
         * @param  {[type]}   event    [事件名称]
         * @param  {[type]}   data     [参数]
         * @param  {Function} callback [回调]
         * @return {[type]}            [undefined]
         * use:
         * $(document.body).bind('click', function(){});
         * SYST.T.trigger($(document.body)[0], 'onclick', 'hello', function(evt, data){
         *     console.log(this); //output:     <body>...</body。
         *     console.log(data); //output；    'hello'
         * });
         */
        trigger: function(element, event, data, callback){
            var handler;
            if(element && event && '' !== event){
                event = event.search(/^(on)/i) !== -1 ? event : 'on' + event;
                handler = function(evt){
                    SYST.V.isFunction(callback) && callback.call(element, evt, data);
                };
                try{
                    element[event] = handler;
                }catch(e){
                    throw new Error(element + '不存在' + event + '方法 <::>');
                }
            }
        },
        /**
         * 事件侦听传递处理回调
         * @param obj       作用域目标对象
         * @param func      obj对象中的属性
         * @returns {Function}
         */
        hoadEvent: function(obj, func){
            var args = [];
            obj = obj || window;
            for(var i = 2; i < arguments.length; i++) args.push(arguments[i]);
            return function(e){
                if(e && typeof e === 'object'){
                    e.preventDefault();
                    e.stopPropagation();
                }
                args.push(e);
                //保证传递 Event对象过去
                if(obj[func])
                    obj[func].call(obj, e, args);
                else
                    throw new Error(func + ' 函数未定义！');
            }
        },
        /**
         * Function 去除两边空白
         * @param val
         * @return {*|void}
         */
        trim: function(val){
            return SYST.V.isString(val) ? val.replace(/^\s*|\s*$/gi, '') : '';
        },
        /**
         * Function 去除字符串首尾指定的字符
         * @param val       : 将要进行替换的字符串
         * @param commer    : 指定要替换的字符串
         * @param flag      : true: 全局替换；false: 只替换首尾
         * @return          : 返回替换后的字符串
         */
        rtrim:function(val, commer, flag){
            if(!SYST.V.isString(val)) return '';
            if(commer){
                var re;
                if(!flag)
                    re = new RegExp('^(\\' + commer +')*|(\\'+ commer + ')*$', 'gi');
                else
                    re = new RegExp('\\' + commer + '*', 'gi');
                return val.replace(re, '');
            }else{
                return this.trim(val);
            }
        },
        /**
         * Function 判断数组是否存在某元素  存在： 返回该元素索引； 不存在： 返回 -1
         * @param array
         * @param obj
         * @return {*}
         */
        indexOf: function(array, obj) {
            if (array.indexOf) return array.indexOf(obj);
            for (var i = 0; i < array.length; i++) {
                if (obj === array[i]) return i;
            }
            return -1;
        },
        /**
         * 从数组中删除指定的元素, 返回被指定的元素（ 执行后原数值array将移除指定的元素 ）
         * @param array
         * @param val
         * @return {*}
         */
        arrRemove: function(array, val){
            var index = this.indexOf(array, val);
            if (index >=0)
                array.splice(index, 1);
            return array;
        },
        //首字符大写
        toFirstUpperCase: function(str){
            return str.replace(/^(\w)?/i, function(match, $1){ return $1.toUpperCase(); });
        },
        /**
         * Function 全角字符转为半角,并去除所有空格
         * @param str
         * @return {String}
         * @constructor
         */
        F2C: function(str){
            var s = "", str = str.replace(/\s*/gi, '');
            for(var i = 0; i < str.length; i++){
                var c = str.charCodeAt(i);
                if(c == 12288){
                    s += String.fromCharCode(32);
                    continue;
                }
                if(c > 65280 && c < 65375){
                    s += String.fromCharCode(c - 65248);
                    continue;
                }
                s += String.fromCharCode(c);
            }
            s = s.replace(/\s*/gi, '');
            return s.toUpperCase();
        },
        /**
         * 转移html字符
         * @param html
         * @returns {string}
         */
        escapeHtml: function(html){
            return html.replace(/&(?![\w#]+;)|[<>"']/gi, function($1){
                return escapeMap[$1];
            });
        },
        /**
         * Function 格式化小于10的值
         * @param n
         * @return {String}
         */
        dateFm: function(n){ return (n < 10) ? '0'+n : n; },
        /**
         * Function 将指定时间戳转为： yyyy-mm-dd hh:ii:ss
         * @param timestamp
         * @return {String}
         */
        setDateFormat: function(timestamp, format, prefix){
            if(!timestamp) return '';
            var self = this;
            var date = new Date(parseInt(timestamp, 10)), ds = [], ts = [];
            if(!format)
                return date.getFullYear() +'-'+ this.dateFm(date.getMonth() + 1) +'-'+ this.dateFm(date.getDate()) + ' ' + this.dateFm(date.getHours()) + ':' + this.dateFm(date.getMinutes()) + ':' + this.dateFm(date.getSeconds());
            var cs = format.match(/[^\w\d\s]+?/i), c1 = cs[0] || '-', c2 = cs[1] || ':';

            var year = format.split(c1)[0];
            if(year.length <= 2){
                year = ('' + date.getFullYear()).substr(2);
            }else{
                year = date.getFullYear();
            }
            push(year, ds);

            if(/m+?/i.test(format))     push(date.getMonth() + 1, ds);
            if(/d+?/i.test(format))     push(date.getDate(), ds);
            if(/h+?/i.test(format))     push(date.getHours(), ts);
            if(/i+?/i.test(format))     push(date.getMinutes(), ts);
            if(/s+?/i.test(format))     push(date.getSeconds(), ts);
            function push(value, toAr){
                toAr.push(prefix ? self.dateFm(value) : value);
            }
            return SYST.T.trim(ds.join(c1) + (ts.length > 0 ? ' ' + ts.join(c2) : ''));
        },

        /**
         * 将时间转为中文格式时间
         * @param timestamp 时间戳 或 时间字符串，如：1462327561371 或 '2016/5/4 10:03:20'
         * @param format 格式 YY-m-d
         * @param prefix 是否补0
         * @returns {string}
         */
        setDateFormatCN: function(timestamp, format, prefix){
            var cdate   = /[-:\/\|_\.]/gi.test(timestamp)
                            ? timestamp : this.setDateFormat(timestamp, format, prefix),
                cds     = cdate.split(' '),
                date    = cds[0],
                time    = cds[1],
                cnDates = ['年', '月', '日', '时', '分', '秒'],
                index   = 0;

            date = replaceDate(date, /[-\/\|_\.]/gi) + cnDates[2];
            index++;
            time = replaceDate(time, /:/gi) + cnDates[5];

            function replaceDate(str, reg){
                return str.replace(reg, function(){
                    return cnDates[index++];
                });
            }

            return date + ' ' + time;

        },

        /**
         * 计算时间差，包括 天、时分秒
         * @param d1    开始时间  yyyy-mm-dd h:i:s | Date
         * @param d2    结束时间
         * @returns {{days: (*|Number)}}
         */
        getDateDiff: function(d1, d2){
            var diff = Date.parse(d2) - Date.parse(d1),
                days = Math.floor(diff / (24 * 3600 * 1000)),
                le1 = diff % (24 * 3600 * 1000),
                hours = Math.floor(le1 / (3600 * 1000)),
                le2 = le1 % (3600 * 1000),
                minutes = Math.floor(le2 / (60 * 1000)),
                le3 = le2 % (60 * 1000),
                seconds = Math.round(le3 / 1000);
            return {
                days: days,
                hours: hours,
                minutes: minutes,
                seconds: seconds
            };
        },

        /**
         * Function 获取随机字符（包括数字和字母）
         * @param len:  字符长度
         * @param flag: 是否去除干扰
         * @return {String}
         */
        randomChar: function(size, flag){
            var start = 48,     end = 122,
                i = 0,          len = size,
                random,         rs = '',
                flag = true,
                //特殊字符
                filter = [58, 59, 60, 61, 62, 63, 64, 91, 92, 93, 94, 95, 96],
                //去除扰乱视线 I L l o O
                f2 = [48, 49, 73, 76, 79, 108, 111];

            for( ; i < len; ++i ){
                random = Math.floor(Math.random() * start + Math.random() * end);
                if(random >= start && random <= end && filter.indexOf(random) === -1){
                    if(flag === true)   (f2.indexOf(random) === -1) ? rs += String.fromCharCode(10, random) : len++;
                    else                rs += String.fromCharCode(10, random);
                }else{
                    len++;
                }
            }
            return rs.replace(/[\n\t\r]*/gi, '');
        },
        /**
         * Function 获取指定参数或者所有参数列表
         * @param name
         * @returns {Object|String}
         */
        params: function(name, url){
            var grap = '?';
            if(this._pars && this._pars[name])
                return this._pars[name];
            //var search = (url ? url.split('?')[1] : location.search || location.href.split('?')[1]).replace(/^\?/, '');
            var search = '';
            if(!SYST.V.isEmpty(url)){
                if(/\?+/i.test(url))
                    search = url.split(grap)[1] || '';
                else
                    search = url;
            }else{
                search = location.href.split(grap)[1];
            }
            if(SYST.V.isEmpty(search)) return {};
            var mas = search.replace(/^\?/, '').split('&');
            if(!mas || [] === mas) return {};
            var i = 0, len = mas.length, ps = {};
            for( ; i < len; ++i ){
                //a=b | a=
                var ma = mas[i].split('=');
                if(!ma[0] || '' === ma[0])  continue;
                ps[ma[0]] = decodeURI(ma[1]) || null;
            }
            this._pars = ps;
            return (!name ? ps : decodeURI(ps[name]));

        },
        /**
         * 获取get模式下url中的指定参数值
         * @param name      参数名
         * @param url       传入的url地址
         * @returns {*}
         */
        getParams: function(name, url) {
            var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i'), search = '';
            //var search = (url && url.split('?')[1] || window.location.search.substr(1)).match(reg);
            if(!SYST.V.isEmpty(url)){
                search = (url.split('?')[1] || '').match(reg);
            }else{
                search = window.location.search.substr(1).match(reg);
            }
            if(search) {
                return decodeURI(search[2]);
            }
            return null;
        },
        /**
         * 格式化参数 flag: 表示前面是否加上‘?’返回，true: 加上；false: 不加(默认)
         * @param object
         * @param flag
         * @returns {*}
         */
        paramData: function(object, flag){
            if(SYST.V.isEmpty(object) || !SYST.V.isObject(object))  return '';
            var data = object, s = '';
            for(var k in data)  (s += '&' + k + '=' + encodeURI(data[k]));
            s = s.substr(1);
            return (flag === true) ? '?'+ s : s;
        },
        serialize: function(object, flag){ return this.paramData(object, flag); },
        unserialize: function(str){ return this.params(null, str); },
        /**
         * 跳转
         * @param url       地址
         * @param params    参数 [object|string]
         */
        jumpTo: function(url, params){
            var url = url || '#';
            if(SYST.V.isString(params))
                url = url + '?' + params;
            else if(SYST.V.isObject(params))
                url = url + SYST.T.paramData(params, true);
            location.href = url;
        },
        redirect: function(url, params){ this.jumpTo(url, params); },

        /**
         * 组装字符串
         * @param str
         * @returns {*}
         * use: displace('my name is \s, age is \d', 'rodey', 26);
         */
        displace: function(str){
            if(!str) return;
            var index = 0, args = [],
                regx = /\%[s|d|f]?/gi;
            for(var i = 1, len = arguments.length; i < len; ++i)
                args.push(arguments[i]);
            var string = str.replace(regx, function(match){
                return args[index++];
            });
            return string;
        },

        /**
         * Function 浏览器 cookie操作
         * @param key       键名
         * @param value     键值
         * @param options   附件选项
         * @returns {*}
         * @constructor
         */
        Cookie: function(key, value, options) {
            if(arguments.length > 1 && (!/Object/.test(Object.prototype.toString.call(value)) || value === null || value === undefined)) {
                options = options || {};

                if(value === null || value === undefined) {
                    options.expires = -1;
                }

                if( typeof options.expires === 'number') {
                    var days = options.expires, t = options.expires = new Date();
                    t.setDate(t.getDate() + days);
                }

                value = String(value);
                return (document.cookie = [encodeURIComponent(key), '=', options.raw ? value : encodeURIComponent(value), options.expires ? '; expires=' + options.expires.toUTCString() : '', options.path ? '; path=' + options.path : '', options.domain ? '; domain=' + options.domain : '', options.secure ? '; secure' : ''].join(''));
            }
            options = value || {};
            var decode = options.raw ? function(s) {
                return s;
            } : decodeURIComponent;
            var pairs = document.cookie.split('; ');
            for(var i = 0, pair; pair = pairs[i] && pairs[i].split('='); i++) {
                if(decode(pair[0]) === key)
                    return decode(pair[1] || '');
            }
            return null;
        },
        _Cookies: function(keys, options){
            var self = this;
            if(!keys) return;
            if(SYST.V.isObject(keys)){
                SYST.T.each(Object.keys(keys), function(key){
                    self.Cookie(key, keys[key], options);
                });
            }
            else if(SYST.V.isArray(keys)){
                var rs = {}, name;
                for(var i = 0, len = keys.length; i < len; ++i){
                    name = keys[i];
                    rs[name] = self.getCookie(name);
                }
                return rs;
            }
        },
        getCookie: function(key){
            return SYST.V.isString(key)
                ? this.Cookie(key)
                : this._Cookies(key);
        },
        setCookie: function(key, value, options){
            return SYST.V.isString(key)
                ? this.Cookie(key, value, options)
                : this._Cookies(key, options);
        },

        /**
         * 遍历对象
         * @param object
         * @param callback
         */
        each: function(object, callback, target){
            if(SYST.V.isObject(object)){
                var index = 0;
                for(var k in object){
                    if(object.hasOwnProperty(k)){
                        callback.call(target || object, object[k], index++, k);
                    }
                }
            }
            else if(SYST.V.isArray(object)){
                var i = 0, len = object.length;
                for(; i < len; ++i){
                    callback.call(target || object, object[i], i);
                }
            }
            else{
                throw new SyntaxError('args1 is must Object or Array');
            }
        }
    };

})(SYST);

/**
 * Created by Rodey on 2015/12/8.
 */

;(function(SYST){

    'use strict';

    var PENDING = 1,
        FULFILLED = 2,
        REJECTED = 3;

    var Promise = SYST.Promise = function(fulfil, reject){
        //保存当前状态----
        //pending: 初始状态, 非 fulfilled 或 rejected.
        //fulfilled: 成功的操作.
        //rejected: 失败的操作.
        this.STATE = PENDING;
        //保存所有fulfil对象
        this._fulfils = [];
        //保存所有rejected对象
        this._rejecteds = [];
        //回调参数集合
        this.args = [];
        this.errs = [];
        //当前数据
        this.data = null;
        //是否串行
        this._bunchFulfil = false;
        this._bunchReject = false;

        //加入到执行队列
        this.then(fulfil, reject);

    };

    SYST.Promise.prototype = {

        /**
         * 加入除pending状态的回调 加入到执行队列中
         * @param fulfil    fulfilled状态的回调函数
         * @param reject    rejected状态的回调函数
         * @returns {SYST.Promise}
         */
        then: function(fulfil, reject){
            //this.STATE = 'pending';
            if(this.STATE === PENDING){
                SYST.V.isFunction(fulfil) && this._fulfils.push(fulfil);
                SYST.V.isFunction(reject) && this._rejecteds.push(reject);
            }
            else if(this.STATE === FULFILLED){
                this.resolve();
            }
            else if(this.STATE === REJECTED){
                this.reject();
            }
            return this;
        },

        /**
         * 将 fulfilled状态的回调 加入到执行队列中
         * @param fulfil
         * @returns {*}
         */
        done: function(fulfil){
            return this.then(fulfil);
        },
        success: function(fulfil){
            return this.then(fulfil);
        },

        //将 rejected状态的回调 加入到执行队列中
        catch: function(reject){
            return this.then(null, reject);
        },
        error: function(reject){
            return this.then(null, reject);
        },

        /**
         * 执行当前队列中为 fulfilled状态的回调
         * @param value
         * @param bunch
         */
        resolve: function(value, bunch){
            this.STATE = FULFILLED;
            if(value){
                this.data = value;
                this.args.push(value);
            }
            this._bunchFulfil = bunch !== false ? this._bunchFulfil : bunch;
            //从多列中取出当前为 FULFILLED状态的回调
            var fulfil = this._fulfils.shift();
            if(fulfil && typeof fulfil === 'function'){
                //如果是指定为 bunch（串行）,使用all调用的
                if(this._bunchFulfil){
                    this._fulfils.push(fulfil);
                }else{
                    this._bunchFulfil = false;
                    fulfil.call(this, value, this.args);
                }
            }else{
                throw new TypeError('no found a function object to [then|all|done|success]');
            }

        },

        /**
         * 执行当前队列中的 rejected状态的回调
         * @param err
         * @param bunch
         */
        reject: function(err, bunch){
            this.STATE = REJECTED;
            err && this.errs.push(err);
            this._bunchReject = bunch !== false ? this._bunchReject : bunch;
            //从多列中取出当前为 REJECTED状态的回调
            var reject = this._rejecteds.shift();
            if(reject && typeof reject === 'function'){
                //如果是指定为 bunch（串行）,使用all调用的
                if(this._bunchReject){
                    this._rejecteds.push(reject);
                }else{
                    this._bunchReject = false;
                    reject.apply(this, this.errs);
                }
            }else{
                throw new TypeError('no found a function object to [then|catch|error]');
            }
        },

        /**
         * 串行，依次执行队列中的函数，用一个统一的回调进行处理
         * 回调中的参数依据队列进行排列
         * 注意：在最后一个调用resolve之前，必须对bunch进行确认 promise.resolve(value, bunch=true)
         * @param iterable 数组  执行队列
         * @returns {SYST.Promise}
         * exp:  promise.all([func1, func2, func3]).done(function(v1, v2, v3){ }).cache(function(e1, e2, e3){ });
         */
        all: function(iterable){
            if(!SYST.V.isArray(iterable)){
                throw new TypeError('args me be a array, queue element is be function');
            }

            this._bunchFulfil = true;
            this._bunchReject = true;
            SYST.T.each(iterable, function(item){
                SYST.V.isFunction(item) && item();
            });

            return this;
        }

    };

    SYST.P = SYST.Promise = Promise;

})(SYST);

/**
 * Created by Rodey on 2016/4/15.
 * Http 相关
 */


;(function(SYST){

    'use strict';

    var _$ = SYST.$;
    if(!_$){
        throw new Error('doRequest: $不存在，此方法依赖于(jQuery||Zepto||Ender)');
    }

    SYST.httpConfig = {};
    var Http = function(){
        this.__instance_SYST__ = 'SYST Http';
        this.__name__ = 'SYST Http';
    };
    SYST.Http = function(){
        return SYST.extendClass(arguments, Http);
    };

    //SYST.Http.prototype = {
    Http.prototype = {

        load: function(dom, url, data, callback){
            _$(dom).load(url, data, callback);
        },
        ajax: _$.ajax,
        get: _$.get,
        getJSON: _$.getJSON,
        getScript: _$.getScript,
        post: _$.post,

        /**
         * Function 通用AJAX请求方法
         * @param url
         * @param postData
         * @param su
         * @param fail
         */
        doRequest: function(url, postData, su, fail, options){
            var self = this, type, dataType, commonData, commonHandler, setting = {}, callTarget;
            if(!postData || typeof postData !== 'object' || !url || url == '') return;
            //记录当前ajax请求个数
            self._ajaxCount = 0;
            this.ajaxUrl = url;
            dataType = self.ajaxDataType || SYST.httpConfig['ajaxDataType'] || 'json';

            var ajaxBefore      = self.ajaxBefore   || SYST.httpConfig.ajaxBefore,
                ajaxSuccess     = self.ajaxSuccess  || SYST.httpConfig.ajaxSuccess,
                ajaxError       = self.ajaxError    || SYST.httpConfig.ajaxError,
                ajaxComplete    = self.ajaxComplete || SYST.httpConfig.ajaxComplete,
                ajaxEnd         = self.ajaxEnd      || SYST.httpConfig.ajaxEnd;

            if(SYST.V.isObject(options)){
                type = options.type || self.ajaxType || SYST.httpConfig['ajaxType'] || 'POST';
                dataType = options.dataType || self.ajaxDataType || SYST.httpConfig['ajaxDataType'] || 'json';
                commonData = options.commonData || self.commonData || SYST.httpConfig['commonData'] || {};
                commonHandler = options.commonHandler;
                setting = options;
                callTarget = options['callTarget'] || self;
            }
            //提交前触犯
            if(before() === false) return;

            var ajaxSetting = SYST.extend(setting, {
                url: url,
                type: type,
                data: SYST.extend(postData, commonData),
                dataType: dataType,
                success: function(res, data, status, xhr){
                    //console.log('请求成功', res);
                    end(res, data, status, xhr);
                    //如果ajaxSuccess返回false 则将阻止之后的代码运行
                    var rs = success(res, data, status, xhr);
                    rs !== false && SYST.V.isFunction(su) && su.call(callTarget, res, data, status, xhr);
                },
                error: function(xhr, errType){
                    //console.log('请求失败');
                    var response = xhr.response;
                    try{
                        response = JSON.parse(response);
                    }catch(e){
                    }
                    end(response, xhr, errType);
                    //如果ajaxError返回false 则将阻止之后的代码运行
                    var rs = error(response, xhr, errType);
                    rs !== false && SYST.V.isFunction(fail) && fail.call(callTarget, response, xhr, errType);
                },
                complete: function(res, data, status, xhr){
                    //console.log('请求完成');
                    complate(res, data, status, xhr);
                }
            });

            function before(){
                SYST.V.isFunction(ajaxBefore) && (setting['beforeSend'] = ajaxBefore.apply(callTarget));
                if(setting['beforeSend'] === false) return false;
            }

            function success(res, data, status, xhr){
                var su;
                SYST.V.isFunction(ajaxSuccess) && (su = ajaxSuccess.call(callTarget, res, data, status, xhr));
                return su;
            }

            function error(res, xhr, errType){
                var err;
                SYST.V.isFunction(ajaxError) && (err = ajaxError.call(callTarget, res, xhr, errType));
                return err;
            }

            function complate(res, data, status, xhr){
                var complete;
                SYST.V.isFunction(ajaxComplete) && (complete = ajaxComplete.call(callTarget, res, data, status, xhr));
                return complete;
            }

            function end(res, data, status, xhr){
                SYST.V.isFunction(commonHandler) && commonHandler();
                var end;
                SYST.V.isFunction(ajaxEnd) && (end = ajaxEnd.call(callTarget, res, data, status, xhr));
                return end;
            }

            _$.ajax(ajaxSetting);
            self._ajaxCount++;
        },
        /**
         * Function doRequest 包装
         * @param url
         * @param postData
         * @param su
         * @param fail
         */
        doAjax: function(url, postData, su, fail, options){
            this.doRequest(url, postData, su, fail, options);
        },

        /**
         * HTML5 fetch api
         */
        fetch: (function(){
            //throw new ReferenceError('fetch api is not support!');
            return function(url, init, type){
                init = init || {};
                var headers = init['headers'] || {},
                    method = (init['method'] || 'post').toUpperCase(),
                    body = init['body'];
                if(!'fetch' in window){
                    var p = new SYST.Promise();
                    var setting = $.extend(init, {
                        url: url,
                        data: body,
                        type: method,
                        dataType: type,
                        success: function(res){ p.resolve(res); },
                        error: function(err){   p.reject(err);  }
                    });
                    _$.ajax(setting);
                    return p;
                }else{
                    if(method == 'GET' || method == 'HEAD'){
                        if(SYST.V.isObject(body))
                            url += SYST.T.paramData(body, true);
                        else if(SYST.V.isString(body))
                            url += '?' + body;
                        init['body'] = null;
                        delete init['body'];
                    }else{
                        SYST.V.isObject(body) && (init['body'] = JSON.stringify(body));
                    }
                    return window['fetch'](url, init).then(function(res){
                        return (SYST.V.isFunction(res[type]) && res[type]());
                    });
                }
            };
        })(),

        /**
         * HTML5 WebSockets Object
         * @param uri
         * @param options
         * @returns {WebSocket}
         */
        socket: function(uri, options){
            if(!'WebSocket' in window)
                throw new ReferenceError('WebSocket api is not support!');
            return new WebSocket(uri, options);
        }

    }


})(SYST);

/**
 * Created by Rodey on 2015/10/16.
 */

;(function(SYST){

    'use strict';

    /**
     * SYST Template Render mini engine
     * @type {{open: string, close: string}}
     */
    SYST.tplConfig = { open: '<%', close: '%>'};
    var lineFeedRegx = /\\|\'|\r|\n|\u2028|\u2029/g,
        body = '([\\s\\S]+?)',
        empty = /^=+\s*|\s*$/gi,
        lg = SYST.tplConfig.open,
        rg = SYST.tplConfig.close,
        regxs,
        macs;

    var _content,
        _tplCache = {};

    //模板字符串中需要替换的特殊字符
    var escapes = {
        "'": "'",
        '\\': '\\',
        '\r': 'r',
        '\n': 'n',
        '\u2028': 'u2028',
        '\u2029': 'u2029'
    };

    //替换特殊字符
    var escapeSpecial = function(match) {
        return '\\' + escapes[match];
    };

    //将匹配正则对象转换为数据正则字符串
    var fromatRegx = function (rgs){
        var rs = [];
        for(var k in rgs){
            rs.push(rgs[k].source);
        }
        return rs.join('|').replace(/|$/i, '');
    };

    var _reset = function(options){
        options = options || SYST.tplConfig;
        lg = options['open'] || SYST.tplConfig.open;
        rg = options['close'] || SYST.tplConfig.close;
        //匹配正则
        regxs = {
            execter:  new RegExp(lg + body + rg, 'g'),
            exporter: new RegExp(lg + '\\s*=' + body + rg, 'g'),
            escaper: new RegExp(lg + '\\s*==' + body + rg, 'g')
        };
        //定义模板全局匹配正则对象
        macs = new RegExp(fromatRegx(regxs), 'g');
    };

    var _includeReg = /^include\(\s*([^,]+?)\s*,\s*([^,]+?)\s*\)/i;

    /**
     * 渲染模板并输出结果
     * @param tplContent    模板字符串
     * @param data          模板数据变量
     * @param data          自定义方法，可选类型为：Object中带有多个方法； function；function的toString后结果
     * @returns {string}    渲染后的字符串
     * @private
     */
    var _template = function(tplContent, data, helper, target){

        var $source = [],
            $text = [],
            $tplString = 'var _s=""; with($d || {}){ ',
            helperStr = '',
            index = 0,
            data = data;

        //判断helper是否存在
        if(helper){
            if(SYST.V.isObject(helper)){
                for(var k in helper){
                    helperStr += helper[k].toString() + ';';
                }
            }
            else if(SYST.V.isFunction(helper)){
                helperStr += helper.toString() + ';';
            }
            else if(SYST.V.isString(helper) && /function\(\)/gi.test(helper)){
                helperStr += helper.replace(/;$/i, '') + ';';
            }else{
                throw new EvalError('helper can be function');
            }

            $tplString = helperStr + $tplString;
        }

        /**
         * 将SYST.T.each方法置入Function字符串中
         * use:
         *  <% each(object|array, function(item, index, [key: options]) %>
         *      <%= item %>
         *  <% }); %>
         */
        $tplString = 'var each = SYST.T.each;' + $tplString;

        /**
         * 采用替换查找方式
         * @params $1: match
         * @params $2: escape
         * @params $5: offset
         */
        tplContent = [lg, 'if(true){', rg, tplContent, lg, '}', rg].join('');
        tplContent.replace(macs, function($1, $2, $3, $4, $5){

            var text = tplContent.slice(index, $5).replace(lineFeedRegx, escapeSpecial);
            if(text && '' != text){
                text = "_s+='" + (text) + "';";
            }else{
                text = '';
            }
            index = $5 + $1.length;
            $text.push(text);
            $source.push(SYST.T.trim($2));

            return $1;
        });

        //如果没有匹配到任何模板语句的话直接返回
        if($source.length === 0){
            return tplContent;
        }

        //console.log($source, $text);
        //生成 Function 主体字符串
        var source, text;
        for(var i = 0, len = $source.length; i < len; ++i){
            //SYST.T.each($source, function(source, i){
            source = $source[i];
            text = $text[i + 1];
            //转移处理
            if(source.search(/^\s*={2}/) !== -1){
                source = source.replace(empty, "");
                source = 'if(!!'+ source +'){ _s+=(SYST.T.escapeHtml('+ source +')); }else{ _s+=""; }';
            }
            else if(/^=[^=]+?/i.test(source)){
                source = source.replace(empty, "");
                source = 'if(!!'+ source +'){ _s+=('+ source +');}else{_s+="";}';
            }
            //include file
            else if(_includeReg.test(source)){
                var stiv;
                source.replace(_includeReg, function(match, src, selector){
                    //console.log(match, src, dom, time);
                    if(src && '' !== src){
                        stiv = setInterval(function(){
                            if(SYST.$(selector)[0]){
                                clearInterval(stiv);
                                SYST.$(selector).load(src);
                            }
                        }, 1000 / 60);
                    }
                });
                source = '';
            }
            $tplString += (source || '') + (text || '');
            //});
        }

        //遍历数据
        $tplString = ''+ $tplString +' }; return _s;';
        //console.log($tplString);
        //创建function对象
        Render = new Function('$d', $tplString);
        _tplCache[_content] = Render;
        //执行渲染方法
        return Render.call(target || this, data);
    };

    /**
     * 提供外部接口
     * @param content   元素id或者是模板字符串
     * @param data      渲染需要的数据
     * @param helper    自定义方法，可选类型为：Object中带有多个方法； function；function的toString后结果
     * @param options   可选项，如设置 模板开关标签样式
     * @param target    作用于模板对象
     * @returns {*}
     * @constructor
     */
    var Render = function(content, data, helper, options, target){

        if(!content){
            throw new SyntaxError('no found template content');
        }

        var element, tplContent = '', id, render;
        _content = content;
        if(_tplCache[_content]){
            render =  _tplCache[_content];
            //执行渲染方法
            return render.call(target || this, data);
        }
        //重置配置
        _reset(options);

        //如果直接是模板字符串
        if(content.search(/[<|>|\/]/i) !== -1){
            tplContent = SYST.T.trim(content);
        }
        //content为element id
        else{

            if(SYST.V.isString(content)){
                id = content.replace(/^#/i, '');
                element = document.getElementById(id);
            }
            else if(SYST.V.isElement(content)){
                element = content;
            }
            //element = document.getElementById('#' + content.replace(/^#/i, ''));
            if(element){
                var tplStr = /^(TEXTEREA|INPUT)$/i.test(element.nodeName) ? element.value : element.innerHTML;
                tplContent = SYST.T.trim(tplStr);
            }
        }

        return _template(tplContent, data, helper, target);

    };

    SYST.Render = Render;
    SYST.T.render = Render;

})(SYST);
/**
 * Created by Rodey on 2015/10/16.
 */

;(function(SYST){

    'use strict';

    var _hoadEvent = SYST.T.hoadEvent;

    function _listener(obj, pobj, evt, func, type, trigger){
        if(!evt) throw new ReferenceError('没有添加事件名称');
        var type = type || 'on';
        if(!obj) obj = window;

        //对象事件侦听
        if(_isWindow(obj.selector)){
            (type == 'on')
                ? $(window).off().on(evt, _hoadEvent(pobj, func))
                : $(window).off(evt, _hoadEvent(pobj, func));
        }else if(_isBuilt(obj.selector)){
            (type == 'on')
                ? $(obj.selector).off().on(evt, _hoadEvent(pobj, func))
                : $(obj.selector).off(evt, _hoadEvent(pobj, func));
        }else{
            (type == 'on')
                ? $(trigger || 'body').undelegate(obj.selector, evt, _hoadEvent(pobj, func))
                .delegate(obj.selector, evt, _hoadEvent(pobj, func))
                : $(trigger || 'body').undelegate(obj.selector, evt);
        }
    }

    function _isBuilt(selector){
        return selector == document || selector == 'document' || selector == 'html' || selector == 'body';
    }

    function _isWindow(selector){
        return selector == window || selector == 'window';
    }

    /**
     * Module 事件处理（ 事件绑定 ）
     * @obj     事件侦听对象
     * @pobj    this作用域被替换对象
     * @evt     事件名称
     * @func    事件函数
     * @type {Function}
     */
    var Events = function(obj, pobj, evt, func, type, trigger){
        _listener(obj, pobj, evt, func, type, trigger);
    };
    // static
    Events.initEvent = function(obj, pobj, evt, func, type, trigger){
        _listener(obj, pobj, evt, func, type, trigger);
    };
    Events.uninitEvent = function(selector, event, func, trigger){
        if (_isWindow(selector)) {
            $(window).off(event, func);
        } else if (_isBuilt(selector)) {
            $(selector).off(event, func);
        } else {
            $(trigger).undelegate(selector, event, func);
        }
    };

    SYST.Events = Events;

})(SYST);

/**
 * Created by r9luox on 2016/4/28.
 * Model props watcher
 * 数据绑定 监听对象
 * 监听数据变化，实时更新UI
 */

;!(function(SYST){

    var _$ = SYST.$ || $,
        reg = /\{\{\s*([^\{]*?)\s*\}\}/gi,
        slice = Array.prototype.slice,
        isObserve = 'observe' in Object,
        notValReg = /^[^\w]*/gi,
        strProp = {
            toUpperCase: function(str){ return str.toUpperCase(); },
            toLowerCase: function(str){ return str.toLowerCase(); }
        };
        trimAttrValue = function(str){
            return SYST.T.rtrim(str.replace(/[\s\{\}]*/gi, ''), '|');
        };

    var st_model = 'st-model',
        st_prop = 'st-prop',
        st_template = 'st-template',
        st_style = 'st-style',
        st_repeat = 'st-repeat',
        st_item = 'st-item',
        st_vid = 'st-vid',
        st_filter = 'st-filter',
        bindStPropName = 'bindStPropName',
        rawHtml = 'rawHtml',
        innerHTML = 'innerHTML';

    //st-repeat regs
    var startRS = '\\{\\{\\s*',
        endRS = '\\s*\\}\\}',
        mRS = 'gi',
        repeatReg = new RegExp(startRS + '(\\$value)?' + endRS, mRS),
        indexReg = new RegExp(startRS + '(\\$index)?' + endRS, mRS),
        firstReg = new RegExp(startRS + '(\\$first)?' + endRS, mRS),
        lastReg = new RegExp(startRS + '(\\$last)?' + endRS, mRS),
        objKeyReg = new RegExp(startRS + '(\\$key[^\\}]*?)?' + endRS, mRS),
        objValReg = new RegExp(startRS + '(\\$valu?e?[^\\}]*?)?' + endRS, mRS);

    var Watcher = function(model){

        if(!model)
            throw new ReferenceError('args 1 can ben SYST.Model');
        this._reset(model);

    };

    Watcher.prototype = {
        //初始化 开始监听
        init: function(){
            this._init();
        },

        /**
         * 当新增属性（数据）时，将添加对应的watch
         * @param propName      属性名
         * @param propValue     属性值
         */
        addListener: function(propName, propValue){
            this._getModelTags(propName);
            if(propValue){
                this.model.set(propName, propValue);
            }
        },

        /**
         * 当某个属性被移除时，将对应的wath也移除掉
         * @param propName
         */
        removeListener: function(propName){
            if(!propName){
                return this.removeListenerAll();
            }
            //删除指定的属性绑定的数据
            this._deleteBinds(propName);
            return this;
        },
        removeListenerAll: function(){
            this._reset();
            return this;
        },

        /**
         * 更新数据被绑定的UI
         * @param propName: 属性名
         * @param propValue: 属性值
         * @param model: 当前绑定的model
         */
        update: function(propName, propValue){
            if(!SYST.V.isEmpty(propName) && SYST.V.isString(propName)){
                if(propValue){
                    this.model.props[propName] = propValue;
                }
                //同步更新绑定样式
                this.bindElements[propName] && this.updateBindProps(propName);
                this.bindStyles[propName] && this.updateBindStyles(propName);
                this.bindRepeats[propName] && this.updateBindRepeats(propName);
            }
        },
        //重新获取监听属性tag
        reset: function(model){
            this._reset(model);
            //如果 props key 存在
            //只更新 props对应的key
            this._getBindModelTags();

        },

        updateBindProps: function(propName){
            this._makeProps(propName);
        },

        /**
         * 重新渲染
         * @param templateId
         * @param data
         */
        updateRenderTemplate: function(templateId, data){
            var self = this, containers,
                bindTemplates = this.bindTemplates;
            if(templateId){
                containers = bindTemplates[templateId];
                _renderAction(templateId, containers);
            }else{
                //tid ==> templateId
                for(var tid in bindTemplates){
                    containers = bindTemplates[tid];
                    _renderAction(tid, containers);
                }
            }

            function _renderAction(tid, cons){
                SYST.V.isArray(cons) && SYST.T.each(cons, function(container){
                    //解析模板并填充
                    self._renderTemplate(tid, container, data);
                });
            }
        },

        /**
         * 更新绑定的样式
         * @param propName 绑定的属性名
         * @param elements
         */
        updateBindStyles: function(propName){
            this._makeStyles(propName);
        },

        /**
         * 循环输出绑定
         * @param propName
         * @param elements
         */
        updateBindRepeats: function(propName){
            this._makeRepeats(propName);
        },

        //------------------------Private----------------------
        _init: function(){
            if(!this.model.props)
                return this;
            //IF Objext.observe exist
            //if(isObserve){
            //    //this._initObserve();
            //}

            this._getBindModelTags();

        },

        /**
         * IF Object observe exits
         * change model props
         */
        //_initObserve: function(){
        //    if(!isObserve)  return;
        //
        //    var self = this, type, name;
        //    Object.observe(this.model.props, function(changes){
        //        changes.forEach(function(changeProp){
        //            //console.log(changeProp);
        //            //update | add | delete
        //            watchProp(changeProp);
        //        });
        //    });
        //
        //    function watchProp(changeProp){
        //        type = changeProp.type;
        //        name = changeProp.name;
        //        switch (type){
        //            case 'add':
        //                //对于新增加的prop，需要重新watch
        //                self.addListener(name);
        //                break;
        //            case 'update':
        //                self.update(name);
        //                break;
        //            case 'delete':
        //                //对于删除的prop，需要移除watch
        //                self.removeListener(name);
        //                break;
        //        }
        //        //更新监听 st-template
        //        self.updateRenderTemplate();
        //    }
        //
        //},
        _reset: function(model){
            this.model = model || this.model;
            this.bindModelTags = [];
            //prop is key, elements is value
            this.bindElements = {};
            //bind templates as tag id
            this.bindTemplates = {};
            //bind styles as st-style tag
            this.bindStyles = {};
            //bind repeat data as st-repeat tag
            this.bindRepeats = {};
        },
        _deleteBinds: function(propName){
            var binds = [this.bindElements, this.bindTemplates, this.bindRepeats, this.bindStyles];
            (function _delete(binds){
                SYST.T.each(binds, function(bind){
                    bind[propName] = null;
                    delete bind[propName];
                });
            })(binds);
        },
        //======================== st-model =======================================
        _getModelTags: function(propName){
            var model, $bindTag;
            this.bindModelTags = slice.call(_$('['+ st_model +'='+ this.model.$mid +']'));

            SYST.T.each(this.bindModelTags, function(tag){
                model = tag.getAttribute(st_model);
                $bindTag = _$(tag);
                this._getBindElements($bindTag, propName);
                //获取绑定的模板 【 st-template 】
                this._getBindTemplates($bindTag, propName);
                //获取绑定的样式 【st-style】
                this._getBindStyles($bindTag, propName);
                //获取绑定样式 【st-repeat】
                this._getBindRepeats($bindTag, propName);
            }, this);
        },
        /**
         * 获取数据被绑定的UI as st-model
         * @param propName: 新增加的属性
         */
        _getBindModelTags: function(){
            this._getModelTags();
        },
        //======================== st-prop ========================================
        /**
         * 获取数据被绑定的UI as st-prop
         * @param bindTag 具有st-model属性的单个标签元素
         * @private
         */
        _getBindElements: function(bindTag, propName){
            //根据标签属性名来查找 绑定元素
            this._getBindElementForAttriburte(bindTag, propName);
            //根据标签元素中内容查找 绑定元素
            this._getBindElementForContent(bindTag, propName);
            //开始填充数据
            this._makeProps();

        },
        /**
         * 根据标签属性上带有 st-prop
         * @param bindTag
         * @private
         */
        _getBindElementForAttriburte: function(bindTag, propName){
            var elements, $bindTag, name;
            $bindTag = bindTag;
            if(propName){
                elements = slice.call($bindTag.find('['+ st_prop +'='+ propName +']'));
            }else{
                elements = slice.call($bindTag.find('['+ st_prop +']'));
            }
            if(elements.length === 0)   return;

            SYST.T.each(elements, function(element){
                name = this._getRootPropName(element.getAttribute(st_prop));
                this._toBindElements(name, element);
            }, this);
        },
        /**
         * 根据标签内容中含有被绑定属性，并以模板形式呈现的，如：{{ prop }}
         * @param bindTag
         * @private
         */
        _getBindElementForContent: function(bindTag, propName){
            var self = this, temp, elements, name,
            $bindTag = bindTag;
            //获取绑定的元素集合
            while((temp = reg.exec($bindTag.html())) != null){

                elements = slice.call($bindTag.find(':contains('+ temp[0] +')')).reverse();
                //console.log(temp[0]);
                if(!elements || elements.length === 0)  continue;
                name = self._getRootPropName(temp[0]);
                if(propName && name !== propName)   break;
                SYST.T.each(elements, function(element){
                    //保存元素原内容,便于以后置换绑定数据使用
                    element[rawHtml] = element[innerHTML];
                    self._toBindElements(name, element);
                });
            }
        },

        /**
         *  将属性名于之对应的绑定元素组合，属性名为key，值为元素数组
         *  方便在单独改变prop是只更新与之对应的元素
         * @param name: 属性名
         * @param element: 属性值
         */
        _toBindElements: function(name, element){
            //元素对象添加绑定数据名称
            element[bindStPropName] = name;
            if(!SYST.V.isArray(this.bindElements[name])){
                this.bindElements[name] = [];
                this.bindElements[name].push(element);
            }else{
                if(SYST.T.indexOf(this.bindElements[name], element) === -1){
                    this.bindElements[name].push(element);
                }
            }

        },
        //更新UI
        _makeProps: function(propName){
            var _elements = this.bindElements;
            if(propName && !_elements[propName]) return;
            SYST.T.each(_elements, function(elements, index, prop){
                var els = elements || this.bindElements[prop];
                if(SYST.V.isArray(els) && els.length !== 0){
                    SYST.T.each(els, function(element){
                        this._makeProp(prop, element);
                    }, this);
                }
            }, this);

        },
        //监听 props属性变化
        _makeProp: function(propName, element){
            if(this.model.props[propName] == null) return;
            var self = this, filters = [],
                fts = element.getAttribute(st_filter),
                attr = element.getAttribute(st_prop),
                value = this._getProp(element);
            if(attr){
                attr = this._getPropName(attr);
                filters = this._getFilters(attr);
            }
            if(fts){
                filters = filters.concat(this._getFilters(fts, true));
                value = self._makeFilters(value, this._getFilters(fts, true));
            }
            //------------------------
             //valueType = /TEXTAREA|INPUT|SELECT/.test(elm.nodeName) ? 'value' : 'innerHTML';
             if(/TEXTAREA|INPUT/.test(element.nodeName)){

                 //textarea、input
                 if(/radio|checkbox/.test(element.type)){
                     if(element.value == value){
                         element.checked = true;
                     }
                 }else{
                     element.value = value;
                     element['onkeyup'] = function(evt){
                         var value = this.value;
                         value = self._makeFilters(value, filters);
                         self.model.set(attr, value);
                         element.value = self._getProp(element);
                     };
                 }

             }
             else if(/SELECT/.test(element.nodeName)){
                 element.value = value;
                 element['onchange'] = function(evt){
                     var value = this.value;
                     value = self._makeFilters(value, filters);
                     self.model.set(attr, value);
                     element.value = self._getProp(element);
                 };
             }
             else{
                 if(element.getAttribute(st_repeat)) return;
                 attr = element.getAttribute(st_prop);
                 if(attr || !element[rawHtml]){
                     element[innerHTML] = self._getProp(element);
                 }else{
                     //获取此 element
                     element[innerHTML] = element[rawHtml].replace(reg, function(match, $1){
                         //console.log(match, props[$1]);
                         return self._getProp(element, $1);
                     });
                 }
             }

        },
        //获取 当前属性的最新值
        _getProp: function(element, prop){
            var attr = prop || (function(){
                        var stProp = element.getAttribute(st_prop);
                        if(stProp){
                            return stProp.replace(notValReg, '')
                        }else{
                            return null;
                        }
                    })(),
                propName, filters;
            if(!attr) return '';
            // exp: <span st-prop="user.name | trim | addFirstName"></span>
            filters = this._getFilters(attr);
            attr = this._getPropName(attr);

            // exp: user.name.first
            if(/\./gi.test(attr)){
                propName = this._getFinalPropValue(attr);
            }else{
                propName = this.model.props[attr];
            }

            if(propName == null) return '';
            //如果绑定的属性时一个function，则获取执行结果
            if(SYST.V.isFunction(propName)){
                propName = propName.apply(this.model);
            }

            //each methods
            propName = this._makeFilters(propName, filters);
            return propName;

        },
        //get first prop for exp: user.name.first to get 'user'
        //获取嵌套绑定属性的值
        _getFinalPropValue: function(attrStr){
            var attr = attrStr.split('.');
            //console.log(attr);
            var index = 0, temp, tts = this.model.props[attr[0].replace(notValReg, '')] || ''; //
            while(SYST.V.isObject(tts) && (temp = tts[attr[++index]]) != null){
                tts = tts[attr[index]];
            }
            return tts;
        },
        //获取所有过滤器 ex: {{ name | trim | addLastName }}
        _getFilters: function(attrStr, flag){
            var filters = trimAttrValue(attrStr).split('|');
            !flag && filters.shift();
            return filters;
        },
        _makeFilters: function(arg, filters){
            if(!SYST.V.isArray(filters) || 0 === filters.length) return arg;
            var prop = arg, method;
            SYST.T.each(filters, function(filter){
                method = this.model[SYST.T.trim(filter)];
                if(SYST.V.isFunction(method)){
                    prop = method.apply(this.model, [prop]);
                }else{
                    method = strProp[filter] || SYST.T[filter];
                    if(SYST.V.isFunction(method)){
                        prop = method(prop);
                    }
                }
            }, this);
            return prop;
        },
        //获取跟属性名 ex：user.name.first => user
        _getRootPropName: function(attrStr){
            return trimAttrValue(attrStr).split(/\.|\|/gi)[0];
        },
        //获取跟属性名 ex：{{ user.name.first | trim | addLastName }} => user.name.first
        _getPropName: function(attrStr){
            return trimAttrValue(attrStr).split('|')[0];
        },

        //======================== st-template ========================================
        _getBindTemplates: function(bindTag, propName){
            var templates,
                templateId;
            templates = this._getElements(propName, bindTag, st_template);
            if(templates.length === 0) return;

            SYST.T.each(templates, function(container){
                templateId = '#' + container.getAttribute(st_template);
                //添加到缓存
                this._toBindTemplates(templateId, container);
                //解析模板并填充
                this._renderTemplate(templateId, container);
            }, this);
        },
        _toBindTemplates: function(templateId, container){
            if(!this.bindTemplates[templateId]){
                this.bindTemplates[templateId] = [];
            }
            if(SYST.T.indexOf(this.bindTemplates[templateId], container) === -1){
                this.bindTemplates[templateId].push(container);
            }
        },
        _renderTemplate: function(templateId, container, data){
            if(this.model.props && Object.keys(this.model.props).length === 0)  return;
            container = _$(container);
            data = SYST.V.isObject(data) ? SYST.extend(this.model.props, data) : this.model.props;
            var html = '';
            if(SYST.V.isObject(data)){
                html = SYST.T.render(templateId, data, null, {open: '{{', close: '}}'});
            }
            container.html(html);
        },

        //========================= st-style ===========================================
        _getBindStyles: function(bindTag, propName){
            //if(this.model.props && Object.keys(this.model.props).length === 0)  return;
            var styleString, temp, styles;
            styles = this._getElements(propName, bindTag, st_style);
            if(styles.length === 0) return;

            SYST.T.each(styles, function(element){
                styleString = element.getAttribute(st_style);
                //获取绑定的元素集合
                while((temp = reg.exec(styleString)) != null){
                    element[st_style] = styleString;
                    element.removeAttribute(st_style);
                    var propName = this._getPropName(temp[1]);
                    this._toBindStyles(propName, element);
                    //this._toBindElements(propName, element);
                }
            }, this);

            //开始解析 st-style
            this._makeStyles(propName);
        },
        _toBindStyles: function(propName, element){
            var bindStyleElements = this.bindStyles[propName];
            if(!bindStyleElements){
                bindStyleElements = this.bindStyles[propName] = [];
            }
            if(SYST.T.indexOf(bindStyleElements, element) === -1){
                bindStyleElements.push(element);
            }
        },
        _makeStyles: function(propName){
            var bindStyleElements = this._getBinds(propName, this.bindStyles);
            SYST.T.each(bindStyleElements, function(styles, index, propName){
                this._makeStyle(propName, styles);
            }, this);
        },
        _makeStyle: function(propName, elements){
            if(!(propName in this.model.props)) return;
            var self = this, styleString,
                elements = elements || this.bindStyles[propName];
            SYST.V.isArray(elements)
            &&
            SYST.T.each(elements, function(element){
                styleString = element[st_style];
                styleString = styleString.replace(reg, function(match, $1){
                    //console.log(match, $1);
                    if(/\|/gi.test($1)){
                        var propName = self._getPropName($1),
                            prop = self.model.props[propName];
                        return self._makeFilters(prop, self._getFilters($1));
                    }
                    return self.model.props[$1];
                });
                //console.log(styleString); //cssText方式在IE中的性能极差
                //var style = element.style.cssText;
                //style = style.length === 0 ? '' : style.replace(/;$/i, '') + ';';
                //element.style.cssText = style + styleString;

                var styles = styleString.split(';');
                styles && SYST.T.each(styles, function(s){
                    var sy = s.split(':');
                    sy && $(element).css(sy[0], sy[1]);
                });
            });

        },
        //========================= st-repeat ==========================================
        _getBindRepeats: function(bindTag, propName){
            //if(/*isObserve && */this.model.props && Object.keys(this.model.props).length === 0)  return;
            var prop, outerHTML, repeats;
            repeats = this._getElements(propName, bindTag, st_repeat);
            if(repeats.length === 0) return;

            SYST.T.each(repeats, function(element){
                prop = element.getAttribute(st_repeat);
                //获取绑定的元素集合
                outerHTML = element.outerHTML;
                element['rawOuterHTML'] = outerHTML;
                element['parent'] = element.parentNode;
                this._toBindRepeats(prop, element);
            }, this);

            //解析
            this._makeRepeats();


        },
        _toBindRepeats: function(propName, element){
            var bindRepeatElements = this.bindRepeats[propName];
            if(!bindRepeatElements){
                this.bindRepeats[propName] = [];
                bindRepeatElements = this.bindRepeats[propName];
            }
            if(SYST.T.indexOf(bindRepeatElements, element) === -1){
                bindRepeatElements.push(element);
            }
        },
        _makeRepeats: function(propName){
            var bindRepeatElements = this._getBinds(propName, this.bindRepeats);
            SYST.T.each(bindRepeatElements, function(elements, index, prop){
                this._makeRepeat(prop, elements);
            }, this);
        },
        _makeRepeat: function(propName, elements){
            if(!(propName in this.model.props)) return;
            if(!elements || elements.length === 0)  return;
            var outerHTML, temp = '', item, len = 0;
            var prop = this.model.get(propName);

            SYST.T.each(elements, function(element){
                outerHTML = this._removeBindAttr(element);
                item = element.getAttribute(st_item);
                if(!SYST.V.isEmpty(item)){
                    repeatReg = new RegExp(startRS + '(\\$?'+ item +'[^\\{]*?)' + endRS, mRS);
                }
                if(SYST.V.isArray(prop)){
                    len = prop.length;
                    SYST.T.each(prop, function(p, index){
                        //替换其他属性，如 索引
                        temp += this._replaceBindsArray(outerHTML, p, index, len - 1, item);
                    }, this);
                }
                else if(SYST.V.isObject(prop)){
                    SYST.T.each(prop, function(val, index, key){
                        //替换其他属性，如 索引
                        temp += this._replaceBindObject(outerHTML, key, val, index);
                    }, this);
                }

                //element.parent.innerHTML = temp;
                var newChilds = slice.call($(element.parent).find('['+ st_vid +']'));
                if(newChilds[0]){
                    element['newFirstChild'] = newChilds[0];
                    newChilds.shift();
                    SYST.T.each(newChilds, function(child){
                        $(child).remove();
                    });
                    $(element['newFirstChild']).replaceWith(temp);
                }else{
                    $(element).replaceWith(temp);
                }
            }, this);

        },
        _removeBindAttr: function(element){
            var outerHTML = $(element['rawOuterHTML']);
            outerHTML.removeAttr(st_repeat).removeAttr(st_item).attr(st_vid, Date.now());
            outerHTML = outerHTML[0].outerHTML;
            return outerHTML;
        },

        /**
         * 处理数组的情况
         * @param str       源字符串
         * @param value     元素值
         * @param index     索引
         * @param len       长度
         * @param itemName  st-item的值
         * @returns {*}
         * @private
         */
        _replaceBindsArray: function(str, value, index, len, itemName){
            var self = this,
                vmodel = {},
                rp = { open: '{{', close: '}}' },
                filters, val;
            str.replace(repeatReg, function(match, $1){
                filters = self._getFilters($1);
                val = self._makeFilters(value, filters);
            });

            if(SYST.V.isObject(val)){
                str = str.replace(/\{\{/gi, '{{=');
                vmodel = {
                    '$index': '' + index,
                    '$first': index === 0 ? 'true' : 'false',
                    '$last': index === len ? 'true' : 'false'
                };
                vmodel[itemName] = value;
                str = SYST.T.render(str, vmodel, null, rp);
            }else{
                str = str.replace(repeatReg, function(){
                    //显示当前值
                    return val;
                }).replace(indexReg, function(){
                    //显示索引
                    return index;
                }).replace(firstReg, function(){
                    //是否为开头
                    return index === 0 ? true : false;
                }).replace(lastReg, function(){
                    //是否是末尾
                    return index === len ? true : false;
                }).replace(reg, function(match, $1){
                    if(self.model.has($1)){
                        return self.model.get($1);
                    }else{
                        return match;
                    }
                });
            }
            return str;

        },

        /**
         * 处理Object对象的情况
         * @param str       源字符串
         * @param key       键名
         * @param value     值
         * @param index     索引
         * @returns {string}
         * @private
         */
        _replaceBindObject: function(str, key, value, index){
            var self = this;
            str = str.replace(objKeyReg, function(match, $1){
                return _filter(key, $1);
            }).replace(objValReg, function(match, $1){
                return _filter(value, $1);
            }).replace(indexReg, function(){
                return '' + index;
            });
            function _filter(v, $str){
                var filters = self._getFilters($str);
                return self._makeFilters(v, filters);
            }
            return str;
        },


        //========================= common method =======================================
        _getElements: function(propName, $bindTag, stString){
            var elements;
            if(propName){
                elements     = slice.call($bindTag.find('['+ stString +'='+ propName +']'));
            }else{
                elements     = slice.call($bindTag.find('['+ stString +']'));
            }
            return elements;
        },
        _getBinds: function(propName, binds){
            var bindElements = {};
            if(propName){
                bindElements[propName] = binds[propName];
            }else{
                bindElements = binds;
            }
            return bindElements;
        }

    };

    SYST.Watcher = Watcher;

})(SYST);

/**
 * Created by Rodey on 2015/10/16.
 *
 * Model 模型对象
 * @type {Function}
 */

;(function(SYST, root){

    'use strict';

    var _$ = SYST.$;
    var isObserve = 'observe' in Object;
    var Model = function(){
        this.__instance_SYST__ = 'SYST Model';
        this.__name__ = 'SYST Model';
        this.autoWatcher = true;
        this.watcher = null;
    };

    SYST.Model = function(){
        var model = SYST.extendClass(arguments, Model);
        model._initialize();
        return model;
    };

    Model.prototype = {

        _initialize: function(){
            this.$http = this.$http || new SYST.Http();
            //属性列表，数据绑定在里面
            this.props = this.props || {};
            //初始化 Watcher
            this.watcher = new SYST.Watcher(this);
            SYST.shareModel.add(this.$mid || null, this);
            this.init && this.init.apply(this, arguments);
            //var startTime = Date.now();
            if(this.$mid || this.autoWatcher !== false){
                this.watcher.init();
            }
            //console.log('Model: ' + this.$mid, (Date.now() - startTime) / 1000)
        },

        /**
         * 根据数组自动生成对象属性
         * @param apis
         */
        generateApi: function(apis, urls, options){
            var self = this;
            SYST.V.isArray(apis) && SYST.T.each(apis, function(key, index){
                self._generateApi(key, urls[key], options);
            });

            if(SYST.V.isObject(apis)){
                for(var key in apis){
                    this._generateApi(key, apis[key], options);
                }
            }
        },

        _generateApi: function(key, url, options){
            var self = this;
            options = SYST.V.isObject(options) && options || {};
            options['callTarget'] = this;
            function _vfn(postData, su, fail){
                self.$http.doAjax(url, postData, su, fail, options);
            }
            ('defineProperty' in Object)
                ? Object.defineProperty(self, key, { value: _vfn })
                : (self[key] = _vfn);

        },

        // 在本模型中存取
        get: function(key){    return this.props[key];    },
        // 动态添加属性
        set: function(key, value){

            if(SYST.V.isEmpty(key)) return this;
            var self = this;

            if(SYST.V.isObject(key)){
                // this.set({ name: 'Rodey', age: 25 });
                for(var k in key){
                    _set(k, key[k]);
                }
            }else if(SYST.V.isString(key) && key.length > 0){
                //this.set('name', 'Rodey') | this.set('one', { name: 'Rodey', age: 25, isBoss: false }
                _set(key, value);
            }

            function _set(k, v){
                self.props[k] = v;
                self._watchProrp(k, v);
            }

            //不是每次设置单个prop都 watcher template
            //而是整个set动作完成之后，执行watcher template
            self._watchTemplate();

            return this;
        },
        add: function(key, value){
            this.set(key, value);
        },
        //判断某个属性是否存在
        has: function(key){
            return Boolean(this.props[key]);
        },
        removeProps: function(keys){
            //var self = this;
            if(SYST.V.isString(keys)){
                this.remove(keys);
            }
            else if(SYST.V.isArray(keys)){
                SYST.T.each(keys, function(key){
                    this.remove(key);
                }, this);
            }else if(SYST.V.isObject(keys)){
                SYST.T.each(keys, function(value, index, key){
                    this.remove(key);
                }, this);
            }else{
                this.watcher.removeListener();
                this.props = {};
            }
            return this;

        },
        removePropsAll: function(){
            this.removeProps();
        },
        //动态删除属性
        remove: function(key){
            if(!key || key == '') return this;
            this.props[key] = null;
            delete this.props[key];
            this.watcher.removeListener(key);
            return this;
        },

        // 在localStorage中存取
        getItem: function(key, flag){
            var item =  (!flag ? root.localStorage : root.sessionStorage).getItem(key);
            try{
                item = JSON.parse(item);
            } catch(e){}
            return item;
        },
        setItem: function(key, value, flag){
            if(SYST.V.isObject(key)){
                // ({ name: 'Rodey', age: 25, phone: { name: 'iphone 5s', prize: 5000 } });
                for(var k in key){
                    _set(k, key[k]);
                }
            }else if(typeof key === 'string' && key.length > 0){
                // ('name', 'Rodey') || ('one', { name: 'Rodey', age: 25, isBoss: false });
                _set(key, value);
            }else{
                return this;
            }
            function _set(_k, _v){
                if(SYST.V.isObject(_v) || SYST.V.isArray(_v)){
                    _v = JSON.stringify(_v);
                }
                (!flag ? root.localStorage : root.sessionStorage).setItem(_k, _v);
            }
        },
        hasItem: function(key, flag){
            return Boolean((!flag ? root.localStorage : root.sessionStorage).getItem(key));
        },
        removeItem: function(key, flag){
            (!flag ? root.localStorage : root.sessionStorage).removeItem(key);
        },
        removeItems: function(keys, flag){
            var self = this;
            if(SYST.V.isString(keys)){
                this.removeItem(keys, flag);
            }
            else if(SYST.V.isArray(keys)){
                SYST.T.each(keys, function(key){
                    this.removeItem(key, flag);
                }, this);
            }else{
                flag ? sessionStorage.clear() : localStorage.clear();
            }
        },

        //监听 st-prop 属性变化
        _watchProrp: function(key, value){
            //if(!isObserve)
                this.watcher && this.watcher.update(key);
        },
        //监听 st-template
        _watchTemplate: function(){
            this.watcher && this.watcher.updateRenderTemplate();
        }

    };

})(SYST, window);
/**
 * Created by Rodey on 2015/10/16.
 */

;(function(SYST){

    'use strict';

    /**
     * Module 共享数据模型
     * @type {Object}
     */
    var ShareModel = SYST.shareModel = {
        models: {},
        add: function(key, model){
            if(SYST.V.isEmpty(key)){
                key = (new Date()).getTime() + Math.random();
            }
            this.models[key] = model;
        },
        get: function(key){
            var shareModels = this.models;
            if(shareModels[key])
                return shareModels[key];
            return null;
        },
        remove: function(key){
            var shareModels = this.models,
                model = shareModels[key];
            if(model){
                shareModels[key] = null;
                delete shareModels[key];
            }
            return model;
        },
        has: function(key){
            return this.models[key] ? true : false;
        }
    };

})(SYST);

/**
 * Created by Rodey on 2015/10/16.
 *
 * Module 视图对象
 * @type {Function}
 */

;(function(SYST, root){

    'use strict';

    var View = function(){
        this.__instance_SYST__ = 'SYST View';
        this.__Name__ = 'SYST View';
    };
    SYST.View = function(){
        var view = SYST.extendClass(arguments, View);
        view._initialize();
        return view;
    };

    View.prototype = {

        _initialize: function(){
            this.model = this.model || new SYST.Model();
            this.container = this.container || 'body';
            this.template = null;
            this.container = SYST.$(this.container);
            this.containerSelector = this.container.selector;

            //自定义init初始化
            !this.unInit && this.init && this.init.apply(this);

            //自动解析 events对象，处理view中的事件绑定
            this.events && this.events != {} && SYST.V.isObject(this.events) &&  this.onEvent();
        },

        destroy: function(){
            this.container.html('');
            return this;
        },
        /**
         * 改变对象属性作用域 (常用在元素触发事件侦听函数中)
         * @param callback
         * @param value
         * @return {Function}
         */
        handEvent: function(callback, value){
            var self = this, args = [];
            for(var i = 2; i < arguments.length; i++)   args.push(arguments[i]);
            return function(e){
                args.push(value);
                args.push(e);
                callback.apply(self, args);
            }
        },
        //处理事件绑定，以改变对象作用域
        hoadEvent: SYST.T.hoadEvent,
        /**
         * 格式化 events对象
         * @param events对象
         * @return {*}
         */
        _parseEvent: function(evtObj){
            if(!evtObj || evtObj.length == 0 || evtObj === {}) return this;
            var evts = [], objs = [], handleFunctions = [], o, selector, evtType, func;
            for(var evt in evtObj){
                var eobj = evtObj[evt];
                if(SYST.V.isObject(eobj)){
                    for(var k in eobj){
                        o = this._parseString(eobj, k), selector = o[0], evtType = o[1], func = o[2];
                        pushs(selector, evtType, func);
                    }
                }else{
                    o = this._parseString(evtObj, evt), selector = o[0], evtType = o[1], func = o[2];
                    pushs(selector, evtType, func);
                }

            }

            function pushs(selector, evtType, func){
                objs.push(selector);
                evts.push(evtType);
                handleFunctions.push(func);
            }
            //储存事件名称
            //this.evts = evts;
            //储存事件侦听对象
            //this.objs = objs;
            //储存事件函数
            //this.handleFunctions = handleFunctions;

            return { events: evts, elements: objs, functions: handleFunctions };
        },
        /**
         * 自动绑定事件
         * @param 将被替换的对象
         */
        _autoHandleEvent: function(type){
            var parseEvents = this._parseEvent(this.events),
                evts = parseEvents['events'],
                objs = parseEvents['elements'],
                funs = parseEvents['functions'];
            if(!evts || evts.length == 0 || evts.length == {}) return this;
            var type = type || 'on';
            for(var i = 0, l = evts.length; i < l; i++){
                if(!evts[i])
                    throw new Error('对象侦听'+ evts[i] + '不存在');
                if(!funs[i])
                    throw new Error('对象'+ this + '不存在' + funs[i] + '方法');
                if(!objs[i])
                    throw new Error('事件函数'+ funs[i] + '不存在');

                SYST.Events($(objs[i]), this, evts[i], funs[i], type, this.containerSelector);
            }
            return this;
        },

        _parseString: function(obj, k){
            var o = ($.trim(k)).split(/\s+/gi);
            var selector = o[1].replace(/^\$*|[\(*]|[\)*]$/gi, '').replace(/"|'/gi, '\"');
            var evtType = o[0].replace(/^\s*|\s*$/gi, '');
            var func = obj[k];
            return [selector, evtType, func];
        },

        /**
         * 开始监听
         * @param selector
         * @param event
         * @param func
         */
        onEvent: function(selector, event, func){
            if(SYST.V.isEmpty(selector)) {
                this._autoHandleEvent('on');
            }else{
                SYST.Events.initEvent(SYST.V.isString(selector) ? $(selector) : selector, this, event, func, 'on', this.containerSelector);
            }
            return this;
        },

        /**
         * 结束监听
         * @param selector
         * @param event
         * @param func
         */
        offEvent: function(selector, event, func){
            //this.autoHandleEvent('off');
            if(SYST.V.isEmpty(selector)){
                this._autoHandleEvent('off');
            }else{
                //this._e.uninitEvent(selector, event, func);
                SYST.Events.initEvent(SYST.V.isString(selector) ? $(selector) : selector, this, event, func, 'off', this.containerSelector);
            }
            return this;
        },
        shareModel: SYST.shareModels
    };

})(SYST, window);
/**
 * Created by Rodey on 2015/10/16.
 */

;(function(SYST){

    'use strict';


    /**
     * Module 控制器对象
     * @type {Function}
     */

    var Controller = function(){
        this.__instance_SYST__ = 'SYST Controller';
        this.__Name__ = 'SYST Controller';
    };
    SYST.Controller = function(){
        var ctrl = SYST.extendClass(arguments, Controller);
        ctrl._initialize();
        return ctrl;
    };
    SYST.Controller.prototype = {
        shareModel: SYST.shareModel,
        _initialize: function(){
            this.defaultHost = this.defaultHost || location.host;
            SYST.V.isFunction(this.init) && this.init.apply(this, arguments);
        },
        getModel: function(key){
            if(key)     return this.shareModel.get(key);
            else        return this.model;
        },
        setModel: function(model){
            if(!SYST.V.isEmpty(model)){
                this.shareModel.add(model);
                this.model = model;
            }else{
                throw new Error('setModel: 参数有误');
            }
        }
    };

})(SYST);

/**
 * Created by Rodey on 2015/10/16.
 * Module Router 路由相关
 */

;(function(SYST){

    'use strict';

    var uri = window.location,
        host = uri.host,
        port = uri.port,
        origin = uri.origin || (uri.protocol + '//' + host),
        pathname = uri.pathname,
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

            router = SYST.V.isObject(router) ? router : SYST.V.isFunction(router) ? router.apply(this) : null;
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
            action && SYST.V.isFunction(action) && action.call(this, view, this.params, tpl);

        },

        /**
         * $private 开始监听路由变化
         * @param callback
         * @private
         */
        _changeStart: function(){
            this._changeStop();
            window.addEventListener('hashchange', SYST.hoadEvent(this, '_changeHandler'), false);
        },
        _changeStop: function(){
            window.removeEventListener('hashchange', SYST.hoadEvent(this, '_changeHandler'), false);
        },
        _changeHandler: function(evt){

            var self = this,
                preventRouter = this.router,
                currentRouter;

            //前后路由数据保存
            this.oldURL = '#' + evt.oldURL.split('#')[1];
            this.newURL = '#' + evt.newURL.split('#')[1];
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
            this.container = SYST.$(cid);

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
        },
        //$private 路由之间切换动画
        _onAnimate: function(type, cb){
            var router = this.router;
            if(!router)
                return;

            var animate = router['animate'],
                duration = router['animateDuration'] || 300,
                container = this.container,
                type = type || 'on';

            if(router && container){
                switch (animate){
                    case 'slide':
                        type === 'on' ? container.slideDown(duration, cb) : container.slideUp(100, cb);
                        break;
                    case 'fade':
                        type === 'on' ? container.fadeIn(duration, cb) : container.fadeOut(100, cb);
                        break;
                    default :
                        container.show();
                        break;
                }
            }
        }

    };

})(SYST);


/**
 * Created by Rodey on 2015/10/16.
 *
 * Module Native相关 移动开发工具（web端调用native）
 * @type {Function}
 * USE: //调用native方法 , 未完待续>>>>>>>>
 */

;(function(SYST){

    'use strict';

    var ua = navigator.userAgent.toUpperCase(),
        // 当前环境是否为Android平台
        IS_ANDROID = ua.indexOf('ANDROID') !== -1,
        // 当前环境是否为IOS平台
        IS_IOS = ua.indexOf('IPHONE OS') !== -1,
        // 当前环境是否为本地Native环境
        IS_NATIVE = (IS_ANDROID || IS_IOS) ? true : false,
        //判断是否为移动设备
        IS_PHONE = ua.indexOf('MOBILE') !== -1,
        IS_PAD = ua.indexOf('IPAD') !== -1,
        IS_MOBILE = (IS_PHONE || IS_PAD) ? true : false;

    var Native = function(){
        this.__instance_SYST__ = 'SYST Native';
        this.__Name__ = 'SYST Native';
    };
    SYST.Native = function(){
        return SYST.extendClass(arguments, Native);
    };
    SYST.N = Native.prototype = {
        isAndroid   : IS_ANDROID,
        isIos       : IS_IOS,
        isNative    : IS_NATIVE,
        isPhone     : IS_PHONE,
        isPad       : IS_PAD,
        isMobile    : IS_MOBILE,
        callNative  : function(name){
            //TODO......
        }
    };

})(SYST);
