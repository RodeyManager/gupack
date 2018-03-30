/**
 * Created by Rodey on 2015/12/11.
 */
'use strict';

const fs = require('fs'),
    path = require('path'),
    os = require('os'),
    prompt = require('prompt'),
    fsa = require('fs-extra'),
    util = require('./utils'),
    argv = require('minimist')(process.argv.slice(2));

let tools = {
    regexp: /(\{\{[\s\S]*?\}\}|@[\s\S]*?)[\/|\\]*/gi,

    getProjectName: function() {
        return String(argv._[1]) || tools.getArg(['p', 'project']) || path.parse(process.cwd())['name'];
    },

    getConfig: function(cwdir) {
        let projectPath = cwdir || process.cwd(),
            configFile = path.resolve(projectPath, 'gupack-config.js'),
            cfgFile = argv['f'] || argv['gupackfile'];
        if (cfgFile) {
            configFile = path.isAbsolute(cfgFile) ? cfgFile : path.resolve(projectPath, cfgFile);
        }

        if (fs.existsSync(configFile)) {
            return require(configFile);
        } else {
            // return require('./config/default_config');
            tools.log.red(`× 不是有效的项目：缺少配置文件(gupack-config.js) \n`);
            process.exit(1);
        }
    },

    isInSourcePath: function() {
        return fs.existsSync('./gupack-config.js');
    },

    setCWD: function(cwd) {
        process.chdir(cwd);
    },

    isAbsolutePath: function(p) {
        return path.isAbsolute(p) || ':' === p.slice(1, 2);
    },

    //获取正确的编译地址
    getBuildPath: function(base, buildpath) {
        if (!tools.isAbsolutePath(buildpath)) {
            //相对路径
            return path.resolve(base, buildpath);
        } else {
            return buildpath;
        }
    },

    getStaticPath: function(filePath) {
        return filePath.replace(/^.{1,2}[\/\\]{1,2}/g, '');
    },

    getFileContent: function(filePath) {
        let content;
        if (fs.existsSync(filePath)) {
            content = fs.readFileSync(filePath, 'utf8');
        }
        return content || '';
    },

    /**
     * 替换变量
     * @param content       全文
     * @param regx          正则、字符串
     * @param value         值
     * @returns {void|string|XML|*}
     */
    replaceVar: function(content, regx, value) {
        regx = regx || /\{\{\@[^\{]*?\}\}/gi;
        return (content = content.replace(regx, (m, $1) => {
            return value;
        }));
    },

    getTime: function() {
        let date = new Date();
        return `${fn(date.getHours())}:${fn(date.getMinutes())}:${fn(date.getSeconds())}`;
        function fn(n) {
            return n < 10 ? `0${n}` : n;
        }
    },

    prompt: function(message, cb) {
        return new Promise(function(resolve, reject) {
            prompt.get(
                [
                    {
                        name: 'ok',
                        message: message
                    }
                ],
                (err, result) => {
                    if (/^y|yes|ok|\u662f$/i.test(result.ok)) {
                        cb && cb();
                        resolve.apply(prompt, [result.ok]);
                    } else {
                        reject('Aborting');
                        prompt.stop();
                    }
                }
            );
        });
    },

    cmdify: function(command) {
        if (os.platform() !== 'win32') {
            return command;
        }
        command = command.split(' ');
        command[0] += '.cmd';
        return command.join(' ');
    },

    pathRegxs: [
        // /url\([\"\']?([^\"\']*)[\"\']?\)/gi,
        // /src=[\"\']?([^\"\']*)[\"\']?/gi,
        // /href=[\"\']?([^\"\']*)[\"\']?/gi

        /url\([\"\']?([^\"\']*)[\"\']?\)/gi,
        /(?:img|audio|video|script)[\S\s]*?src=[\"\']?([^\"\']*)[\"\']?/gi,
        /(?:link)[\S\s]*?href=[\"\']?([^\"\']*)[\"\']?/gi
    ],

    fillAlign: function(text, max, dir = 'right', char = ' ') {
        let s = text,
            l = max - s.length;
        for (let i = l; l > 0; l--) {
            s = dir === 'left' ? s + char : char + s;
        }
        return s;
    },

    hasArg: function(ags) {
        return !!tools.getArg(ags);
    },
    getArg: function(ags) {
        if (util.isString(ags)) return ags in argv && argv[ags];
        if (util.isArray(ags) && ags.length > 0) {
            for (let rs, i = 0; i < ags.length; ++i) {
                rs = argv[ags[i]];
                // 参数如果是数字，minimist返回的将是Number
                // 0可代表为false
                if (rs === 0) return String(rs);
                if (rs) return rs;
            }
        }
        return null;
    },

    parseArgv: function(argv) {
        argv = argv || process.argv.slice(2);
        let rs = { _: [] };
        let index = 0;
        while (argv && argv.length > 0) {
            let aKey = argv[0],
                aName = argv[1];
            if (/-+/g.test(aKey)) {
                rs[aKey.replace(/-+/g, '')] = /-+/g.test(aName) ? true : aName;
            } else {
                aName && (rs[aKey] = /-+/g.test(aName) ? true : aName);
                rs._.push(aKey);
            }
            argv.splice(0, 1);
        }
        for (let key in rs) {
            if (rs._.indexOf(key) > -1) {
                delete rs[key];
                rs._ = rs._.filter(item => item === key);
            }
        }
        return rs;
    },

    fs: fs,
    fsa: fsa,
    Path: path,
    argv: argv
};

let styles = {
    red: [31, 39],
    error: [31, 39],
    green: [32, 39],
    success: [32, 39],
    blue: [36, 0],
    info: [36, 0],
    yellow: [33, 39],
    gray: [90, 39],
    start: [90, 39],
    end: [90, 39],
    magenta: [35, 39],
    cyan: [36, 39]
};
tools['log'] = console.log;
tools['msg'] = {};

for (let name in styles) {
    let fn = styles[name],
        open = '\x1b[' + fn[0] + 'm',
        close = '\x1b[' + fn[1] + 'm';
    inject(name, open, close);
    // inject(name);
}
function inject(name, open, close) {
    tools['log'][name] = function(msg) {
        console.log(open + (msg || '') + close);
        // error log
        ['error', 'end'].indexOf(name) > -1 && process.exit(0);
    };
    tools['msg'][name] = function(msg) {
        return open + msg + close;
    };
}

module.exports = tools;
