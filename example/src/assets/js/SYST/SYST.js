/*
* SYST.js v2.1.0
* Copyright  2016, Rodey Luo
* Released under the MIT License.
* Date Fri Dec 09 2016 21:26:57 GMT+0800 (中国标准时间)
*/
;(function(global, factory){if(typeof define === 'function' && define.amd){define(function(){ return factory(global) });}else{factory(global);}}(this, function(){
'use strict';
	
var slice = Array.prototype.slice,
    toString = Object.prototype.toString,
    hasOwnProperty = Object.prototype.hasOwnProperty;

function empty(){}
function def(target, key, val){
    Object.defineProperty(target, key, {
        value: val,
        enumerable: false,
        writable: true,
        configurable: false
    });
}

function isEnumerable(target, prop){
    var p = Object.getOwnPropertyDescriptor(target, prop);
    return p && p.enumerable === false;
}

var _clone = function(targetObject){
    var target = targetObject, out = {}, proto;
    for(proto in target)
        if(target.hasOwnProperty(proto))
            out[proto] = target[proto];
    return out;
};

var _extend = function(parent, child){
    parent = parent || {};
    child = child || {};
    var clone = _clone(parent);
    for(var prop in child)
        //if(child.hasOwnProperty(prop))
        clone[prop] = child[prop];
    return clone;
};

//Object.keys polyfill
(!Object.keys) && (Object.keys = function(o){
    if(o !== Object(o))
        throw new TypeError('Object.keys called on a non-object');
    var k = [], p;
    for(p in o) if(hasOwnProperty.call(o, p)) k.push(p);
    return k;
});
(!Object.values) && (Object.values = function(o){
    if(o !== Object(o))
        throw new TypeError('Object.keys called on a non-object');
    var k = [], p;
    for(p in o) if(hasOwnProperty.call(o, p)) k.push(o[p]);
    return k;
});
//Function bind polyfill see: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/bind#Compatibility
if(!Function.prototype.bind){
    Function.prototype.bind = function(oThis){
        if(typeof this !== 'function')
            throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
        var aArgs   = slice.call(arguments, 1),
            fToBind = this,
            fNOP    = function(){},
            fBound  = function(){
                return fToBind.apply(this instanceof fNOP
                        ? this : oThis,
                    aArgs.concat(slice.call(arguments)));
            };
        if(this.prototype)
            fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();
        return fBound;
    };
}



window.SYST = window.ST = (function(){

    var SYST = function(){};

    /**
     * 生成或者是继承类对象
     * @param args
     * @param className
     * @returns {*}
     * @private
     */
    var _extendClass = function(args, className){
        var args = Array.prototype.slice.call(args),
            firstArgument = args[0], i = 0, mg = {}, len = args.length;
        var hasProto = '__proto__' in mg;
        if(SYST.V.isObject(firstArgument)){
            //if firstArgument is SYST's Object
            if(len > 1 && '__instance_SYST__' in firstArgument){
                //实现继承
                args.shift();
                for(; i < len; ++i){
                    mg = _extend(mg, args[i]);
                }
                if(!hasProto)
                    mg = _extend(mg, firstArgument);
                else
                    mg.__proto__ = firstArgument;
                return mg;
            }else{
                //直接创建对象
                for(; i < len; ++i){
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

    SYST.ready = function(callback){
        (/complete|loaded|interactive/.test(document.readyState) && document.body)
        ? callback(SYST)
        : document.addEventListener('DOMContentLoaded', function(evt){ callback(evt, SYST); }, false);
    };
    SYST.extend = _extend;
    SYST.extendClass = _extendClass;
    SYST.clone = _clone;

    return SYST;

}).call(this);
;(function(SYST){

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
        isEmail     : function(email){      return /^([a-z0-9]+([\.\-_]?[a-z0-9]+)?)@([a-z0-9]+)\.([a-z0-9]+(\.[a-z0-9]+)?)$/i.test(email); },
        //验证 URL 地址
        isURL       : function(url){        return /^http:\/\/[\w\d]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"\"])*$/i.test(url); },
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
        isDocument  : function(value){      return value != null && value.nodeType == value.DOCUMENT_NODE },
        isElement   : function(value){      return !!(value && value.nodeName && value.nodeType); },
        isNodeList  : function(value){      return toString.call(value) === '[object NodeList]'; },
        isBetween   : function(value, min, max, flag){
            return flag ? (value.length >= min && value.length <= max) : (value.length > min && value.length < max);
        }

    };


})(SYST);
;(function(SYST){

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
        UA          : ua,
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

;(function(SYST){

    //需要转移的字符
    var escapeMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '`': '&#x60;'
        },
        wordReg = /^([a-zA-Z]){1}/i;

    function each(data, callback, target){
        if(!data){
            throw new SyntaxError('args1 is must Object or Array or String');
        }
        var i = 0, len;
        if(SYST.V.isObject(data)){
            var index = 0, keys = Object.keys(data), key;
            len = keys.length;
            if(len === 0)  return;
            for(; i < len; ++i){
                key = keys[i];
                if(data.hasOwnProperty(key)){
                    if(false === callback.call(target || data, data[key], index++, key)) return data;
                }
            }
        }
        else if((data && data.length) || SYST.V.isArray(data)){
            if(!SYST.V.isArray(data)) data = slice.call(data);
            len = data.length;
            if(len === 0)  return;
            for(; i < len; ++i){
                if(false === callback.call(target || data, data[i], i)) return data;
            }
        }
        else{}
    }

    /**
     * Function 浏览器 cookie操作
     * @param key       键名
     * @param value     键值
     * @param options   附件选项
     * @returns {*}
     * @constructor
     */
    function Cookie(key, value, options) {
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
    }
    function _Cookies(keys, options){
        var value;
        if(!keys) return;
        if(SYST.V.isObject(keys)){
            each(Object.keys(keys), function(key){
                value = keys[key];
                value && Cookie(key, keys[key], options);
            },  this);
        }
        else if(SYST.V.isArray(keys)){
            var rs = {}, name;
            for(var i = 0, len = keys.length; i < len; ++i){
                name = keys[i];
                rs[name] = Cookie(name);
            }
            return rs;
        }
    }

    var cookie = {
        add: function(key, val, options){

        },
        remove: function(key){}
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
         * 改变对象属性作用域 (常用在元素触发事件侦听函数中)
         * @param obj       作用域目标对象
         * @param func      obj对象中的属性
         * @param cature    是否阻止事件冒泡
         * @returns {Function}
         * SYST.Dom('#btn').on('click', SYST.T.proxy(view, 'onLogin'));
         */
        proxy: function(obj, func, cature){
            var args = [];
            obj = obj || window;
            var i = 2;
            if(cature == undefined){
                cature = true;
            }else{
                i = 3;
            }
            for(; i < arguments.length; i++) args.push(arguments[i]);
            return function(e){
                if(e && /^\[object\s[A-Z][a-z]+Event\]$/.test(toString.call(e)) && cature){
                    //e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                }
                args.unshift(e);
                //保证传递 Event对象过去
                if(SYST.V.isFunction(func)){
                    return func.apply(obj, args);
                }else if(obj[func])
                    return obj[func].apply(obj, args);
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
         * Function 判断数组或字符串是否存在某元素  存在： 返回该元素索引； 不存在： 返回 -1
         * @param array
         * @param obj
         * @return {*}
         */
        indexOf: function(array, obj) {
            if (array.indexOf) return array.indexOf(obj);
            array = slice.call(array);
            for (var i = 0, len = array.length; i < len; i++)
                if (obj === array[i]) return i;
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
            if(!str)    return '';
            return wordReg.test(str) ?
                str.replace(wordReg, function(match, $1){ return $1.toUpperCase(); }) : str;
        },
        //首字符小写
        toFirstLowerCase: function(str){
            if(!str)    return '';
            return wordReg.test(str) ?
                str.replace(wordReg, function(match, $1){ return $1.toLowerCase(); }) : str;
        },
        /**
         * Function 全角字符转为半角,并去除所有空格
         * @param str
         * @return {String}
         * @constructor
         */
        F2C: function(str){
            var s = "", str = str.replace(/\s*/gi, '');
            for(var i = 0, len = str.length; i < len; i++){
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
         * @param date Date对象 | 时间戳 | 时间字符串，如：1462327561371 或 '2016/5/4 10:03:20'
         * @param format {String} yyyy-mm-dd hh:ii:ss | yyyy-m-d
         * @return {String}
         */
        setDateFormat: function(date, format){
            if(!date) return '';
            var self = this;
            format = format || 'yyyy-mm-dd hh:ii:ss';
            date = (/^\d+$/gi.test(date) || /\d+[\/-]+/gi.test(date)) ? new Date(parseInt(date, 10)) : SYST.V.isDate(date) ? date : null;
            if(!date)   return null;
            format = format.replace(/(y+)/i, function(m){
                var year = '' + date.getFullYear();
                return m.length >= 4 ? year : year.substr(m.length);
            }).replace(/(m+)/i, function(m){
                return _toFormat(m, date.getMonth() + 1);
            }).replace(/(d+)/i, function(m){
                return _toFormat(m, date.getDate());
            }).replace(/(h+)/i, function(m){
                return _toFormat(m, date.getHours());
            }).replace(/(i+)/i, function(m){
                return _toFormat(m, date.getMinutes());
            }).replace(/(s+)/i, function(m){
                return _toFormat(m, date.getSeconds());
            });

            function _toFormat(m, val){
                return m.length > 1 ? self.dateFm(val) : val;
            }

            return format;
        },
        dateFormat: function(date, format){
            return this.setDateFormat(date, format);
        },

        /**
         * 将时间转为中文格式时间
         */
        setDateFormatCN: function(date, format){
            var fs = ['年', '月', '日', '时', '分', '秒', '毫秒'],
                ds = this.setDateFormat(date, format).split(/[-:\s]+/gi);
            if(!ds || ds.length === 0)  return '';
            this.each(ds, function(dv, i){
                ds[i] = (i === 3 ? ' ' : '') + dv + fs[i];
            });
            return ds.join('');

        },
        dateFormatCN: function(date, format){
            return this.setDateFormatCN(date, format);
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
         * Function 获取指定参数或者所有参数列表
         * @param name
         * @param url       传入的url地址
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
            var s = '';
            each(object, function(v, i, k){ s += '&' + k + '=' + encodeURI(v); });
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
         * use: displace('my name is %s, age is %d', 'rodey', 26);
         */
        displace: function(str){
            if(!str) return;
            var index = 0, args = [],
                regx = /\%[s|d|f]+?/gi;
            each(slice.call(arguments, 1), function(arg){  args.push(arg); });
            str = str.replace(regx, function(match){
                return args[index++];
            });
            return str;
        },
        Cookie: Cookie,
        getCookie: function(key){
            return SYST.V.isString(key)
                ? Cookie(key)
                : _Cookies(key);
        },
        setCookie: function(key, value, options){
            return SYST.V.isString(key)
                ? Cookie(key, value, options)
                : _Cookies(key, options);
        },

        /**
         * 遍历对象
         * @param object
         * @param target   回调作用域对象
         * @param callback
         */
        each: each,
        extend: SYST.extend,
        clone: SYST.clone,

        /**
         * 数组转成Object对象
         * @param arr
         * @param key
         * @param flag      是否以数组元素作为Object的key
         * @returns {{}}
         */
        arr2object: function(arr, key, flag){
            var _obj = {};
            if(key){
                _obj[key] = arr;
            }else{
                each(arr, function(v, i){
                    flag ? (_obj[v] = v) : (_obj[i] = v);
                });
            }
            return _obj;
        },
        /**
         * 数组去重
         * @param arr
         * @returns {Array}
         */
        unique: function(arr) {
            var result = [];
            each(arr, function(v){ result.indexOf(v) === -1 && result.push(v); });
            return result;
        },
        /**
         * 合并数组或对象
         * @param v1
         * @param v2
         * @param flag (是否对合并的数据进行去重)
         */
        merge: function(v1, v2, flag){
            var rs;
            if(!v1) return v2;
            if(!v2) return v1;
            if(SYST.V.isArray(v1) && SYST.V.isArray(v2)){
                rs = [].concat(v1, v2);
                rs = (flag === true) ? this.unique(rs) : rs;
            }
            else if(SYST.V.isObject(v1) && SYST.V.isObject(v2)){
                rs = SYST.extend(v1, v2);
            }
            else{
                rs = v1 + v2;
            }
            return rs;
        }
    };

})(SYST);

/**
 * Created by Rodey on 2016/10/24.
 * Dom action
 */

;(function(SYST){

    var fragmentRE = /^\s*<(\w+|!)([^>]*)>/,
        singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
        tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
        table = document.createElement('table'),
        tableRow = document.createElement('tr'),
        containers = {
            'tr': document.createElement('tbody'),
            'tbody': table, 'thead': table, 'tfoot': table,
            'td': tableRow, 'th': tableRow,
            '*': document.createElement('div')
        },
        defDisplayCache = {},
        evtsels = ['focus', 'blur'],
        evtforms = ['submit', 'reset'],
        evts = ['click', 'input', 'dblclick', 'mouseover', 'mouseout', 'keydown', 'keyup', 'change'].concat(evtsels, evtforms),
        stid = 0;
    var ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$|webkitMovement[XY]$)/,
        eventMethods = {
            preventDefault: function(){ window.event && (window.event.returnValue = false); },
            stopImmediatePropagation: function(){ this.stopImmediatePropagation && this.stopImmediatePropagation(); },
            stopPropagation: function(){ window.event && (window.event.cancelBubble = true); }
        };

    function Dom(context, selector){
        this.context = this.target = context;
        this.selector = selector;
        //元素唯一标识
        //!this.context._stid && (this.stid = (this.context._stid = stid++));
        this._init();
    }

    Dom.prototype = {
        //-----public------
        clone: function(){
            return new Dom(this.context.cloneNode.apply(this.context, arguments));
        },
        append: function(content){
            if(!content)    return this;
            if(content && content._dom_){
                SYST.T.each(content, function(n){
                    this.append(n);
                }, this);
            }else{
                this.context.appendChild(this._toNode(content));
            }
            return this;
        },
        appendTo: function(to){
            to && to.appendChild(this.context);
            return this;
        },
        prepend: function(content){
            var firstChild = this.context.firstChild;
            this.context.insertBefore(this._toNode(content), firstChild);
            return this;
        },
        prependTo: function(to){
            var firstChild = to.firstChild || to.childNodes[0];
            firstChild && to.insertBefore(this.context, firstChild);
            return this;
        },
        after: function(content){
            if(!this._parent())   return this;
            var nextNode = this.context.nextElementSibling || this.context.nextSibling;
            this._parent().insertBefore(this._toNode(content), nextNode);
            return this;
        },
        before: function(content){
            if(!this._parent())   return this;
            this._parent().insertBefore(this._toNode(content), this.context);
            return this;
        },
        replace: function(content){
            if(!this._parent())   return this;
            this._parent().replaceChild(this._toNode(content), this.context);
            return this;
        },
        remove: function(){
            if(!this._parent())   return this;
            this._parent().removeChild(this.context);
            return this;
        },
        swap: function(content){
            var node;
            if(SYST.V.isString(content) && SYST.T.trim(content)[0] === '#'){
                node = new Dom(content, content);
            }
            if(content instanceof Dom){
                node = content;
            }
            var cloneNode = node.clone(true);
            var cloneThis = this.clone(true);
            this.replace(cloneNode);
            node.replace(cloneThis);
        },
        empty: function(){
            this.html('');
        },
        attr: function(name, value){
            if(value == undefined)  return this.context.getAttribute(name);
            if(SYST.V.isObject(name)){
                SYST.T.each(Object.keys(name), function(key, i){
                    this.attr(key, name[key]);
                }, this);
            }else{
                this.context.setAttribute(name, value);
            }
            return this;
        },
        removeAttr: function(name){
            this.context.removeAttribute(name);
            return this;
        },
        children: function(selector){
            var rs = [];
            Dom._inJectMethods(rs);
            selector = SYST.T.trim(selector || '');
            var children = this.context.children ?
            slice.call(this.context.children) :
            slice.call(this.context.childNodes).filter(function(node){
                return node.nodeType !== 3;
            });
            children.length > 0 && SYST.T.each(children, function(child){
                var mID = selector[0] === '#',
                    mClass = !mID && selector[0] === '.',
                    nameOnly = mID || mClass ? selector.slice(1) : selector;

                if( !selector
                    || (mID && child.id === nameOnly)
                    || (mClass && slice.call(child.classList).indexOf(nameOnly) !== -1)
                ){
                    rs.push(new Dom(child, selector));
                }
                else if(!mID && !mClass){
                    if(child.tagName == selector.toUpperCase()){
                        rs.push(new Dom(child, selector));
                    }
                }
            }, this);
            return rs;
        },
        childrenAll: function(selector){
            var rs = [];
            Dom._inJectMethods(rs);

            _getChild(this);
            function _getChild(node){
                var childs = node.children(selector);
                childs && childs.length > 0 && SYST.T.each(childs, function(child){
                    rs.push(child);
                    childs = child.children(selector);
                    childs && _getChild(child);
                });
            }
            return rs;

        },
        parent: function(){
            return this._parent() && new Dom(this._parent());
        },
        parents: function(selector){
            var nodes = [],
                node = this.context.parentNode;
            Dom._inJectMethods(nodes);
            while(node){
                if(!SYST.V.isDocument(node) && nodes.indexOf(node) < 0){
                    node.parentNode && nodes.push(node);
                    node = node.parentNode;
                }else{
                    node = null;
                }
            }
            nodes = nodes.filter(function(node){
                var mID = selector.replace(/^#/, ''),
                    mClass = selector.replace(/^./, ''),
                    mAttr = selector.replace(/(\[|\])/g, ''),
                    classMap = slice.call(node.classList) || [],
                    attrMap = node.getAttribute(mAttr),
                    hasAttr = (function(){
                        var _as = mAttr.split('=');
                        return  SYST.$(node).attr(_as[0]) == _as[1];
                    })();
                return selector == node.nodeName || mID == node.id || classMap.indexOf(mClass) > -1 || attrMap || hasAttr;
            });
            nodes = nodes.map(function(context){ return new Dom(context, selector) });
            return nodes;

        },
        next: function(selector){
            var next = [];
            if(!selector){
                if(this.context.nextElementSibling){
                    return new Dom(this.context.nextElementSibling);
                }
            }else{
                next = this._all('nextAll');
            }
            return next;
        },
        nextAll: function(){
            return this._all('nextAll');
        },
        prev: function(selector){
            var prev = [];
            if(!selector){
                if(this.context.previousElementSibling){
                    return new Dom(this.context.previousElementSibling);
                }
            }else{
                prev = this._all('prevAll');
            }
            return prev;
        },
        prevAll: function(){
            return this._all('prevAll');
        },
        siblings: function(){
            var siblings = this.parent().children();
            var index = SYST.T.indexOf(siblings.map(function(node){ return node.context; }), this.context);
            if(index > -1)  siblings.splice(index, 1);
            return siblings;
        },
        find: function(selector){
            var rs = [], result = Dom._qsa(this.context, selector);
            if(SYST.V.isArray(result) || result.length > 0){
                SYST.T.each(slice.call(result), function(context){
                    rs.push(new Dom(context, selector));
                });
            }else{
                result && SYST.V.isElement(result) && rs.push(new Dom(result, selector));
            }
            Dom._inJectMethods(rs);
            return rs;
        },
        show: function(val){
            if(val) {
                this.css('display', val);
            }else{
                this.css('display') == 'none' && this.css('display', '');
                var cssObject = getComputedStyle(this.context),
                    defaultStyle = cssObject.getPropertyValue('display');
                if('none' == defaultStyle){
                    this.css('display', this._getDefaultDisplay(this.context.nodeName));
                }
            }
            return this;
        },
        hide: function(){
            this.css('display', 'none');
            return this;
        },
        toggle: function(){
            return this.context.css('display') == 'none' ? this.show() : this.hide();
        },
        css: function(name, value){
            if(SYST.V.isObject(name)){
                SYST.T.each(name, function(styleVal, i, styleKey){
                    _sty.call(this, _fm(styleKey), styleVal);
                }, this);
            }
            else if(value == null) return this.context.style[name];
            else{
                _sty.call(this, _fm(name), value);
            }
            function _fm(name){
                return name = name.replace(/-([a-z]{1})/gi, function(m, $1){
                    return ($1 || '').toUpperCase();
                });
            }
            function _sty(name, val){
                this.context.style[name] = val;
            }
            return this;
        },
        /**
         * 判断class是否存在
         * @param name
         * @returns {boolean}
         * use:
         *      exp: <p class="tips success"></p>
         *      node.hasClass('tips')           => true
         *      node.hasClass('tips|success')   => true
         *      node.hasClass('tips success')   => true
         *      node.hasClass('tips error')     => false
         *      node.hasClass('tips|error')     => true
         */
        hasClass: function(name){
            var classList = this.context.classList ? slice.call(this.context.classList) : this.context.className.split(/\s+/g),
                isOr = SYST.V.isString(name) ? /\|/.test(name) : false,
                cls = SYST.V.isArray(name) && name || SYST.T.trim(name || '').split(/\s+|\|+|\++/),
                flag = false;

            for(var i = 0; i < cls.length; ++i){
                var index = classList.indexOf('' + cls[i]);
                if(index > -1){
                    if(isOr)    return true;
                    flag = true;
                }else{
                    flag = false;
                }
            }
            return flag;
        },
        addClass: function(name){
            var classList = this.context.classList,
                cls = SYST.V.isArray(name) && name || SYST.T.trim(name || '').split(/\s+/);
            SYST.T.each(cls, function(cn){
                SYST.T.indexOf(classList, cn) < 0 && classList.add(cn);
            }, this);
            return this;
        },
        removeClass: function(name){
            var classList = this.context.classList,
                cls = SYST.V.isArray(name) && name || SYST.T.trim(name || '').split(/\s+/);
            SYST.T.each(cls, function(cn){
                SYST.T.indexOf(classList, cn) > -1 && classList.remove(cn);
            }, this);
            if(classList.length === 0) this.removeAttr('class');
            return this;
        },
        toggleClass: function(name){
            return this.hasClass(name) ? this.removeClass(name) : this.addClass(name);
        },
        html: function(html){
            if(html == null) return this.context.innerHTML;
            if(this.context.nodeType === 3) this.text(html);
            if(SYST.V.isElement(html))  html = html.outerHTML;
            if(Dom._isDom(html))  html = html.context.outerHTML;
            this.context.innerHTML = html;
            return this;
        },
        text: function(text){
            if(!SYST.V.isString(text))
                return this.context.textContent;
            this.context.textContent = text;
            return this;
        },
        val: function(val){
            if(/INPUT|TEXTAREA|SELECT/i.test(this.context.nodeName)){
                if(val == null)    return this.context.value || '';
                else this.context.value = val;
            }
            return this;
        },
        load: function(url, cb){
            SYST.Ajax.load(this.selector, url, cb);
        },
        /**
         * 向上查找元素（事件委托）
         * @param selector  需要侦听事件的元素选择器
         * @param context   当前触发事件的对象（event.target）
         * @returns {Array}
         */
        closet: function(selector, context){
            var nodes = [],
                collection = slice.call(this.find(selector)).map(function(node){ return node.context; }),
                node = context.parentNode;

            // #id
            if(collection.length === 1 && collection[0] === context){
                return collection;
            }

            SYST.T.each(collection, function(node){
                if(node === context){
                    nodes.push(node);
                }
            });
            if(nodes.length > 0)    return nodes;

            while(node && SYST.T.indexOf(collection, node) === -1){
                node = node !== context && !SYST.V.isDocument(node) && node.parentNode;
            }
            if(node && SYST.T.indexOf(nodes, node) < 0){
                nodes.push(node);
            }

            return nodes;
        },

        once: function(event, fn, data, target, selector){
            this.on(event, fn, data, target, selector, true);
        },
        on: function(event, fn, data, target, selector, one, noCache){
            var delegator, handler = {}, autoRemove = fn;
            if(one) {
                autoRemove = function(evt){
                    this._inJectTarget(evt, evt.currentTarget);
                    this._removeEvent([handler], event, fn);
                    return fn.apply(target || this, arguments);
                }.bind(this);
            }
            if(selector){
                delegator = function(evt){
                    var matcher = this.closet(selector, evt.target)[0];
                    this._inJectTarget(evt, matcher || evt.target);
                    return matcher && (autoRemove || fn).apply(target || matcher, [evt, data]);
                }.bind(this);
            }

            var cb = delegator || autoRemove;
            handler.proxy = function(evt){
                evt = this._recombineEvent(evt);
                this._inJectTarget(evt, evt.currentTarget);
                this._inJectProps(evt, { '$data': data });
                var result = cb.apply(target || this, [evt].concat(slice.call(arguments, 1)));
                if(result === false){
                    evt.preventDefault();
                    evt.stopPropagation();
                    evt.stopImmediatePropagation();
                }
                return result;
            }.bind(this);
            handler.delegator = delegator;
            handler.selector = selector;
            handler.container = this.selector;
            handler.fn = fn;
            handler.type = event;

            if(!SYST.Events._cache[event])    SYST.Events._cache[event] = [];
            !noCache && SYST.Events._cache[event].push(handler);
            if('addEventListener' in this.context){
                this.context.addEventListener(event, handler.proxy, false);
            }
            return this;
        },
        off: function(event, selector, fn){
            event = SYST.T.trim(event || '');

            if(!event){
                SYST.T.each(SYST.Events._cache, function(events){
                    this._removeEvent(events, selector);
                }, this);
                SYST.Events._cache = {};
            }else{
                var events = this._getCacheEvent(event, selector, fn);
                this._removeEvent(events, selector);
            }
            return this;
        },
        delegate: function(selector, event, fn, data, target){
            return this.on(event, fn, data, target, selector);
        },
        undelegate: function(selector, event, fn){
            return this.off(event, selector, fn);
        },

        toString: function(){
            return this.context;
        },

        //-----private------
        _init: function(){
            this._mixinEvents();
        },
        _mixinEvents: function(){
            var self = this;
            SYST.T.each(evts, function(event){
                Dom.prototype[event] = function(){
                    var cb = slice.call(arguments)[0];
                    if(evtsels.indexOf(event) > -1 && !cb){
                        self.context[event]();
                    }
                    else if(evtforms.indexOf(event) > -1 && !cb){
                        self._isForm() && self.context[event]();
                    }
                    else{
                        self.on(event, function(e){
                            cb.apply(self, arguments);
                        });
                    }
                    return self;
                };
            });
        },
        _toNode: function(content){
            var frame = document.createDocumentFragment(),
                dom;

            if(SYST.V.isString(content)){
                content = SYST.T.trim(content);
                if(content[0] == '<' && fragmentRE.test(content)){
                    dom = Dom._fragment(content);
                }else{
                    dom = document.createTextNode(content);
                }
            }
            if(content instanceof Dom){
                dom = content.context;
            }
            if(SYST.V.isElement(content)){
                dom = content;
            }

            if(SYST.V.isArray(dom) && dom.length > 0 && dom[0].nodeType){
                SYST.T.each(dom, function(node){
                    node && frame.appendChild(node);
                });
            }else{
                frame.appendChild(dom);
            }
            return frame;
        },
        _removeEvent: function(events, selector){
            events && events.length > 0 && SYST.T.each(events, function(cb){
                //if(selector && cb.selector == selector && cb.delegator){
                //    delete cb.selector;
                //    delete cb.delegator;
                //}
                if('removeEventListener' in this.context){
                    this.context.removeEventListener(cb.type, cb.proxy, false);
                }
                if(SYST.Events._cache[cb.type]){
                    var index = SYST.Events._cache[cb.type].indexOf(cb);
                    if(index > -1){
                        SYST.Events._cache[cb.type].splice(index, 1);
                    }
                }
            }, this);
        },
        _getCacheEvent: function(event, selector, fn){
            var events = event.split(/\s+/),
                cache = [];
            SYST.T.each(events, function(type){
                var es = SYST.Events._cache[type];
                es && SYST.T.each(es, function(event){
                    var mabeId = /^#/.test(selector);
                    if(event.selector == selector
                        && event.type == type
                        && (mabeId || event.container == this.selector)){
                        cache.push(event);
                    }
                }, this);
            }, this);
            return cache;
        },
        _recombineEvent: function(evt, source){
            if (source || !evt.isDefaultPrevented){
                source || (source = evt);

                SYST.T.each(eventMethods, function(func, i, method){
                    var sourceMethod = evt[method];
                    if(!SYST.V.isFunction(sourceMethod)){
                        sourceMethod = func.bind(this);
                    }
                }, this);
            }
            return evt;
        },
        _all: function(type){
            var ns = [], i,
                cs = slice.call(this.parent().children()),
                nextContexts = cs.map(function(dom){ return dom.context; }),
                index = nextContexts.indexOf(this.context);
            if('nextAll' === type){
                for(i = index + 1; i < ns.length; ++i){
                    ns.push(cs[i]);
                }
            }
            else if('prevAll' === type){
                for(i = index - 1; i >= 0; --i){
                    ns.push(cs[i]);
                }
            }
            Dom._inJectMethods(ns);
            return ns;
        },
        _isForm: function(){
            return 'FORM' === this.context.nodeType && this.context.action;
        },
        _parent: function(){
            return this.context.parentNode;
        },
        _getDefaultDisplay: function(tagName){
            if(defDisplayCache[tagName])    return defDisplayCache[tagName];
            var tempEl = document.createElement(tagName);
            document.body.appendChild(tempEl);
            var display = getComputedStyle(tempEl).getPropertyValue('display');
            defDisplayCache[tagName] = display;
            tempEl.parentNode.removeChild(tempEl);
            return display;
        },
        _inJectProps: function(object, props){
            if(SYST.V.isObject(props)){
                SYST.T.each(props, function(pv, i, pn){
                    object[pn] = pv;
                });
            }
        },
        _inJectTarget: function(object, value){
            this._inJectProps(object, { '$target': new Dom(value) });
        }
    };

    Dom._qsa = function(element, selector){
        var mID = selector[0] === '#',
            mClass = !mID && selector[0] === '.',
            nameOnly = mID || mClass ? selector.slice(1) : selector,
            isSimple = /^[\w-]*$/.test(nameOnly),
            elements;

        if(isSimple && mID){
            elements = element.querySelector(selector);
        }
        else if(element.nodeType !== 1 && element.nodeType !== 9 && element.nodeType !== 11){
            elements = null;
        }
        else{
            if(isSimple && !mID && SYST.V.isElement(element)){
                if(mClass){
                    elements = element.getElementsByClassName(nameOnly);
                }else{
                    elements = element.getElementsByTagName(nameOnly);
                }
            }else{
                elements = element.querySelectorAll(selector);
            }
        }
        return elements;
    };
    Dom._fragment = function(html, name){
        var doms, container;
        if(singleTagRE.test(html))  doms = document.createElement(RegExp.$1);

        if(!doms){
            if(html.replace)            html = html.replace(tagExpanderRE, "<$1></$2>");
            if(name === undefined)      name = fragmentRE.test(html) && RegExp.$1;
            if(!(name in containers))   name = '*';

            container = containers[name];
            container.innerHTML = '' + html;
            doms = slice.call(container.childNodes);
            return !doms[1] ? doms[0] : doms;
        }
        return doms;
    };
    Dom._inJectMethods = function(list){
        var prototypes = Dom.prototype, ms = ['_init', '_mixinEvents'];
        if(!SYST.V.isArray(list))   return;
        SYST.T.each(prototypes, function(method, i, name){
            if(ms.indexOf(name) === -1){
                def(list, name, function(){
                    var args = slice.call(arguments), rs = [], result;
                    SYST.T.each(list, function(node){
                        if(evts.indexOf(name) !== -1){
                            node.on.apply(node, args);
                        }else{
                            result = method.apply(node, args);
                            if(SYST.V.isArray(result)){
                                rs = rs.concat(result);
                            }
                            if(!result._dom_){
                                return result;
                            }
                        }
                    });
                    if(evts.indexOf(name) !== -1){
                        return list;
                    }
                    if(rs && rs.length > 0){
                        Dom._inJectMethods(rs);
                        return rs;
                    }
                    return list;
                });
            }
        });
        def(list, 'get', function(index){
            var node = this[index];
            return node && node.context;
        });
        def(list, 'eq', function(index){
            return this[index];
        });
        def(list, '_dom_', function(){ return true; });
    };
    Dom._isDom = function(dom){
        return dom instanceof Dom || dom.__dom__;
    };

    SYST.Dom = SYST.$ = function(selector){
        if(!selector)   return null;
        var element;
        if(SYST.V.isFunction(selector)){
            return SYST.ready(selector);
        }
        if(!SYST.V.isString(selector)){
            if(SYST.V.isWindow(selector)){
                element = document;
            }
            else if(SYST.V.isElement(selector)){
                element = selector;
            }else{
                return null;
            }
            return new Dom(element, selector);
        }

        selector = SYST.T.trim(selector);

        if('body' == selector){
            element = document.body;
        }
        else if('document' == selector){
            element = document;
        }
        else if('html' == selector){
            element = document.querySelector('html');
        }
        else if(selector[0] == '<' && fragmentRE.test(selector)){
            element = Dom._fragment(selector);
        }
        else{
            element = Dom._qsa(document, selector);
            if(element && element.length && !SYST.V.isElement(element))
                element = slice.call(element);
            if(!element || element.length === 0)    return null;
        }

        if(SYST.V.isArray(element) && element.length > 0){
            var rs = [];
            SYST.T.each(element, function(node){
                rs.push(new Dom(node, selector));
            });
            Dom._inJectMethods(rs);
            return rs;
        }else{
            return element ? new Dom(element, selector) : null;
        }
    };

})(SYST);

;(function(SYST){

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

;(function(SYST){

    var empty = function(){},
        defaults = {
            url: '',
            data: {},
            type: 'GET',
            dataType: 'json',
            async: true,
            crossDomain: false,
            cache: true,
            timeout: 0,
            contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
            accept: '*/*',
            headers: {},
            target: null,
            before: empty,
            success: empty,
            error: empty,
            complete: empty,
            stop: empty
        };

    function Ajax(options, callTarget){
        this.option = SYST.extend(defaults, options);
        this.response = null;
        this.target = callTarget || this.option.target || this;
        this.option.type = this.option.type.toUpperCase();
        this._init();
    }

    Ajax.prototype = {
        _init: function(){
            this.xhr = new XMLHttpRequest();
        },
        _onChangeState: function(){
            this.readyState = this.xhr.readyState;
            this.status = this.xhr.status;

            if(this.readyState == 4){
                this._close();
                if(this.status >= 200 && this.status <= 300){
                    if(this.xhr.responseType == 'arraybuffer' || this.xhr.responseType == 'blob'){
                        this.response = this.xhr.response;
                        this._onSuccess();
                    }else{
                        this._formatResponse(this.xhr.responseText);
                    }
                }else{
                    this._onError(this.status ? 'error' : 'abort', this.xhr.statusText);
                }
            }
        },
        send: function(body){
            var formData = this._toFormData(body || this.option.data),
                url = this.option.url;
            if(this.option.type === 'GET'){
                url = this.option.url + (this.option.url.indexOf('?') === -1 ? '?' : '&') + formData;
                url = url.replace(/[\?|\&]$/, '');
            }
            this.xhr.open(
                this.option.type,
                url,
                this.option.async,
                this.option.username,
                this.option.password
            );
            this.option.type !== 'POST' && this.setHeader('Content-Type', this.option.contentType);
            !this.option.crossDomain && this.setHeader('X-Requested-With', 'XMLHttpRequest');
            this.setHeaders(this.option.headers || {});
            this.setHeader('Accept', this.option.accept);
            if(this.option.mimeType && this.xhr.overrideMimeType){
                this.xhr.overrideMimeType(this.option.mimeType);
            }
            //提交前触犯
            if(this.option.before.apply(this.target, this._toParameters()) === false) return;
            this.xhr.onreadystatechange = this._onChangeState.bind(this);
            this.xhr.onload = this._onChangeState.bind(this);
            this.xhr.send(formData);
            if(this.option.timeout > 0)
                this._stim = setTimeout(function(){
                    this.off('timeout');
                }.bind(this), this.option.timeout);
        },
        on: function(event, handler){
            event = event.toUpperCase();
            handler = handler || empty;
            switch (event){
                case 'AJAX_BEFORE':
                    this.option.before = handler;
                    break;
                case 'AJAX_SUCCESS':
                    this.option.success = handler;
                    break;
                case 'AJAX_ERROR':
                    this.option.error = handler;
                    break;
                case 'AJAX_COMPLETE':
                    this.option.complete = handler;
                    break;
                default: break;
            }
            return this;
        },
        off: function(event, handler){
            if(event === 'abort' || event === 'timeout'){
                this._close();
                this.xhr.abort();
                this._onError(event);
            }
            if(handler) this.option.stop = handler;
            if(!SYST.V.isFunction(this.option.stop)){
                this.option.stop.apply(this.target, [this.xhr, 'stop']);
            }
            return this;
        },
        setHeader: function(name, value){
            this.xhr.setRequestHeader(name, value);
        },
        setHeaders: function(headers){
            SYST.T.each(headers, function(value, i, name){
                this.setHeader(name, value);
            }, this);
        },
        _close: function(){
            if(this._stim){
                clearTimeout(this._stim);
                this._stim = null;
            }
            this.xhr.onload = this.xhr.onerror = this.xhr.onreadystatechange = null;
        },
        _toParameters: function(status){
            return [this.response, this.xhr, status];
        },
        _toFormData: function(body){
            if(SYST.V.isString(body))   return body;
            var formData;
            if(this.option.type === 'POST' && window.FormData){
                formData = new window.FormData();
                SYST.T.each(body, function(v,i,k){
                    formData.append(k, v);
                }, this);
            }else{
                formData = SYST.T.serialize(body);
            }
            return formData;
        },
        _formatResponse: function(text){
            var result = text,
                dataType = this.option.dataType || (function(dt){
                        return dt.split(';')[0].split('/')[1];
                    })(this.xhr.getResponseHeader('content-Type')),
                error,
                domParser = new DOMParser();

            if(dataType == 'xml'){
                result = domParser.parseFromString(text, 'text/xml');
            }
            else if(dataType == 'html'){
                result = domParser.parseFromString(text, 'text/html');
            }
            else if(dataType == 'json'){
                try{
                    result = JSON.parse(text);
                }catch(e){
                    error = e;
                }
            }else{}

            this.response = result;
            error ? this._onError('parseError') : this._onSuccess();
        },
        _onSuccess: function(){
            this.option.success.apply(this.target, this._toParameters('success'));
            this._onComplete('success');
        },
        _onError: function(type, statusText){
            type = type || 'error';
            this.option.error.apply(this.target, [this.xhr, type, statusText]);
            this._onComplete(type);
        },
        _onComplete: function(type){
            this.option.complete.apply(this.target, [this.xhr, type || 'error']);
        }
    };

    function _request(type, dataType, url, data, success, error, option){
        var s = {url: url, data: data, type: type, dataType: dataType};
        s = SYST.extend(s, option || {});
        var ajax = new Ajax(s);
        ajax.on('AJAX_SUCCESS', success).on('AJAX_ERROR', error);
        ajax.send();
        return ajax;
    }

    function _load(loadType, dom, url, success, error, option){
        dom = /^#/.test(dom) ? [document.querySelector(dom)] : /^\./.test(dom) ? document.querySelectorAll(dom) : null;
        if(!dom)    throw 'no found elements';
        return Ajax.get(url, null, function(res){
            SYST.T.each(dom, function(element){
                element.innerHTML = res;
            });
            if(loadType == 'html'){
                var div = document.createElement('div');
                div.innerHTML = res;
                res = div;
            }
            success(res);
        }, function(err, xhr){
            SYST.V.isFunction(error) && error(err, xhr);
        }, SYST.extend(option, {dataType: 'text'}) );
    }
    Ajax.ajax = function(url, options){
        options = options || {};
        if(!SYST.V.isString(url)){
            options = url; url = undefined;
        }else{
            options.url = url;
        }
        var ajax = new Ajax(options);
        ajax.send();
        return ajax;
    };
    Ajax.post = function(url, data, success, error, option){
        return _request('POST', null, url, data, success, error, option);
    };
    Ajax.get = function(url, data, success, error, option){
        return _request('GET', null, url, data, success, error, option);
    };
    Ajax.getJSON = function(url, data, success, error, option){
        return _request('GET', 'json', url, data, success, error, option);
    };
    Ajax.load = function(dom, url, success, error, option){
        return _load('text', dom, url, success, error, option);
    };
    Ajax.loadHTML = function(dom, url, success, error, option){
        return _load('html', dom, url, success, error, option);
    };
    Ajax.fetch = function(url, init, type){
        init = init || {};
        var headers = init['headers'] || {},
            method = (init['method'] || 'post').toUpperCase(),
            body = init['body'];
        if(!'fetch' in window){
            var p = new SYST.Promise();
            var setting = SYST.extend(init, {
                url: url,
                data: body,
                type: method,
                dataType: type,
                success: function(res){ p.resolve(res); },
                error: function(err){   p.reject(err);  }
            });
            Ajax.ajax(setting);
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
                return SYST.V.isFunction(res[type]) ? res[type]() : null;
            });
        }
    };

    SYST.Ajax = SYST.S = Ajax;

})(SYST);

/**
 * Created by Rodey on 2016/4/15.
 * Http 相关
 */

;(function(SYST){

    SYST.httpConfig = {};
    var Http = function(){
        this.__instance_SYST__ = 'SYST Http';
        this.__name__ = 'SYST Http';
    };
    SYST.Http = SYST.Request = function(){
        var http = SYST.extendClass(arguments, Http);
        http._initialize();
        return http;
    };

    var Ajax = SYST.Ajax;

    Http.prototype = {
        _initialize: function(){
            this.init && this.init.apply(this);
        },
        ajax: Ajax.ajax,
        get: Ajax.get,
        getJSON: Ajax.getJSON,
        post: Ajax.post,
        /**
         * Function 通用AJAX请求方法
         * @param url
         * @param postData
         * @param su
         * @param fail
         */
        doRequest: function(url, postData, su, fail, options){
            var type, dataType, commonData, commonHandler, setting = {}, callTarget;
            if(!postData || !SYST.V.isObject(postData) || !url) return;
            //记录当前ajax请求个数
            type = this.type || SYST.httpConfig.type || 'GET';
            dataType = this.dataType || SYST.httpConfig.dataType || 'json';
            commonData = this.commonData || SYST.httpConfig.commonData || {};
            callTarget = this.target || this;

            var ajaxBefore      = this.ajaxBefore   || SYST.httpConfig.ajaxBefore,
                ajaxSuccess     = this.ajaxSuccess  || SYST.httpConfig.ajaxSuccess,
                ajaxError       = this.ajaxError    || SYST.httpConfig.ajaxError,
                ajaxComplete    = this.ajaxComplete || SYST.httpConfig.ajaxComplete,
                ajaxEnd         = this.ajaxEnd      || SYST.httpConfig.ajaxEnd;

            if(SYST.V.isObject(options)){
                setting = options;
                commonHandler = options['commonHandler'];
                callTarget = options['callTarget'] || this;
            }

            var ajaxSetting = SYST.extend({
                url: url,
                type: type,
                data: SYST.extend(postData, commonData),
                dataType: dataType,
                before: ajaxBefore,
                success: function(){
                    //console.log('请求成功', res);
                    end(arguments);
                    //如果ajaxSuccess返回false 则将阻止之后的代码运行
                    var rs = success.apply(callTarget, arguments);
                    rs !== false && SYST.V.isFunction(su) && su.apply(callTarget, arguments);
                },
                error: function(){
                    //console.log('请求失败');
                    end(arguments);
                    //如果ajaxError返回false 则将阻止之后的代码运行
                    var rs = error.apply(callTarget, arguments);
                    rs !== false && SYST.V.isFunction(fail) && fail.apply(callTarget, arguments);
                },
                complete: ajaxComplete
            }, setting);
            function success(){
                var su;
                SYST.V.isFunction(ajaxSuccess) && (su = ajaxSuccess.apply(callTarget, arguments));
                return su;
            }
            function error(){
                var err;
                SYST.V.isFunction(ajaxError) && (err = ajaxError.apply(callTarget, arguments));
                return err;
            }
            function end(){
                SYST.V.isFunction(commonHandler) && commonHandler.call(callTarget);
                var end;
                SYST.V.isFunction(ajaxEnd) && (end = ajaxEnd.apply(callTarget, arguments));
                return end;
            }

            this.ajax(ajaxSetting);
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
        load: Ajax.load,
        loadHTML: Ajax.loadHTML,
        /**
         * HTML5 fetch api
         * use: fetch(url, data, type)
         */
        fetch: Ajax.fetch,

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
        },

        /**
         * 根据api对象自动生成对象方法
         * @param apis
         */
        generateApi: function(apis, options){
            SYST.V.isObject(apis) && SYST.T.each(apis, function(url, i, key){
                this._generateApi(key, url, options);
            }, this);
        },
        _generateApi: function(key, url, options){
            var self = this;
            options = SYST.V.isObject(options) && options || {};
            function _vfn(postData, su, fail, opts, target){
                options = SYST.extend(options, opts || {});
                options.callTarget = target || this.target || options.callTarget || this;
                this.doAjax(url, postData, su, fail, options);
            }
            ('defineProperty' in Object)
                ? Object.defineProperty(self, key, { value: _vfn.bind(this) })
                : (self[key] = _vfn);
        }

    }

})(SYST);

/**
 * Created by Rodey on 2015/10/16.
 */

;(function(SYST){

    /**
     * SYST Template Render mini engine
     * @type {{open: string, close: string}}
     */
    SYST.tplConfig = { open: '<%', close: '%>'};
    var lineFeedRegx = /\\|\'|\r|\n|\u2028|\u2029/g,
        body = '([\\s\\S]+?)',
        empty = /^=+\s*|\s*$/gi,
        commentRegx = /("([^\\\"]*(\\.)?)*")|('([^\\\']*(\\.)?)*')|(\/{2,}.*?(\r|\n|$))|(\/\*(\n|.)*?\*\/)/g,
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
        var keys = Object.keys(rgs);
        for(var i = 0; i < keys.length; ++i){
            rs.push(rgs[keys[i]].source);
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

    var _includeReg = /^include\(\s*([^,]+?)\s*,\s*([^,]+?)\s*\)/i,
        _fnNameReg = /^function([^\(]+?)\(/i;
    function getFnCode(method, methodName){
        var fnString = method.toString();
        fnString = fnString.replace(commentRegx, function(code){
            return /^\/{2,}/.test(code) || /^\/\*/.test(code) ? "" : code;
        });

        if(_fnNameReg.test(fnString) || !method.name){
            fnString = fnString.replace(_fnNameReg, function(m, c){
                var name = !SYST.T.trim(c) && methodName;
                return 'var ' + name + ' = function '+ name +'(';
            });
        }

        //if(!method.name){
        //    fnString = fnString.replace(_fnNameReg, function(m, $1){
        //        if(!SYST.T.trim($1)){
        //            return 'var '+ methodName +' = function (';
        //        }
        //    });
        //}
        fnString += '.bind(this);';
        return fnString;
    }

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
            $tplString = 'var $_H=$h,$_D=$d,_s="";for(var n in $_D){eval("var "+n+"=$_D[\'"+n+"\'];");} ' +
                'if($_H && SYST.V.isObject($_H)){ for(var h in $_H){ eval("var "+h+"=$_H[\'"+h+"\'];"); } }',
            index = 0;
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
        //生成 Function 主体字符串
        var source, text;
        for(var i = 0; i < $source.length; ++i){
            source = $source[i];
            text = $text[i + 1];
            //转移处理
            if(/^\s*={2}/i.test(source) || /^\s*=>/i.test(source)){
                source = source.replace(empty, "");
                source = 'if(null !=('+ source +')){_s+=(SYST.T.escapeHtml('+ source +'));}else{ _s+="";}';
            }
            else if(/^=[^=]+?/i.test(source)){
                source = source.replace(empty, "");
                source = 'if(null !=('+ source +')){_s+=('+ source +');}else{_s+="";}';
            }
            //include file
            else if(_includeReg.test(source)){
                var stiv;
                source.replace(_includeReg, function(match, src, selector){
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
        }

        //遍历数据
        $tplString = ''+ $tplString +'return _s;';
        //$tplString = $tplString.replace(/[\n\r\t]/gi, '');

        //创建function对象
        var render = new Function('$d', '$h', $tplString);
        _tplCache[_content] = render;
        //执行渲染方法
        return render.call(target || this, data, helper);
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

        if(content == null){
            throw new SyntaxError('no found template content(string or node)');
        }

        var element, tplContent = '', id, render;
        _content = content;
        if(_tplCache[_content]){
            render =  _tplCache[_content];
            //执行渲染方法
            return render.call(target || this, data, helper);
        }
        //重置配置
        _reset(options);

        //如果直接是模板字符串或者html字符串
        if(/[<|>|\/]/gi.test(content) || regxs.execter.test(content)){
            tplContent = SYST.T.trim(content);
        }
        //content为element id
        else{
            if(SYST.V.isElement(content)){
                element = content;
            }
            else if(SYST.V.isString(content)){
                id = content.replace(/^#/i, '');
                element = document.getElementById(id);
            }
            if(element){
                var tplStr = /^(TEXTEREA|INPUT)$/i.test(element.nodeName) ? element.value : (element.innerHTML || element.textContent);
                tplContent = SYST.T.trim(tplStr);
            }
        }
        if(!tplContent) return '';
        return _template(tplContent, data, helper, target);

    };
    Render.getFnSourceCode = getFnCode;
    Render.template = _template;

    SYST.Render = Render;
    SYST.T.render = Render;

})(SYST);
;(function(SYST){

    function _listener(obj, evt, handler, type, trigger){
        if(!evt) throw new ReferenceError('Event name is must');
        var type = type || 'on';
        if(!obj) obj = window;

        //对象事件侦听
        if(_isWindow(obj.selector)){
            (type == 'on')
                ? SYST.Dom(window).off().on(evt, handler)
                : SYST.Dom(window).off(evt, handler);
        }else if(_isBuilt(obj.selector)){
            (type == 'on')
                ? SYST.Dom(obj.selector).off().on(evt, handler)
                : SYST.Dom(obj.selector).off(evt, handler);
        }else{
            var delegate = SYST.Dom(trigger || 'body');
            if(SYST.V.isArray(delegate)){
                SYST.T.each(delegate, function(dgt){
                    (type == 'on')
                        ? dgt.undelegate(obj.selector, evt, handler)
                            .delegate(obj.selector, evt, handler)
                        : dgt.undelegate(obj.selector, evt, handler);
                });
            }else{
                (type == 'on')
                    ? delegate.undelegate(obj.selector, evt, handler)
                        .delegate(obj.selector, evt, handler)
                    : delegate.undelegate(obj.selector, evt, handler);
            }
        }
    }

    function _addListener(obj, evt, func, type, trigger){
        if(!obj)    return;
        if(SYST.V.isArray(obj)){
            SYST.T.each(obj, function(dom){
                _listener(dom, evt, func, type, trigger);
            }, this);
        }else{
            _listener(obj, evt, func, type, trigger);
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
     * @context    this作用域被替换对象
     * @evt     事件名称
     * @func    事件函数
     * @type {Function}
     */
    var Events = function(obj, evt, func, type, trigger){
        _addListener(obj, evt, func, type, trigger);
    };
    // static
    Events.initEvent = function(obj, evt, func, type, trigger){
        _addListener(obj, evt, func, type, trigger);
    };
    Events.cache = {};
    Events._cache = {};

    SYST.Events = Events;

})(SYST);

/**
 * Created by r9luox on 2016/11/7.
 * Object.observe
 */
;(function(SYST){

    var Observe = function(value, target){
        this.value = value;
        this.type = 'none'; // add update delete none
        this.name = null;
        this.oldValue = null;
        this.object = this.value;
        this.changer = {
            type: 'none',
            name: null,
            oldValue: null,
            newValue: null,
            object: this.value,
            target: this,
            tier: ''
        };
        this.target = target;
        !this.__ob__ && (this.__ob__ = this);
        def(this.value, '__ob__', this);
        this.bindNodes = [];
        this._init();
    };

    Observe.prototype = {
        onWatch: function(cb){
            this.callback = cb;
        },
        _init: function(){
            this._setOldValue(this.value);
        },
        _defineded: function(target, key, value){
            var self = this;
            var defConfig = Object.getOwnPropertyDescriptor(target, key);
            if(defConfig && defConfig.configurable === false){
                return false;
            }
            var _getter = defConfig && defConfig.get;

            Object.defineProperty(target, key, {
                enumerable: true,
                configurable: true,
                get: function getter(){
                    var old = _getter ? _getter.call(this) : self._oldValue[key];
                    if(SYST.V.isArray(old)){
                        if(!old.__ob__){
                            self._inJectMethods(old, key);
                            old.__ob__ = self;
                        }
                    }
                    return old;
                },
                set: function setter(newValue){
                    var old = value || self._oldValue[key];
                    if(newValue === old){
                        self._setChanger('none', key, newValue);
                    }else{
                        self._setChanger('update', key, newValue, old);
                        self._oldValue[key] = newValue;
                    }
                }
            });
        },
        addNode: function(node){
            this.bindNodes.push(node);
        },
        added: function(key, val){
            this._setChanger('add', key, val);
        },
        deleted: function(key){
            this._setChanger('delete', key);
        },
        update: function(key, val){
            this._setChanger('update', key, val);
        },
        none: function(key, val){
            this._setChanger('none', key, val);
        },
        _setChanger: function(type, name, val, old){
            this.changer.type = type;
            this.changer.name = name;
            this.changer.oldValue = old;
            this.changer.newValue = val;
            this.changer.tier = this.value['__tier__'] || this.value[name]['__tier__'] || '';
            if(SYST.T.indexOf(['add', 'update'], type) > -1){
                SYST.Observe(val, this.callback, this.target);
            }
            this._callback();
        },
        _callback: function(){
            var fn = SYST.V.isFunction(this.callback) ? this.callback : function(){};
            fn.call(this.target || this, this.changer);
        },
        _setOldValue: function(value){
            this._oldValue = {};
            if(SYST.V.isObject(value)){
                for(var k in value){
                    this._oldValue[k] = value[k];
                    this._defineded(this.value, k);
                }
            }
            else if(SYST.V.isArray(value)){
                this._inJectMethods(value, this.tier || value['__tier__']);
            }

        },
        /**
         * 对数组对象进行操作，自动更新
         * @param array
         * @param key
         * @returns {*}
         * @private
         * array.push(item)、array.pop(item)...
         */
        _inJectMethods: function(array, key){
            var self = this;
            var props = Array.prototype;
            var methods = ['pop', 'shift', 'unshift', 'push', 'splice', 'sort', 'reverse'];
            SYST.T.each(methods, function(method){
                def(array, method, function(){
                    var args = props.slice.call(arguments);
                    var rs = props[method].apply(array, args);
                    self.target.props[key] = array;
                    return rs;
                });
            }, this);
            //get(index)
            def(array, 'get', function(index){
                self.target.props[key] = self.value[key];
                return this[index];
            });
            // query(value, key)
            def(array, 'query', function(val, key){
                var index = -1;
                SYST.T.each(this, function(item, i){
                    if(val == item[key]){
                        index = i;
                    }
                });
                return index > -1 ? this[index] : null;
            });
            //insert(index, item)
            def(array, 'insert', function(index, item){
                var args = [index, 0].concat(props.slice.call(arguments, 1));
                this.splice.apply(this, args);
                self.target.props[key] = this;
                return this;
            });
            //remove(item)
            //remove(value, key)
            def(array, 'remove', function(item, key){
                var index = -1;
                if(!key){
                    index = SYST.T.indexOf(this, item);
                }else{
                    SYST.T.each(this, function(val, i, k){
                        if(item == val[key]){
                            index = i;
                        }
                    });
                }
                if(index > -1){
                    this.splice.apply(this, [index, 1]);
                    self.target.props[key] = this;
                }
                return this;
            });
            return array;
        }
    };

    SYST.Observe = function(value, cb, target, tier){
        if(value && value['__ob__']) return;

        if(SYST.V.isObject(value) || SYST.V.isArray(value)){
            _toWatch(value, tier);
        }

        function _toWatch(v, tier){
            _setTier(v, tier);
            var _observe = new Observe(v, target || v);
            _observe.onWatch(cb);
        }

        function _setTier(obj, tier){
            def(obj, '__tier__', tier);
        }

    };

})(SYST);


/**
 * Created by r9luox on 2016/4/28.
 * Model props watcher
 * 数据绑定 监听对象
 * 监听数据变化，实时更新UI
 */

;!(function(SYST){

    var _$ = SYST.$,
        reg = /\{\{\s*=*?\s*([^\{]*?)\s*\}\}/gi,
        getReg = function(mode){ return new RegExp(reg.source, mode || 'gi');  },
        isIE9 = SYST.N.UA.indexOf('msie 9.0') > 0,
        notValReg = /^[^\w]*/gi,
        toArrReg = /\s*[,\|\/\\-_]\s*/gi,
        filterReg = /\s*\|\s*/gi,
        fnParamsReg = /\s*(\(([^\)]*?)\))\s*/,
        builtReg = function(){ return /\$(value|item|key|first|last|index)/gi; },
        tplConfig = { open: '{{', close: '}}' },
        wait = 50,
        trimAttrValue = function(str){
            return SYST.T.rtrim((str || '').replace(/[\s\{\}]*/gi, ''), '|');
        },
        isTemplate = function(el){
            return (/TEMPLATE|SCRIPT|STYLE/i.test(el.tagName)) ? true : false;
        };

    var st_model = 'st-model',
        st_prop = 'st-prop',
        st_template = 'st-template',
        st_style = 'st-style',
        st_for = 'st-for',
        st_option = 'st-option',
        st_if = 'st-if',
        st_else = 'st-else',
        st_show = 'st-show',
        st_hide = 'st-hide',
        st_on = 'st-on';

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

        add: function(propName, value){
            SYST.T.each(this.bindModelTags, function(tag){
                if(!isTemplate(tag)){
                    tag.removeAttribute(st_model);
                    this._getBindNodes(tag, propName);
                }
            }, this);
            this.update(propName, value);
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
                    this.model._props[propName] = propValue;
                }
                this._createVM();
                //同步更新绑定样式
                this.updateBindTextAndAttrNodes(propName);
                this.updaateBindDisplay(propName);
                this.updateBindProps(propName);
                this.updateBindStyles(propName);
                this.updateBindRepeats(propName);
                this.updateRenderTemplate();
            }

            this._removeStLockNodes();
        },
        //重新获取监听属性tag
        reset: function(model){
            this._reset(model);
            //如果 props key 存在
            //只更新 props对应的key
            this._getModelTags();

        },
        updateBindTextAndAttrNodes: function(propName){
            //同步更新文本节点
            this._makeBindTextNodes(propName);
            //同步更新属性节点
            this._makeBindAttrNodes(propName);
        },
        updateBindProps: function(propName){
            if(propName && !this.bindElements[propName])    return;
            this._makeProps(propName);
        },
        updateRenderTemplate: function(propName, data){
            this._makeBindTemplates(propName, data);
        },
        updateBindStyles: function(propName){
            if(propName && !this.bindStyles[propName])    return;
            this._makeStyles(propName);
        },
        updateBindRepeats: function(propName){
            if(propName && !this.bindRepeats[propName])    return;
            this._makeRepeats(propName);
        },
        updaateBindDisplay: function(propName){
            this._makeDisplays(propName);
        },
        updateBindEvents: function(){
            this._makeBindEvents();
        },

        //------------------------Private----------------------
        _init: function(){
            if(!this.model._props)
                return this;
            this._getModelTags();

        },
        _reset: function(model){
            this.model = model || this.model;
            this._createVM();
            //st-model in element attribute
            this.bindModelTags = [];
            //prop expression text node
            this.bindTextNodes = [];
            //prop in element attribute
            this.bindAttrNodes = [];
            //prop is key, elements is value
            this.bindElements = {};
            //bind templates as tag id
            this.bindTemplates = {};
            //bind styles as st-style tag
            this.bindStyles = {};
            //bind repeat data as st-repeat tag
            this.bindRepeats = {};
            //bind st-if st-else st-show st-hide
            this.bindDisplayNodes = { 'st-if': {}, 'st-else': {}, 'st-show': {}, 'st-hide': {}};
        },
        _createVM: function(){
            this.vm = Object.create(this.model);
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
            var $mid = this.vm.$mid, mId = $mid[0] === '#', mClass = $mid[0] === '.';
            this.bindModelTags = this.bindModelTags.length > 0
                ? this.bindModelTags
                : (function(){
                if(mId || mClass){
                    return document.querySelectorAll($mid);
                }else{
                    return document.querySelectorAll('['+ st_model +'='+ $mid +']');
                }
            }.bind(this))();

            SYST.T.each(this.bindModelTags, function(tag){
                if(!isTemplate(tag)){
                    tag.removeAttribute(st_model);
                    this._getBindAction(tag);
                    this._getBindNodes(tag, propName);
                }
            }, this);

            this._makeBindTextNodes(propName);
            this._makeBindAttrNodes(propName);
            this._makeDisplays(propName);

            //st-lock
            this._removeStLockNodes();
        },
        _getBindNodes: function(node, propName){
            if(node.nodeType === 3 && SYST.T.trim(node.textContent) === '') return;
            var children = node.childNodes;
            if(this._getAttr(node, st_for)){
                this._getBindAction(node);
                this._getBindRepeats(node, propName);
                this._isSelectTag(node) && this._getAttr(node, st_prop) && this._getBindElements(node);
                return this;
            }
            if(this._getAttr(node, st_option)){
                this._getBindAction(node);
                return this;
            }
            if(children.length > 0){
                for(var i = 0; i < children.length; ++i){
                    if(this._getAttr(node, st_model) || children[i].nodeType === 8)   continue;
                    this._getBindAction(node);
                    this._getBindElements(node);
                    if(this._getAttr(node, st_template) || isTemplate(node))   break;
                    if(this._getAttr(node, st_for))   break;
                    //递归查找
                    this._getBindNodes(children[i]);
                }
            }else{
                this._getBindAction(node);
                //textNode nodeType = 3
                this._getBindTextNodes(node);
                //element node st-prop
                this._getBindElements(node);
                //element node st-template
                this._getBindTemplates(node);
            }
        },
        _getBindAction: function(node){
            //element attribute node
            this._getBindAttrNodes(node);
            //element node st-style
            this._getBindStyles(node);
            //element node st-show st-hide st-if st-else
            this._getBindDisplays(node);
            //element node st-on event
            this._getBindEvents(node);
        },
        _removeStLockNodes: function(){
            //显示
            var stLockNodes = _$('[st-lock]');
            stLockNodes && stLockNodes.length > 0 && SYST.T.each(stLockNodes, function(node){
                node.removeAttr('st-lock');
                node.show();
            });
        },

        //======================== text node ======================================
        _getBindTextNodes: function(node){
            var nodeType = node.nodeType,
                parentNode = node.parentNode,
                textContent = SYST.T.trim(node.textContent);
            if(nodeType !== 3)  return;
            //根据标签元素中内容查找 绑定元素
            if(parentNode && (parentNode.getAttribute(st_for) ||
                (parentNode.ve && parentNode.ve.getAttribute(st_for)))) return;
            if(nodeType === 3 && textContent && getReg().test(textContent) && !(builtReg().test(textContent))){

                this._cloneVeNode(node);
                node.ve.raw = textContent.substr(0);
                this._toBindTextNodes(node);
            }
        },
        _toBindTextNodes: function(node){
            if(SYST.T.indexOf(this.bindTextNodes, node) === -1){
                this.bindTextNodes.push(node);
            }
        },
        _makeBindTextNodes: function(propName, nodes){
            var _nodes = nodes || this.bindTextNodes;
            if(propName && (!_nodes || !_nodes.length === 0)) return;

            SYST.T.each(_nodes, function(textNode){
                this._renderBindText(propName, textNode);
            }, this);
        },
        _renderBindText: function(propName, node){
            var ve = node.ve,
                raw = ve.raw,
                templateStr, renderTEXT, hs;

            var renderTemplate = this._getRenderTemplate(raw);
            templateStr = renderTemplate.template;
            hs = this._mergeHelpers(renderTemplate.helpers);

            renderTEXT = SYST.T.render(templateStr, this.vm.props, hs, tplConfig, this.vm);
            node.textContent = renderTEXT;
        },

        //======================== element attributes =============================
        /**
         * 根据标签属性中含有被绑定属性，并以模板形式呈现的，如：<div data-name={{ prop }} ></div>
         * @param bindTag
         * @private
         */
        _getBindAttrNodes: function(node){
            if(node.nodeType !== 1)   return;

            var attributes = node.attributes;
            if(attributes.length > 0){
                SYST.T.each(attributes, function(attrNode){
                    var textContent = attrNode.textContent;
                    if(getReg().test(textContent) && !(builtReg().test(textContent)) && attrNode.nodeName !== st_style){
                        if(!node['ve']){
                            attrNode['ve'] = attrNode.cloneNode();
                            //保存元素原内容,便于以后置换绑定数据使用
                            attrNode['ve']['raw'] = textContent.substr(0);
                        }
                        this._toBindAttrNode(attrNode);
                    }
                }, this);
            }
        },
        _toBindAttrNode: function(attrNode){
            if(SYST.T.indexOf(this.bindAttrNodes, attrNode) === -1){
                this.bindAttrNodes.push(attrNode);
            }
        },
        _makeBindAttrNodes: function(propName, nodes){
            var _nodes = nodes || this.bindAttrNodes;
            if(propName && (!_nodes || !_nodes.length === 0)) return;

            SYST.T.each(_nodes, function(attrNode){
                this._renderBindText(propName, attrNode);
            }, this);
        },

        //======================== st-prop ========================================
        /**
         * 获取数据被绑定的UI as st-prop
         * @param bindTag 具有st-model属性的单个标签元素
         * @private
         */
        _getBindElements: function(node){
            //根据标签属性名来查找 绑定元素
            if( node.nodeType !== 1 ||
                !this._getAttr(node, st_prop) ||
                isTemplate(node) ||
                this._getAttr(node,st_template) ||
                (this._getAttr(node,st_for) && !this._isSelectTag(node))){
                return;
            }
            var name = this._getRootPropName(node.getAttribute(st_prop));
            //作为当前元素的虚拟元素
            //当前元素将移除所有指令，而指令保存到虚拟元素中
            //元素将于model prop绑定，后期更新将只通知对应的元素并从虚拟元素中提取指令
            this._cloneVeNode(node);
            this._toBindElements(name, node);
            this._makeProps(name);
        },
        /**
         *  将属性名于之对应的绑定元素组合，属性名为key，值为元素数组
         *  方便在单独改变prop是只更新与之对应的元素
         * @param name: 属性名
         * @param element: 属性值
         */
        _toBindElements: function(name, node){
            node.removeAttribute(st_prop);
            if(!SYST.V.isArray(this.bindElements[name])){
                this.bindElements[name] = [];
                this.bindElements[name].push(node);
            }else{
                if(SYST.T.indexOf(this.bindElements[name], node) === -1){
                    this.bindElements[name].push(node);
                }
            }
        },
        /**
         * 更新UI
         * @param propName  绑定的属性名
         * @param elements  属性名对应的绑定元素
         * @private
         */
        _makeProps: function(propName){
            var _elements = this._getBinds(propName, this.bindElements);
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
        _makeProp: function(propName, node){
            if(!(propName in this.vm._props))   return;
            var self = this,
                ve = node.ve,
                $node = _$(node),
                stProp = ve.getAttribute(st_prop),
                attr = this._getPropName(stProp),
                putPattern = false,
                value, debounce, helpers;
            helpers = this._getHelperAsString(stProp);
            value = this._getProp(ve);

            //根据元素类型进行数据更新
            if(/TEXTAREA|INPUT|SELECT/.test(node.tagName)){

                //on change event
                $node.on('change', function(){
                    _listener(node, attr, helpers);
                });

                //input type radio
                if(/RADIO/i.test(node.type)){
                    node.value == value && (node.checked = true);
                    return false;
                }
                //input type checkbox
                else if(/CHECKBOX/i.test(node.type)){
                    _checkeboxValue(node, value);
                    return false;
                }

                node.value = value;
                //设置虚拟element属性value，以得保存
                ve.setAttribute('value', value);

                if(/TEXTAREA|INPUT/.test(node.tagName)){
                    //textarea、input
                    //解决中文输入问题
                    $node.on('compositionstart', function(){
                        putPattern = true;
                    }).on('compositionend', function(){
                        putPattern = false;
                    }).on('input', function(){
                        if(putPattern)  return;
                        _listener(node, attr, helpers);
                    });

                    isIE9 && $node.on('cut', function(){
                        _listener(node, attr, helpers);
                    });

                }
            }
            else{
                if(node.getAttribute(st_for)) return;
                stProp = ve.getAttribute(st_prop);
                if(stProp || !ve['raw']){
                    node.innerHTML = self._getProp(ve);
                }else{
                    //获取此 element
                    node.outerHTML = ve['raw'].replace(reg, function(match, $1){
                        return self._getProp(ve, $1);
                    });
                }
            }

            function _listener(context, attr, helpers){
                //console.log(context.checked);
                !debounce && (debounce = setTimeout(function(){
                    var value = self._makeHelpers(context.value, helpers);
                    if(context.type == 'checkbox'){
                        _updateCheckboxValue(attr, value, context.checked);
                    }else{
                        self.model.set(attr, value);
                        context.value = self._getProp(ve);
                    }
                    //同步更新文本节点 和 属性节点
                    self.updateBindTextAndAttrNodes(propName);
                }, wait));
            }
            function _checkeboxValue(context, val){
                if(SYST.V.isArray(val)){
                    context.checked = val.indexOf(context.value) !== -1 ? true : false;
                }else{
                    val = val.split(toArrReg);
                    _checkeboxValue(context, val);
                }
            }
            function _updateCheckboxValue(propName, val, checked){
                var prop = self.vm.get(propName);
                if(SYST.V.isString(prop)){
                    prop = prop.split(toArrReg);
                }
                if(SYST.V.isArray(prop)){
                    if(checked){
                        prop.indexOf(val) === -1 && prop.push(val);
                    }else{
                        prop = SYST.T.arrRemove(prop, val);
                    }
                    self.model.set(propName, prop);
                }
            }

        },
        //获取 当前属性的最新值
        _getProp: function(node, prop){
            var stProp = prop || (node.getAttribute(st_prop) || '').replace(notValReg, ''),
                propName, filters, propValue;
            if(!stProp) return '';
            // exp: <span st-prop="user.name | trim | addFirstName"></span>
            filters = this._getHelperAsString(stProp);
            propName = this._getPropName(stProp);

            // exp: user.name.first
            if(/\./gi.test(propName)){
                propValue = this._getFinalPropValue(propName);
            }else{
                propValue = this.vm.get(propName);
            }

            if(propValue == null) return '';
            //如果绑定的属性是一个function，则获取执行结果
            if(SYST.V.isFunction(propValue)){
                propValue = propValue.apply(this.vm);
            }

            //each methods
            propValue = this._makeHelpers(propValue, filters);
            return propValue;

        },
        //获取跟属性名 ex：user.name.first => user
        _getRootPropName: function(attrStr){
            return trimAttrValue(attrStr).split(/\.|\|/gi)[0];
        },
        //获取跟属性名 ex：{{ user.name.first | trim | addLastName }} => user.name.first
        _getPropName: function(express){
            return trimAttrValue(express).split('|')[0];
        },

        //======================== st-template ========================================
        _getBindTemplates: function(node){
            if(node.nodeType !== 1 || !this._getAttr(node, st_template)) return;
            var templateId,
                bindProp;

            this._cloneVeNode(node);
            templateId = '#' + node.getAttribute(st_template);
            bindProp = node.getAttribute(st_prop);
            node.ve['_bindProp'] = bindProp;
            node.ve['_bindTemplateId'] = templateId;
            //添加到缓存
            this._toBindTemplates(templateId, node);
            this._makeBindTemplates(templateId);
        },
        _toBindTemplates: function(templateId, node){
            node.removeAttribute(st_prop);
            node.removeAttribute(st_template);
            if(!this.bindTemplates[templateId]){
                this.bindTemplates[templateId] = [];
            }
            if(SYST.T.indexOf(this.bindTemplates[templateId], node) === -1){
                this.bindTemplates[templateId].push(node);
            }
        },
        _makeBindTemplates: function(templateId, data){
            var nodes = this._getBinds(templateId, this.bindTemplates);
            Object.keys(nodes).length > 0 && SYST.T.each(nodes, function(ts, index, templateId){
                (ts && ts.length > 0 )&& SYST.T.each(ts, function(node){
                    this._renderTemplate(templateId, node, data);
                }, this);
            }, this);
        },
        _renderTemplate: function(templateId, node, data){
            if(!node)   return;
            var propName = node['ve']['_bindProp'];
            if(this.vm._props && Object.keys(this.vm._props).length === 0)  return;
            var datas;
            //如果没有绑定st-prop 则数据为当前Model的props属性对象
            if(!propName){
                datas = this.vm._props;
            }else{
                datas = this.vm.get(propName) || {};
                if(SYST.V.isObject(datas) && SYST.V.isObject(data)){
                    datas = SYST.extend(datas, data);
                }
                var object = {};
                object[propName] = datas;
                datas = object;
            }
            node.innerHTML = SYST.T.render(templateId, datas, null, tplConfig, this.vm);
        },

        //========================= st-style ===========================================
        _getBindStyles: function(node){
            var styleString, temp, reg = getReg();
            if(node.nodeType !== 1 || !this._getAttr(node, st_style)) return;

            styleString = node.getAttribute(st_style);
            //获取绑定的元素集合
            while((temp = reg.exec(styleString)) != null){
                this._cloneVeNode(node);
                node.ve[st_style] = styleString;
                var propName = this._getPropName(temp[1]);

                if(!this.vm.hasProp(propName)){
                    this.model.add(propName, null, true);
                }
                this._toBindStyles(propName, node);
                this._makeStyles(propName);
            }
        },
        _toBindStyles: function(propName, node){
            node.removeAttribute(st_style);
            var bindNodes = this.bindStyles[propName];
            if(!bindNodes){
                bindNodes = this.bindStyles[propName] = [];
            }
            if(SYST.T.indexOf(bindNodes, node) === -1){
                bindNodes.push(node);
            }
        },
        _makeStyles: function(propName){
            var bindNodes = this._getBinds(propName, this.bindStyles);
            SYST.T.each(bindNodes, function(styles, index, propName){
                this._makeStyle(propName, styles);
            }, this);
        },
        _makeStyle: function(propName, nodes){
            if(!(propName in this.vm._props)) return;
            var stStyles, hs, renderTemplate;
            nodes = nodes || this.bindStyles[propName];
            SYST.V.isArray(nodes)
            &&
            SYST.T.each(nodes, function(node){
                renderTemplate = this._getRenderTemplate(node.ve[st_style]);
                stStyles = renderTemplate.template;
                hs = this._mergeHelpers(renderTemplate.helpers);
                stStyles = SYST.T.render(stStyles, this.vm._props, hs, tplConfig, this.vm);
                //cssText方式在IE中的性能极差
                this._setStyles(node, stStyles);

            }, this);

        },
        _setStyles: function(node, styles){
            if(!styles) return;
            styles = styles.replace(/\s*(\:|;)\s*/gi, '$1').split(';');
            styles && SYST.V.isArray(styles) && SYST.T.each(styles, function(s){
                var sy = SYST.T.trim(s).split(':');
                sy && (node.style[sy[0]] = sy[1]);
            });
        },

        //========================= st-for st-repeat ====================================
        _getBindRepeats: function(node){
            if(node.nodeType !== 1 || !this._getAttr(node, st_for))  return;
            //获取绑定的元素集合
            if(!node.ve)    node.ve = node.cloneNode(true);
            var stFor = node.getAttribute(st_for),
                _forString = this._getPropName(stFor),
                prop, hs;
            var fis = _forString.split(/in|as|of/gi).map(function(fit){ return fit.trim(); });
            if(fis.length > 1){
                prop = this._getRootPropName(fis[1]);
            }else{
                prop = this._getRootPropName(fis[0]);
            }
            hs = this._getHelperAsString(stFor);
            node.ve['helpers'] = hs;
            node.ve['_parent_'] = node.parentNode;
            //st-for model prop filters
            if(hs && hs.length > 0){
                this.vm._props[prop] = this._makeHelpers(this.vm.get(prop), hs);
            }

            this._toBindRepeats(prop, node);
            this._makeRepeats(prop);
        },
        _toBindRepeats: function(propName, node){
            node.removeAttribute(st_for);
            var bindRepeatElements = this.bindRepeats[propName];
            if(!bindRepeatElements){
                this.bindRepeats[propName] = [];
                bindRepeatElements = this.bindRepeats[propName];
            }
            if(SYST.T.indexOf(bindRepeatElements, node) === -1){
                bindRepeatElements.push(node);
            }
        },
        _makeRepeats: function(propName){
            var bindRepeatElements = this._getBinds(propName, this.bindRepeats);
            SYST.T.each(bindRepeatElements, function(nodes, index, prop){
                nodes && this._makeRepeat(prop, nodes);
            }, this);
        },
        _makeRepeat: function(propName, nodes){
            if(!this.vm.hasProp(propName) || !nodes || nodes.length === 0) return;
            var $node;
            SYST.T.each(nodes, function(node){
                node.innerHTML = this._renderBindRepeats(node, propName);
                $node = _$(node);
                //not bind events ---最好的做法是代理到element上
                var stonNodes = $node.find('[st-on]');
                stonNodes && stonNodes.length > 0 && SYST.T.each(stonNodes, function(el){
                    this._getBindEvents(el.context);
                    el.removeAttr(st_on);
                }, this);
                //get st-style bind attribute
                var stStyleNodes = $node.find('[st-style]');
                stStyleNodes && stStyleNodes.length > 0 && SYST.T.each(stStyleNodes, function(el){
                    var stStyles = el.attr(st_style);
                    el.removeAttr(st_style);
                    stStyles && this._setStyles(el.context, stStyles);
                }, this);

            }, this);

        },
        /**
         * 处理数组的情况
         * @param element       被绑定的元素
         * @param propName      绑定的属性名
         * @returns { element }
         * @private
         */
        _renderBindRepeats: function(node){
            var templateStr, hs;
            var templateObject = this._getBindRepeatsRenderTpl(node);
            templateStr = templateObject.template || '';
            hs = this._mergeHelpers(templateObject.helpers);

            return SYST.T.render(templateStr, this.vm._props, hs, tplConfig, this.vm);
        },
        _getBindRepeatsRenderTpl: function(node){
            var ve = _$(node.ve),
                html,
                helpers = {};

            //create temp node
            var $tempNode = ve.clone(true);
            $tempNode.context.ve = ve;
            html = $tempNode.context.outerHTML;

            var renderTemplate = this._getRenderTemplate(html);
            var div = SYST.$(renderTemplate.template);
            helpers = renderTemplate.helpers;
            var $frame = SYST.$(document.createDocumentFragment());
            $frame.append(div);

            var childNodes = $frame.find('[st-for]');

            SYST.T.each(childNodes, function(node){
                _createBeforeEachTpl.call(this, node);
                _createAfterEachTpl.call(this, node);
                node.removeAttr(st_for);
            }, this);


            //create each expression text
            function _createBeforeEachTpl(node){
                var ve = _$(node.context.ve || node.context),
                    stFor = ve.attr(st_for),
                    _forString = this._getPropName(stFor),
                    templateStr,
                    propName, itemName;

                var fis = _forString.split(/in|of|as/gi).map(SYST.T.trim);
                if(fis.length > 1){
                    itemName = fis[0];
                    propName = this._getRootPropName(fis[1]);
                }else{
                    propName = this._getRootPropName(fis[0]);
                }
                var hs = ve.helpers || this._getHelperAsString(stFor);

                if(hs && hs.length > 0){
                    helpers = SYST.extend(helpers, this._getHelperToRender(hs));
                }

                templateStr = '{{ each(' + propName + ', function(_item_, i, key){ var ' + (itemName ? itemName + '=' : '') + '_item_, ';
                templateStr += '$item=_item_, $value=_item_, $index=i, $key=key, ';
                templateStr += '$length = '+ propName + '.length, $first = (i == 0 ? true : false), $last = (i == $length - 1 ? true : false); }}';

                var beforeTextNode = document.createTextNode(templateStr);
                node.prepend(beforeTextNode);

            }

            function _createAfterEachTpl(node){
                var afterTextNode = document.createTextNode('{{ }, this); }}');
                node.append(afterTextNode);
            }

            return { template: $frame.children().eq(0).html(), helpers: helpers };

        },

        //========================= st-if st-else st-show st-hide =======================
        _getBindDisplays: function(node){
            var self = this;
            function _eachDisplays(st_attr){
                if(node.nodeType === 3 || !self._getAttr(node, st_attr))  return false;
                var stAttr = node.getAttribute(st_attr),
                    propName = self._getPropName(stAttr);
                //获取绑定的元素集合
                self._cloneVeNode(node);
                //node.ve['raw'] = node.outerHTML;
                self._toBindDisplays(st_attr, propName, node);
                //self._makeDisplays(propName);
            }

            _eachDisplays(st_show);
            _eachDisplays(st_hide);
            _eachDisplays(st_if);
            _eachDisplays(st_else);

        },
        _toBindDisplays: function(attr, propName, element){
            element.removeAttribute(attr);
            var bindDisplays = this.bindDisplayNodes[attr][propName];
            if(!bindDisplays){
                this.bindDisplayNodes[attr][propName] = [];
                bindDisplays = this.bindDisplayNodes[attr][propName];
            }
            if(SYST.T.indexOf(bindDisplays, element) === -1){
                bindDisplays.push(element);
            }
        },
        _makeDisplays: function(propName){
            var bindElements;
            bindElements = this._getBinds(propName, this.bindDisplayNodes[st_show]);
            bindElements && SYST.T.each(bindElements, function(elements, index, prop){
                this._makeDisplay(prop, elements, st_show);
            }, this);

            bindElements = this._getBinds(propName, this.bindDisplayNodes[st_if]);
            bindElements && SYST.T.each(bindElements, function(elements, index, prop){
                this._makeDisplay(prop, elements, st_if);
            }, this);

        },
        _makeDisplay: function(propName, nodes, attrName){
            attrName = attrName || st_show;
            if(!nodes || nodes.length === 0)  return;
            var propValue = this.vm.get(propName);
            SYST.T.each(nodes, function(node){
                var ve = node.ve,
                    stAttr = this._getAttr(ve, attrName),
                    stHides = _getNodes.call(this, st_hide),
                    stElses = _getNodes.call(this, st_else),
                    helpers,
                    $node = _$(node);
                //如果存在 filter
                if(/^[^\|]+?\|/.test(stAttr)){
                    helpers = this._getHelperAsString(stAttr);
                    propValue = this._makeHelpers(propValue, helpers);
                }

                if(!propValue){
                    if(attrName === st_show){
                        $node.hide();
                        stHides && SYST.T.each(stHides, function(el){
                            _$(el).show();
                        }, this);
                    }else{
                        $node.remove();
                    }
                }else{
                    if(attrName === st_show){
                        $node.show();
                        stHides && SYST.T.each(stHides, function(el){
                            _$(el).hide();
                        }, this);
                    }else{
                        stElses && SYST.T.each(stElses, function(el){
                            _$(el).remove();
                        }, this);
                    }
                }
            }, this);

            function _getNodes(attr){
                var nodes = this.bindDisplayNodes[attr][propName];
                return nodes && SYST.V.isArray(nodes) && nodes.length > 0 ? nodes : null;
            }
        },

        //========================= st-on =======================
        _getBindEvents: function(node){
            if(node.nodeType !== 1) return;
            if(node.ve && node.ve.getAttribute(st_for)) return;
            var stEvent = this._getAttr(node, st_on);
            if(!stEvent) return;
            node._stOn = this._getFormatEvents(stEvent);
            node.removeAttribute(st_on);
            this._makeBindEvents(node);
        },
        _makeBindEvents: function(node){

            var events = node._stOn, $node = _$(node), handler;
            (SYST.V.isObject(events) && Object.keys(events).length > 0)
            &&
            SYST.T.each(events, function(cb, i, event){
                cb = this.vm[cb];
                if(SYST.V.isFunction(cb)){
                    handler = SYST.T.proxy(this.vm, cb);
                    $node.off(event, handler).on(event, handler, null, node, null, null, true);
                }else{
                    throw new EvalError('this model has not event: ' + event);
                }
            }, this);
        },

        //========================= common method =======================================
        //create virtaul node
        _cloneVeNode: function(node){
            !node.ve && (node.ve = node.cloneNode(true));
            !node.ve.raw && (node.ve.raw = node.outerHTML);
        },
        _getBinds: function(propName, binds){
            var bindElements = {};
            if(propName){
                bindElements[propName] = binds[propName];
            }else{
                bindElements = binds;
            }
            //array => object
            if(SYST.V.isArray(bindElements)){
                bindElements = SYST.T.arr2object(bindElements, propName);
            }
            return bindElements;
        },
        //get first prop for exp: user.name.first to get 'user'
        //获取嵌套绑定属性的值
        _getFinalPropValue: function(attrStr){
            var attr = attrStr.split('.');
            //console.log(attr);
            var index = 0, temp, tts = this.vm._props[attr[0].replace(notValReg, '')] || ''; //
            while(SYST.V.isObject(tts) && (temp = tts[attr[++index]]) != null){
                tts = tts[attr[index]];
            }
            return tts;
        },
        _getAttr: function(node, attr){
            return node.attributes && node.hasAttribute(attr) ? node.getAttribute(attr) : null;
        },
        //获取所有过滤器 ex: {{ name | trim | addLastName }}
        _getHelperAsString: function(str, prop){
            if(!str || str.length === 0)  return;
            var ms = str.split(filterReg), hs = [];
            if(!ms || !ms.length === 0) return;
            if(!prop){
                prop = ms[0];
                ms.shift();
            }
            if(ms.length === 0) return hs;
            var _reg = /\(\s*([^\)]*?)\s*\)/i;

            SYST.T.each(ms, function(m){
                if(_reg.test(m)){
                    // {{ width | getWitdh('px') | formatWidth }}
                    if(/\./g.test(m))  return m;
                    var pms = [];
                    m = m.replace(_reg, function(mct, $1){
                        $1 = SYST.T.trim($1);
                        ($1 !== undefined || $1.length !== 0) && pms.push($1.replace(/"'/gi, ''));
                        return '';
                    });
                    hs.push({
                        fnName: m,
                        fnParams: pms
                    });
                }else{
                    // {{ width | formatWidth }}
                    hs.push({
                        fnName: m,
                        fnParams: null
                    });
                }
            });
            return hs;
        },
        _getHelperToRender: function(helpers){
            if(!SYST.V.isArray(helpers) || Object.keys(helpers).length === 0) return false;
            var hs = {}, name;
            SYST.T.each(helpers, function(help){
                name = help.fnName;
                //去除helper中包含 . 的
                if(!/\./.test(name)){
                    hs[name] = this.vm.helpers[name] || this.vm[name] || null
                }
            }, this);
            return hs;
        },
        _makeHelperToExpress: function(helpers, prop){
            var mline = '';
            SYST.T.each(helpers, function(fnObject, index){
                var name = fnObject.fnName,
                    params = fnObject.fnParams;
                var msc = params ? ', ' : '';
                if(index === 0){
                    if(params){
                        params.unshift(prop);
                        msc = '';
                    }else{
                        msc = prop;
                    }
                }
                if(/\./.test(name)){
                    mline = name + '(' + mline + msc + (params ? params.join(', ') : '') + ')';
                }else{
                    mline = name + '.call(this,' + mline + msc + (params ? params.join(', ') : '') + ')';
                }
            });
            return mline;
        },
        _makeHelpers: function(arg, helpers){
            if(!SYST.V.isArray(helpers) || 0 === helpers.length) return arg;
            var prop = arg, method;
            SYST.T.each(helpers, function(helper){
                var fnName = SYST.T.trim(helper.fnName),
                    params = helper.fnParams;
                method = this.vm.helpers[fnName] || this.vm[fnName];
                if(params){
                    params.unshift(prop);
                }else{
                    params = [prop];
                }
                if(SYST.V.isFunction(method)){
                    prop = method.apply(this.vm, params);
                }else{
                    method = SYST.T[fnName.replace(/\s*SYST\.T\.\s*/gi, '')];
                    if(SYST.V.isFunction(method)){
                        prop = method(params);
                    }
                }
            }, this);
            return prop;
        },
        _makeRender: function(tpl, data, hs){
            return SYST.T.render(tpl, data || this.vm._props, hs || this.vm.helpers, tplConfig) || '';
        },
        //转换字符串为渲染模板
        _getRenderTemplate: function(str){
            var tplStr = str || '',
                hs,
                helpers = {};
            tplStr = tplStr.replace(reg, function(match, $1){
                //如果存在 filter
                if(/^[^\|]+?\|/.test($1)){
                    var prop = this._getPropName($1);
                    hs = this._getHelperAsString($1);
                    helpers = SYST.extend(helpers, this._getHelperToRender(hs));
                    $1 = this._makeHelperToExpress(hs, prop);
                }
                var cdf = '{{= ' + $1 + ' }}';
                //转义输出
                if(/^\{\{\s*=+/i.test(match)){
                    cdf = '{{== ' + $1 + ' }}';
                }
                return cdf;
            }.bind(this));

            return { template: tplStr, helpers: helpers };
        },
        //格式化事件绑定
        _getFormatEvents: function(evtStr){
            if(!evtStr) return;
            evtStr = evtStr.replace(/([^:\{,]+)\s*:\s*([^,\}]*)/g, function(m, event, method){
                // { blur|keydown: onHandler } ==> { "blur": "onHandler", "keydown": "onHandler" }
                event = SYST.T.trim(event);
                method = SYST.T.trim(method.replace(fnParamsReg, ''));
                var events, tempCnt = '';

                if(/\|/.test(event)){
                    events = (event || '').split('|').map(function(event){ return SYST.T.trim(event); });
                    SYST.T.each(events, function(e){
                        tempCnt += '"' + e + '": "' + method + '",';
                    });
                    return tempCnt = tempCnt.replace(/\s*,\s*$/, '');
                }else{
                    return '"' + event + '": "' + method + '"';
                }
            });
            if(!/^\{[^\}]*\}$/.test(evtStr)){
                evtStr = '{' + evtStr + '}';
            }
            var events;
            try{
                events = JSON.parse(evtStr);
            }catch(e){
                throw new SyntaxError('st-on events SyntaxError' + e);
            }
            return events;
        },
        _createFrame: function(node){
            var frame = document.createDocumentFragment();
            SYST.V.isElement(node) && frame.appendChild(node);
            return _$(frame);
        },
        _mergeHelpers: function(hs){
            return SYST.extend(this.vm.helpers || {}, hs);
        },
        _isSelectTag: function(node){
            return /^SELECT$/i.test(node.tagName);
        }

    };

    SYST.Watcher = Watcher;

})(SYST);

/**
 * Created by Rodey on 2015/10/16.
 * Model 模型对象
 * @type {Function}
 */

;(function(SYST, root){

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
            this._props = {};

            //helpers
            this.helpers = SYST.V.isFunction(this.helpers) ? this.helpers.apply(this) : this.helpers || {};
            if(SYST.V.isObject(this.helpers)){
                SYST.T.each(this.helpers, function(method, i, name){
                    this.helpers[name] = method.bind(this);
                }, this);
            }
            //属性列表，数据绑定在里面
            this.props = SYST.V.isFunction(this.props) ? this.props.apply(this) : this.props || {};
            this._props = SYST.clone(this.props);
            this.props = {};
            //初始化，将props代理到 $props对象上
            this._$proxyProps();

            Object.defineProperty(this.props, '$M', { value: SYST.shareModel, enumerable: true, writable: true, configurable: false });

            //初始化 Watcher
            this.watcher = new SYST.Watcher(this);
            this.init && this.init.apply(this, arguments);
            SYST.shareModel.add(this.$mid || null, this);
            //var startTime = Date.now();
            if(this.$mid && this.autoWatcher !== false){
                this.watcher.init();
            }
        },
        $: SYST.$,
        // 在本模型中存取
        get: function(key){
            return this._props[key];
        },
        // 动态添加属性
        set: function(key, value, flag){

            if(SYST.V.isEmpty(key)) return this;

            if(SYST.V.isObject(key)){
                // this.set({ name: 'Rodey', age: 25 });
                for(var k in key){
                    _set.call(this, k, key[k]);
                }
            }else if(SYST.V.isString(key)){
                //this.set('name', 'Rodey') | this.set('one', { name: 'Rodey', age: 25, isBoss: false }
                _set.call(this, key, value);
            }

            function _set(k, v){
                if(this.has(k)){
                    this._props[k] = v;
                    !flag && this._watchProp(k, v);
                }else{
                    this._props[k] = v;
                    this._$proxyProp(this.props, k);
                    !flag && this._watchAddProp(k, v);
                }

                //if(v && !v.__ob__){
                //    this._observe(v, k);
                //}
            }

            return this;
        },
        add: function(key, value, flag){
            this.set(key, value, flag);
            this.watcher.addListener(key, value);
        },
        refresh: function(key){
            this.set(key, this.get(key));
        },
        //判断某个属性值是否存在
        has: function(key){
            return this.hasProp(key) || this.get[key] != undefined;
        },
        //判断某个属性是否存在
        hasProp: function(key){
            return SYST.V.isObject(this._props) && key in this._props;
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
                this.props = this._props = {};
            }
            return this;

        },
        removePropsAll: function(){
            this.removeProps();
        },
        //动态删除属性
        remove: function(key){
            if(!key || key == '') return this;
            this._props[key] = null;
            delete this._props[key];
            this.watcher.removeListener(key);
            return this;
        },
        // 在localStorage中存取 flag == true 代表 sessionStorage
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

        //代理 $props
        //将 props中的属性代理到 $props上，getter and setter
        _$proxyProps: function(){
            SYST.T.each(this._props, function(value, i, key){
                //如果值是数组，或者Oject
                if(value && !value.__ob__){
                    this._observe(value, key);
                }
                this._$proxyProp(this.props, key);
            }, this);
        },
        _$proxyProp: function(object, key){
            var self = this;
            var _object = object || this.props;

            Object.defineProperty(_object, key, {
                configurable: true,
                enumerable: true,
                get: function getterProp(){
                    return self.get(key);
                },
                set: function setterProp(value){
                    if(value && !value.__ob__){
                        self._observe(value, key);
                    }
                    self.set(key, value);
                }
            });
        },
        _observe: function(value, tier){
            SYST.Observe(value, this._watchServe.bind(this), this, tier);
        },
        _watchServe: function(changer){
            //console.log(changer);
            if(!changer.tier){
                changer.type == 'update' && this.set(changer.name, changer.newValue);
            }else{
                if(changer.target[changer.tier]){
                    this._props[changer.tier][changer.name] = changer.newValue;
                }
                changer.type == 'update' && this.watcher.update(changer.tier, this._props[changer.tier]);
            }
        },
        //监听 st-prop 属性变化(已存在)
        _watchProp: function(key, value){
            this.watcher && this.watcher.update(key);
        },
        _watchAddProp: function(key, value){
            this.watcher && this.watcher.add(key, value);
        }

    };

})(SYST, window);
/**
 * Created by Rodey on 2015/10/16.
 */

;(function(SYST){

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
 * Created by Rodey on 2016/10/16.
 * Module 视图对象
 * @type {Function}
 */

;(function(SYST){
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
            this.$http = this.$http || new SYST.Http();
            this.container = this.container || 'body';
            this.template = null;
            this.container = SYST.Dom(this.container);
            this._eventCaches_ = {};
            //自动解析 events对象，处理view中的事件绑定
            !this.autoEvent && this.events && SYST.V.isObject(this.events) && this._autoHandleEvent('on');
            //自定义init初始化
            !this.unInit && this.init && this.init.apply(this);
        },
        $: SYST.$,
        destroy: function(){
            this.container.html('');
            this._autoHandleEvent('off');
            return this;
        },
        proxy: SYST.T.proxy,
        /**
         * 格式化 events对象
         * @param events对象
         * @return {*}
         */
        _parseEvent: function(events){

            if(!SYST.V.isObject(events))    return this;

            _getEvent.call(this, events, 'body');

            function _getEvent(event, container, fn){
                if(SYST.V.isObject(event)){
                    SYST.T.each(event, function(handler, i, evt){
                        if(!SYST.V.isObject(handler)){
                            this._toCache(evt, container, handler);
                        }else{
                            _getEvent.call(this, handler, evt);
                        }
                    }.bind(this));
                }else{
                    this._toCache.call(event, container, fn);
                }
            }

        },
        /**
         * 自动绑定事件
         * @param 将被替换的对象
         */
        _autoHandleEvent: function(type){
            type = type || 'on';
            if(Object.keys(this._eventCaches_).length === 0){
                this._parseEvent(this.events);
            }

            SYST.T.each(this._eventCaches_, function(events){
                events.length > 0 && SYST.T.each(events, function(event){
                    SYST.Events.initEvent(SYST.Dom(event.selector), event.eventName, this.proxy(this, event.fnName), type, event.container);
                }, this);
            }, this);

        },
        _toCache: function(event, container, fn){
            var flag = false;
            var temp = this._parseString(event),
                caches = this._eventCaches_[temp.eventName];
            if(!temp.eventName)
                throw new Error('对象侦听'+ temp.eventName + '不存在');
            if(!this[fn])
                throw new Error('对象'+ this + '不存在' + fn + '方法');
            if(!temp.selector)
                throw new Error('事件函数'+ temp.selector + '不存在');

            temp.handler = this[fn];
            temp.fnName = fn;
            temp.container = container;

            if(!caches) caches = [];
            caches.length > 0 && SYST.T.each(caches, function(cache){
                if(temp.eventName == cache.eventName
                    && temp.fnName == cache.fnName
                    && temp.container == cache.container
                ){
                    flag = true;
                }else{
                    flag = false;
                }
            });
            !flag && caches.push(temp);
            this._eventCaches_[temp.eventName] = caches;
            return temp;
        },
        _getCache: function(event, container, fn){
            var temp = this._parseString(event), rs;
            SYST.T.each(this._eventCaches_, function(events){
                events.length > 0 && SYST.T.each(events, function(event){
                    if(event.selector == temp.selector && event.fnName == fn && event.container == container && event.handler == this[fn]){
                        rs = event;
                    }
                }, this);
            }, this);
            return rs;
        },
        _parseString: function(event){
            var o = SYST.T.trim(event).split(/\s+/gi);
            var selector = o[1].replace(/^\$*|[\(*]|[\)*]$/gi, '').replace(/"|'/gi, '\"');
            var eventName = o[0].replace(/^\s*|\s*$/gi, '');
            return { eventName: eventName, selector: selector };
        },
        onEvent: function(event, func, container){
            if(event && func){
                var temp = this._toCache(event, container, func);
                SYST.Events.initEvent(SYST.Dom(temp.selector), temp.eventName, this.proxy(this, temp.fnName), 'on', temp.container);
            }else{
                this._autoHandleEvent('on');
            }
            return this;
        },
        offEvent: function(event, func, container){
            if(event && func){
                var cache = this._getCache(event, container, func);
                cache && SYST.Events.initEvent(SYST.Dom(cache.selector), cache.eventName, this.proxy(this, cache.fnName), 'off', cache.container);
            }else{
                this._autoHandleEvent('off');
            }
            return this;
        },
        shareModel: SYST.shareModels
    };

})(SYST, window);
;(function(SYST){

    var Controller = function(){
        this.__instance_SYST__ = 'SYST Controller';
        this.__Name__ = 'SYST Controller';
    };
    SYST.Controller = function(){
        var ctrl = SYST.extendClass(arguments, Controller);
        ctrl._initialize();
        return ctrl;
    };
    Controller.prototype = {
        shareModel: SYST.shareModel,
        $: SYST.$,
        _initialize: function(){
            this.defaultHost = this.defaultHost || location.host;
            this.model = SYST.Model();
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
 * Created by Rodey on 2016/9/23.
 * web component 组件
 */

;(function(SYST){

    var Component = function(cid, options){
        this.cid = cid;
        this.options = options;
        this.options['$mid'] = this.cid + '-model';
        this._init();
    };

    Component.prototype = {
        _init: function(){
            this.container = document.querySelectorAll(this.cid) || document.getElementsByTagName(this.cid);
            this.template = this.container.html();
            this.container.attr('st-model', this.options.$mid);
            this.$model = SYST.Model(this.options);
            this._implantation();
        },
        _implantation: function(){
            var content = this.template;
            console.log(content);
            this.container.prev()[0] ? this.container.prev().after(content) : this.container.parent().html(content);
            this.container.remove();
        }
    };

    function _createNode(){
        var node = document.createDocumentFragment();
        return $(node);
    }

    SYST.Component = function(cid, options){
        return new Component(cid, options);
    };

})(SYST);
;(function(SYST){
    SYST.UI = function(){};
})(SYST);


return SYST; 
}.call(window)));