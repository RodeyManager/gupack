/**
 * Created by Rodey on 2017/11/1
 * match { proxy | url } context
 */
'use strict';

const url        = require('url');
const util       = require('util');
const micromatch = require('micromatch');
const isGlob     = require('is-glob');
const _          = require('lodash');

const ERRORS = {
    ERR_CONFIG_FACTORY_TARGET_MISSING: 'Missing "target" option. Example: {target: "http://www.example.org"}',
    ERR_CONTEXT_MATCHER_GENERIC: 'Invalid context. Expecting something like: "/api" or ["/api", "/ajax"]',
    ERR_CONTEXT_MATCHER_INVALID_ARRAY: 'Invalid context. Expecting something like: ["/api", "/ajax"] or ["/api/**", "!**.html"]',
    ERR_PATH_REWRITER_CONFIG: 'Invalid pathRewrite config. Expecting object with pathRewrite config or a rewrite function'
};

module.exports = (context, uri, req) =>{
    // single path
    if(isStringPath(context)){
        return matchSingleStringPath(context, uri);
    }

    // RegExp context
    if(util.isRegExp(context)){
        return matchRegExpPath(context, uri);
    }

    // single glob path
    if(isGlobPath(context)){
        return matchSingleGlobPath(context, uri)
    }

    // multi path
    if(Array.isArray(context)){
        if(context.every(isStringPath)){
            return matchMultiPath(context, uri)
        }
        if(context.every(isGlobPath)){
            return matchMultiGlobPath(context, uri);
        }

        throw new Error(ERRORS.ERR_CONTEXT_MATCHER_INVALID_ARRAY);
    }

    // custom matching
    if(_.isFunction(context)){
        let pathname = getUrlPathName(uri);
        return context(pathname, req);
    }

    throw new Error(ERRORS.ERR_CONTEXT_MATCHER_GENERIC);
};

function matchSingleStringPath(context, uri){
    let pathname = getUrlPathName(uri);
    return pathname.indexOf(context) === 0;
}

function matchRegExpPath(context, uri){
    let pathname = getUrlPathName(uri);
    return context.test(pathname);
}

function matchSingleGlobPath(pattern, uri){
    let pathname = getUrlPathName(uri);
    let matches  = micromatch(pathname, pattern);
    return matches && (matches.length > 0)
}

function matchMultiGlobPath(patternList, uri){
    return matchSingleGlobPath(patternList, uri)
}

/**
 * @param  {String} contextList ['/api', '/ajax']
 * @param  {String} uri     'http://example.org/api/b/c/d.html'
 * @return {Boolean}
 */
function matchMultiPath(contextList, uri){
    for(let i = 0; i < contextList.length; i++){
        let context = contextList[i];
        if(matchSingleStringPath(context, uri)){
            return true;
        }
    }
    return false
}

function getUrlPathName(uri){
    return uri && url.parse(uri).pathname;
}

function isStringPath(context){
    return _.isString(context) && !isGlob(context)
}

function isGlobPath(context){
    return isGlob(context)
}
