/**
 * Created by Rodey on 2017/10/31
 * http web server
 */
'use strict';

const http       = require('http');
const util       = require('util');
// middlewares
const bodyParser = require('./middleware/bodyParser');
const proxy      = require('./middleware/proxy');
const T = require('../tools');

module.exports = (next) =>{

    return http.createServer((req, res) =>{
        bodyParser(req, res);
        return useProxy(req, res, next);
    });
};

function useProxy(req, res, next){
    const gupackConfig = T.getConfig() || {};
    const proxyConfig = gupackConfig.proxy;
    if(proxyConfig){
        if(util.isString(proxyConfig)){
            proxyConfig = { context: '/', target: proxyConfig };
        }
        if(proxy.isMatchedContext(proxyConfig.context, req)){
            return proxy.startProxy(req, res).then(() => {
                next(req, res);
            }).catch(err => console.log(err));
        }
    }
    next(req, res);
}

