/**
 * Created by r9luox on 2016/8/17.
 * 静态服务器的一些配置
 */

exports.servers = {
    host: '127.0.0.1',
    port: 3000, // http/https server port
    sport: 8112 // websocket server port
};

//目录默认索引文件
exports.indexFile = {
    file: 'index.html'
};

//缓存控制
exports.Expires = {
    fileMatch: /^(gif|png|jpg|js|css)$/ig,
    maxAge: 60 * 60 * 24 * 365
};

//gzip压缩
exports.Gzip = {
    match: /css|js|html/ig
};

exports.liveReload = {
    match: /html|text/gi
};
