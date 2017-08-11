/**
 * Created by Rodey on 2017/7/18.
 */

'use strict';

let toString = Object.prototype.toString;

let utils = {
    isString: v => '[object String]' === toString.call(v),
    isArray: v => Array.isArray(v) && '[object Array]' === toString.call(v),
    isObject: (v) => '[object Object]' === toString.call(v),
    isEmptyObject: v => utils.isObject(v) && Object.keys(v).length === 0,
    isFunction: v => '[object Function]' === toString.call(v),
    isUndefined: v => '[object Undefined]' === toString.call(v),
    isNull: v => '[object Null]' === toString.call(v),
    isNumber: v => '[object Number]' === toString.call(v),
    isDate: v => '[object Date]' === toString.call(v),
    isRegExp: v => '[object RegExp]' === toString.call(v)
};

module.exports = utils;