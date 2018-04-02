/**
 * Created by Rodey on 2017/8/18.
 * 测试
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
        if (argfiles && argfiles.length > 0) {
            this.files = argfiles;
        }
        this.testAll();
    }

    testAll() {
        if (Array.isArray(this.files) && this.files.length > 0) {
            this.files = this.files.filter(file => {
                let info = T.Path.parse(file);
                return info.ext === '.js' /* && /[\s\S]+?\.test$/i.test(info.name)*/;
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
