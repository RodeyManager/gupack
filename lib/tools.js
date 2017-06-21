/**
 * Created by Rodey on 2015/12/11.
 */

var fs              = require('fs'),
    path            = require('path'),
    util            = require('util'),
    mkdirp          = require('mkdirp'),
    fsa             = require('fs-extra'),
    exec            = require('child_process').exec,
    execFile        = require('child_process').execFile,
    spawn           = require('child_process').spawn,
    del             = require('del'),
    exit            = require('./exit'),
    chalk           = require('chalk'),
    argv            = require('minimist')(process.argv.slice(2));

var tools = {

    regexp: /(\{\{[\s\S]*?\}\}|@[\s\S]*?)[\/|\\]*/gi,

    /**
     * 获取 编译源文件地址 或 编译产出后地址
     * @param source    地址
     * @param toPath    需要转换的地址
     * @param options
     * @returns {*}
     */
    switchPath: function(src, toPath, options){
        var regexp = this.regexp,
            source = src,
            options = options || {};
        if(util.isString(source)){
            return source.replace(regexp, toPath);
        }
        else if(util.isArray(source)){
            source = source.map(function(s){
                return options['srcPrefix']
                    ? options['srcPrefix'].replace(regexp, toPath) + s.replace(/^\\/i, '')
                    : s.replace(regexp, toPath);
            });
            return source;
        }

        return [];

    },

    //获取参数值
    getParams: function(param, options){
        var args = process.argv.slice(2);
        var i = 0, len = args.length, data;
        for(; i < len; ++i){
            data = args[i];
            if(data === param || (options && data === options)){
                return args[i + 1];
            }
        }
        return null;
    },

    //判断参数是否存在
    isParam: function(param, options){
        var args = process.argv.slice(2);
        var i = 0, len = args.length, data;
        for(; i < len; ++i){
            data = args[i];
            if(data === param || (options && data === options)){
                return true;
            }
        }
        return false;
    },

    //获取正确的编译地址
    getBuildPath: function(base, buildpath){
        if(':' !== buildpath.slice(1, 2)){
            //相对路径
            return path.resolve(base, buildpath);
        }else{
            return buildpath;
        }
    },

    //获取相对路径
    getRelativePath: function (pathname, parentPath){
        var temp = pathname;
        temp = /^\.{2}/gi.test(temp) ? '../' + temp : temp;
        var tap = [], rap = [];
        temp = temp.split('/');
        temp.forEach(function(r){
            if('..' === r){
                tap.push(r);
            }else{
                rap.push(r);
            }
        });
        temp = tap.join('/') + '/';
        temp = path.resolve(parentPath, temp);
        //console.log(temp);
        temp = temp.split(path.sep);
        temp = temp[temp.length - 1];
        return (temp + '/' + rap.join('/')).replace(/^[\/\\]/i, '');
    },

    getFileContent: function(filePath){
        if(fs.existsSync(filePath)){
            return fs.readFileSync(filePath, 'utf8');
        }
    },

    //随机生成端口号
    generatePort: function(list, port){
        return _generatePort(list, port);
        function _generatePort(list, port){
            for(var i = 0, len = list.length; i < len; ++i){
                if(list[i] == port){
                    _generatePort(list, Math.round(Math.random() * 1000 + 3000));
                }else{
                    return port;
                }
            }
        }
    },

    /**
     * 根据 项目名称 获取项目配置
     * @param name
     * @returns {*}
     */
    getProjectConfig: function(name){
        var projects = require('../projects').projectList;
        return projects[name];
    },

    /**
     * 替换变量
     * @param content       全文
     * @param regx          正则、字符串
     * @param value         值
     * @returns {void|string|XML|*}
     */
    replaceVar: function(content, regx, value){
        regx = regx || /\{\{\@[^\{]*?\}\}/gi;
        return content = content.replace(regx, (m, $1)=>{
            return value;
        });
    },

    pathRegxs: [
        /url\([\"\']?([^\"\']*)[\"\']?\)/gi,
        /src=[\"\']?([^\"\']*)[\"\']?/gi,
        /href=[\"\']?([^\"\']*)[\"\']?/gi
    ],

    mkdirp: mkdirp,
    fs: fs,
    fsa: fsa,
    del: del,
    Path: path,
    exec: exec,
    execFile: execFile,
    spawn: spawn,
    argv: argv,
    exit: exit,
    chalk: chalk

};

var styles = {
    red: [31, 39],
    green: [32, 39],
    blue: [36, 0],
    yellow: [33, 39],
    gray: [90, 39],
    magenta: [35, 39],
    cyan: [36, 39]
};
tools['log'] = {};
for(var name in styles){
    // var fn = styles[name],
    //     open = '  \x1b['+ fn[0] +'m',
    //     close = '\x1b['+ fn[1] +'m ';
    // inject(name, open, close);
    inject(name);
}
function inject(name, open, close){
    tools['log'][name] = function(msg){
        // console.log(open + msg + close);
        console.log(chalk[name](msg));
    };
}

module.exports = tools;