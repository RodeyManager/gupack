/**
 * Created by rodey on 2016/8/16.
 * 一个简单的静态文件服务器
 * 同时包含热开发（浏览器实时更新）
 */

'use strict';

const http            = require('http');
const url             = require('url');
const path            = require('path');
const os              = require('os');
const pako            = require('pako');
const chalk           = require('chalk');
const execFile        = require('child_process').execFile;
const mimeTypes       = require('./mime');
const config          = require('./serconf');
const T               = require('./tools');
const LiveServer      = require('./live/liveReloadServer').LiveServer;
const liveApp         = require('./live/liveApp');
const getGupackConfig = require('./live/liveReloadConfig');

//取得用户配置文件信息
const userCustomConfig = getGupackConfig();
const hostname         = userCustomConfig['host'];
const port             = userCustomConfig['port'];
const sport            = userCustomConfig['sport'];
const liveReloadDelay  = userCustomConfig['liveDelay'];

//当前项目目录,服务启动后将从该目录开始读取文件
const basePath      = T.Path.resolve(process.cwd(), 'build');
const isOpenBrowser = 'o' in T.argv || 'open-browser' in T.argv;
let oldRealPath;

//如果项目根目录不存在
if(!basePath){
    throw new Error(T.msg.red('\u672a\u8bbe\u7f6e\u6b63\u786e\u7684\u9879\u76ee\u8def\u5f84'));
}

// 创建web服务器
function createLiveServer(){

    const server = liveApp(doFile);
    //启动服务
    server.listen(port, hostname, listen);
    return server;

};

function doFile(req, res){
    let headers = {
        'Accept-Ranges': 'bytes',
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Credentials': 'true',
        'Timing-Allow-Origin': '*',
        'Server': 'Gupack, NodeJS/' + process.version
    };

    let pathname = url.parse(req.url).pathname.replace(/\.\./g, '');
    if(pathname.slice(-1) === '/'){
        pathname += config.indexFile.file;
    }
    let realPath = path.join(basePath, path.normalize(pathname));
    if(pathname === '/favicon.ico'){
        realPath = path.resolve(__dirname, '../', path.normalize(pathname));
    }
    if(/mock(Data)?.*?\.json$/gi.test(pathname)){
        realPath = path.resolve(basePath, '../', pathname.replace(/^\//, ''));
    }
    //判断路径是否存在
    if(!T.fs.existsSync(realPath)){
        sendResponse(req, res, 404, 'This request URL " + pathname + " was not found on this server.', headers);
        return;
    }

    let stats = T.fs.statSync(realPath);
    if(!stats){
        sendResponse(req, res, 404, 'This request URL " + pathname + " was not found on this server.', headers);
        return;
    }

    //如果访问的是content 目录
    //exp： http://127.0.0.1:3000/assets/images
    if(stats.isDirectory()){
        realPath = path.join(realPath, "/", config.indexFile.file);
    }
    //读取文件
    T.fs.readFile(realPath, "binary", (err, file) =>{
        if(err){
            //读取文件失败
            T.log.red('--->>> \u8bfb\u53d6\u6587\u4ef6\u5931\u8d25 ');
            sendResponse(req, res, 500, err.toLocaleString(), headers);
        }else{

            let extname             = path.extname(realPath).replace(/^\./i, '');
            headers['Content-Type'] = (mimeTypes[extname] || 'text/plain') + '; charset=UTF-8';

            //缓存控制===========Start
            let cacher = setHeaderCache(req, stats, extname, headers);
            if(304 === cacher){
                sendResponse(req, res, 304, 'Not Modified', headers);
                return;
            }else{
                headers = cacher;
            }

            //加入 实时更新===========Start
            if(config.liveReload.match.test(extname)){
                file = implanteStyleCode(file);
                file = implanteScriptCode(file);
                oldRealPath && liveServer.unwatch(oldRealPath);
                liveServer.watching(realPath);
                oldRealPath = realPath;
                T.log.yellow('.................page reload................');
            }

            //如果支持gzip压缩===========Start
            if(extname.match(config.Gzip.match)){
                let gziper = setHeaderGzip(req, file, headers);
                file       = gziper.content;
                headers    = gziper.headers;
            }

            //add Content-Length===========Start
            headers['Content-Length'] = file.length;
            //respond content as status 200
            sendResponse(req, res, 200, file, headers);

        }
    });

}

function listen(){
    let url = `http://${hostname}:${port}/${ getIndexFile() }`;
    T.log.yellow(chalk.underline.bgBlue(`Server running at ${ url }`));
    connectSocket();
    isOpenBrowser && openBrowse(url);
}

function getIndexFile(){
    return userCustomConfig.indexFile;
}

function openBrowse(url){
    let osType    = os.type();
    let shellFile = /windows/gi.test(osType) ? 'open.cmd' : /macos/gi.test(osType) ? 'open' : 'xdg-open';
    shellFile     = T.Path.resolve(__dirname, '../shell', shellFile);
    execFile(shellFile, [url]);
}

/**
 * 响应客户端请求
 * @param req       request对象
 * @param res       response对象
 * @param status    返回状态码
 * @param body      响应数据
 * @param headers   响应头信息对象
 * @param charType  响应数据类型
 */
function sendResponse(req, res, status, body, headers, charType){
    res.writeHead(status, headers);
    res.write(body, charType || 'binary');
    res.end();
}

/**
 * 植入javascript代码
 * @param content       当前访问的文件内容
 * @returns {*}
 */
function implanteScriptCode(content){
    let scriptCode = T.getFileContent(T.Path.resolve(__dirname, 'live/liveReloadBrowser.js'));
    let tag        = '<script id="' + Math.random() * 999999 + '" data-host="' + hostname + '" data-socket="true" data-port="' + sport + '">';
    //将浏览器上的socket端口进行替换
    scriptCode     = T.replaceVar(scriptCode, null, sport);
    tag += scriptCode + '</script></body>';
    content        = content.replace('</body>', tag);
    return content;
}

function implanteStyleCode(content){
    let styleCode = T.getFileContent(T.Path.resolve(__dirname, 'live/liveReloadStyle.css'));
    let tag       = '<style id="' + Math.random() * 999999 + '" data-host="' + hostname + '" data-socket="true" data-port="' + sport + '">';

    tag += styleCode + '</style></head>';
    content = content.replace('</head>', tag);
    return content;
}

/**
 * 响应进行 gzip压缩
 * @param req
 * @param content
 * @param headers
 * @returns {{content: *, headers: *}}
 */
function setHeaderGzip(req, content, headers){
    //将字符串数据转成二进制数据流，（有效解决二进制存储文件显示，如：图片，字体等）
    let bin            = new Buffer(content, 'binary');
    let acceptEncoding = req.headers['accept-encoding'] || "";
    if(/\bgzip\b/gi.test(acceptEncoding)){
        headers['Content-Encoding'] = 'gzip';
        content                     = pako.gzip(new Uint8Array(bin), {to: 'string'});
    }else if(/\bdeflate\b/gi.test(acceptEncoding)){
        headers['Content-Encoding'] = 'deflate';
        content                     = pako.gzip(new Uint8Array(bin), {to: 'string'});
    }
    return {content: content, headers: headers};
}

/**
 * 响应进行 缓存设置
 * @param req
 * @param stats
 * @param extname
 * @param headers
 * @returns {*}
 */
function setHeaderCache(req, stats, extname, headers){
    let lastModified         = stats.mtime.toUTCString();
    let ifModifiedSince      = "If-Modified-Since".toLowerCase();
    headers['Last-Modified'] = lastModified;
    if(extname.match(config.Expires.fileMatch)){
        let expires = new Date();
        expires.setTime(expires.getTime() + config.Expires.maxAge * 1000);
        headers['Expires']       = expires.toUTCString();
        headers['Cache-Control'] = "max-age=" + config.Expires.maxAge;
    }

    if(req.headers[ifModifiedSince] && lastModified === req.headers[ifModifiedSince]){
        return 304;
    }
    return headers;
}

/**
 * 监听文件变化，触发浏览器热更新
 */
let liveServer;

function connectSocket(){
    if(liveServer) return false;
    liveServer = new LiveServer({port: sport, liveDelay: liveReloadDelay});
}

function emitBuilding(){
    liveServer && liveServer.send('<<<-----start building----->>>');
}

module.exports = {
    createLiveServer, emitBuilding
};




