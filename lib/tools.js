/**
 * Created by Rodey on 2015/12/11.
 */

var fs              = require('fs'),
    path            = require('path'),
    util            = require('util'),
    mkdirp          = require('mkdirp'),
    fsa             = require('fs-extra'),
    exec            = require('child_process').exec,
    spawn           = require('child_process').spawn,
    del             = require('del'),
    rp              = require('request-promise'),
    exit            = require('./exit'),
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

    mkdirp: mkdirp,
    fs: fs,
    fsa: fsa,
    del: del,
    Path: path,
    exec: exec,
    spawn: spawn,
    argv: argv,
    exit: exit,
    rp: rp

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
    var fn = styles[name],
        open = '  \x1b['+ fn[0] +'m',
        close = '\x1b['+ fn[1] +'m \n\r';
    inject(name, open, close);
}
function inject(name, open, close){
    tools['log'][name] = function(msg){
        console.log(open + msg + close);
    };
}

module.exports = tools;