/**
 * Created by Rodey on 2017/10/31
 * proxy middleware
 */
'use strict';

const httpProxy      = require('http-proxy');
const _              = require('lodash');
const T              = require('../../tools');
const contextMatcher = require('../../contextMatcher');

function startProxy(req, res){
    const proxy        = httpProxy.createProxyServer({});
    const gupackConfig = T.getConfig() || {};
    const proxyOptions = _.assign({}, gupackConfig.proxy);

    return new Promise((resolve, reject) =>{
        proxy.web(req, res, proxyOptions, (err) =>{
            if(err){
                reject(err);
            }else{
                resolve(req);
            }
        });
    });
};

function isMatchedContext(context, req){
    let path = (req.originalUrl || req.url);
    return contextMatcher(context, path, req);
}

module.exports = {startProxy, isMatchedContext};
