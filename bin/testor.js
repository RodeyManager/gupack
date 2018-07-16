/**
 * Created by Rodey on 2017/8/18.
 * 测试
 * use:
 *  gupack test （单元测试默认必须放在项目根目录的test目录里面）
 *  gupack test filename ... filename (可单个，空格隔开多个执行)
 *
 * 测试文件名称中必须包括"test"或"spec"字符
 * 命令行中可以省略.js后缀
 */

'use strict';

const T = require('../lib/tools'),
    Mocha = require('mocha'),
    mochaOptions = require('mocha/bin/options'),
    vsf = require('vinyl-fs'),
    mps = require('map-stream'),
    fsrr = require('fs-readdir-recursive');

const cwd = process.cwd();
const packageConfig = require(T.Path.resolve(cwd, 'package.json'));
const testFolder = (packageConfig['test'] && T.Path.resolve(cwd, packageConfig['test'])) || T.Path.resolve(cwd, 'test');
const files = fsrr(testFolder, f => f);
const argfiles = T.argv._.slice(1);

class Testor {
    constructor(files) {
        this.files = files || [];
        this.mca = new Mocha(mochaOptions);
    }

    test() {
        // command args
        // gupack test login.spec.js
        // gupack test login.spec  (省略后缀.js)
        // gupack test login.spec user.spec (多个执行)
        if (argfiles && argfiles.length > 0) {
            this.files = argfiles.map(file => file.replace(/^([\s\S]+?)(.js)?$/g, '$1.js'));
        }
        this.testAll();
    }

    testAll() {
        if (Array.isArray(this.files) && this.files.length > 0) {
            this.files = this.files.filter(file => {
                let info = T.Path.parse(file);
                return info.ext === '.js' && /[.-](test|spec)/i.test(info.name);
            });
            this.files.map(file => {
                this.mca.addFile(T.Path.resolve(testFolder, file));
            });
            this.mca.run();
        } else {
            T.log.error('× Not found test files');
        }
    }
}

module.exports = new Testor(files);
