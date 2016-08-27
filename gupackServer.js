/**
 * Created by rodey on 2016/8/16.
 * 一个简单的静态文件服务器
 * 同时包含热开发（浏览器实时更新）
 */
const http              = require('http');
const url               = require('url');
const fs                = require('fs');
const path              = require('path');
const pako              = require('pako');
const jsmin             = require('jsmin2');
const mimeTypes         = require('./lib/mime');
const config            = require('./lib/serconf');
const tools             = require('./lib/tools');
const LiveServer        = require('./lib/gupack_server').LiveServer;
const getGupackConfig   = require('./lib/gupack_config');

//当前项目名称
const projectName = tools.argv['project-name'];
//当前项目目录,服务启动后将从该目录开始读取文件
const basePath = tools.argv['server-path'];

//取得用户配置文件信息
const userCustomConfig = getGupackConfig(projectName);
const hostname = userCustomConfig['host'];
const port = userCustomConfig['port'];
const sport = userCustomConfig['sport'];
const liveReloadDelay = userCustomConfig['liveDelay'];

var oldRealPath;

//如果项目根目录不存在
if(!basePath){
    throw new Error('\x1b[32m--->>> \u672a\u8bbe\u7f6e\u6b63\u786e\u7684\u9879\u76ee\u8def\u5f84 \x1b[39m');
}

/**
 * 创建web服务器
 * @param req   => request
 * @param res   => response
 */
const server = http.createServer((req, res) => {
    var headers = {
        'Content-Type': 'text/plain',
        'access-control-allow-origin': '*',
        'timing-allow-origin': '*'
    };
    var pathname = url.parse(req.url).pathname.replace(/\.\./g, '');
    if(pathname.slice(-1) === '/'){
        pathname += config.indexFile.file;
    }
    var realPath = path.join(basePath, path.normalize(pathname));
    if(pathname === '/favicon.ico'){
        realPath = path.join(__dirname, path.normalize(pathname));
    }
    //判断路径是否存在
    if(!tools.fs.existsSync(realPath)){
        sendResponse(req, res, 404, 'This request URL " + pathname + " was not found on this server.', headers);
        return;
    }

    var stats = tools.fs.statSync(realPath);
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
    tools.fs.readFile(realPath, "utf-8", (err, file) => {
        if(err){
            //读取文件失败
            tools.log.red('\x1b[32m--->>> \u8bfb\u53d6\u6587\u4ef6\u5931\u8d25 \x1b[39m');
            sendResponse(req, res, 500, err.toLocaleString(), headers);
        }else{

            var extname = path.extname(realPath).replace(/^\./i, '');
            headers['Content-Type'] = mimeTypes[extname] || 'text/plain';

            //缓存控制===========Start
            var cacher = setHeaderCache(req, stats, extname, headers);
            if(304 == cacher){
                sendResponse(req, res, 304, 'Not Modified', headers);
                return;
            }else{
                headers = cacher;
            }

            //console.log(realPath);
            //加入 实时更新===========Start
            if(config.liveReload.match.test(extname)){
                file = implanteScriptCode(file, realPath);
                oldRealPath && liveServer.unwatch(oldRealPath);
                liveServer.watch(realPath);
                oldRealPath = realPath;
            }

            //如果支持gzip压缩===========Start
            if(extname.match(config.Gzip.match)){
                var gziper = setHeaderGzip(req, file, headers);
                file = gziper.content;
                headers = gziper.headers;
            }

            //add Content-Length===========Start
            headers['Content-Length'] = file.length;
            //respond content as status 200
            sendResponse(req, res, 200, file, headers);

        }

    });
});

/**
 * 响应客户端请求
 * @param req       request对象
 * @param res       response对象
 * @param status    返回状态码
 * @param body      响应数据
 * @param headers   响应头信息对象
 */
function sendResponse(req, res, status, body, headers){
    res.writeHead(status, headers);
    res.write(body, "binary");
    res.end();
}

/**
 * 植入javascript代码
 * @param content       当前访问的文件内容
 * @returns {*}
 */
function implanteScriptCode(content, realPath){
    var gupackBrowseScripts = tools.getFileContent(tools.Path.resolve(__dirname, 'lib/gupack_browse.js'));
    gupackBrowseScripts = jsmin(gupackBrowseScripts).code;
    var tag = '<script id="'+ Math.random()*999999 +'" data-host="'+ hostname +'" data-socket="true" data-port="'+ sport +'">';
    //将浏览器上的socket端口进行替换
    gupackBrowseScripts = tools.replaceVar(gupackBrowseScripts, null, sport);
    if(gupackBrowseScripts.indexOf('</head>') !== -1){
        tag += gupackBrowseScripts + '</script></head>';
        content = content.replace('</head>', tag);
    }else{
        content += tag + gupackBrowseScripts +'</script>';
    }
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
    var acceptEncoding = req.headers['accept-encoding'] || "";
    if(/\bgzip\b/gi.test(acceptEncoding)){
        headers['Content-Encoding'] = 'gzip';
        content = pako.gzip(content, { to: 'string' });
    }else if(/\bdeflate\b/gi.test(acceptEncoding)){
        headers['Content-Encoding'] = 'deflate';
        content = pako.gzip(content, { to: 'string' });
    }
    return { content: content, headers: headers };
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
    var lastModified = stats.mtime.toUTCString();
    var ifModifiedSince = "If-Modified-Since".toLowerCase();
    headers['Last-Modified'] = lastModified;
    if(extname.match(config.Expires.fileMatch)) {
        var expires = new Date();
        expires.setTime(expires.getTime() + config.Expires.maxAge * 1000);
        headers['Expires'] = expires.toUTCString();
        headers['Cache-Control'] = "max-age=" + config.Expires.maxAge;
    }

    if(req.headers[ifModifiedSince] && lastModified == req.headers[ifModifiedSince]) {
        return 304;
    }
    return headers;
}

/**
 * 监听文件变化，触发浏览器热更新
 */
var liveServer;
function connectSocket(){
    liveServer = new LiveServer({ port: sport, liveDelay: liveReloadDelay });
    //liveServer.watch(basePath);
}

//启动服务
server.listen(port, hostname, () => {
    tools.log.green(`Server running at http://${hostname}:${port}/`);
    connectSocket();
});





