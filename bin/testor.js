/**
 * Created by Rodey on 2017/8/18.
 * 测试
 */

'use strict';

const
    T            = require('../lib/tools'),
    Mocha        = require('mocha'),
    mochaOptions = require('mocha/bin/options'),
    vsf          = require('vinyl-fs'),
    mps          = require('map-stream'),
    fsrr         = require('fs-readdir-recursive');

const cwd = process.cwd();
const testFolder = T.Path.resolve(cwd, 'test');
const files = fsrr(testFolder, f => f);

class Testor{

    constructor(files){
        this.files = files || [];
    }

    test(){
        let mca = new Mocha(mochaOptions);
        if(Array.isArray(this.files) && this.files.length > 0){
            this.files = this.files.filter(file => {
                let info = T.Path.parse(file);
                return info.ext === '.js'/* && /[\s\S]+?\.test$/i.test(info.name)*/;
            });
            this.files.map(file => {
                mca.addFile(T.Path.resolve(testFolder, file));
            });
            mca.run();
        }else{
            T.log.red('× Not found test files');
            process.exit(1);
        }
    }

}

module.exports = new Testor(files);