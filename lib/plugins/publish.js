/**
 * Created by Rodey on 2015/11/5.
 * gupack publish
 * 项目发布，
 * 如果在gulp-config中有设置hostname属性
 * 则将项目中所有资源链接替换，添加hostname
 */
'use strict';

const
    fs          = require('fs'),
    path        = require('path'),
    through2    = require('through2'),
    PluginError = require('gulp-util').PluginError,
    Statics     = require('../config/statics');

const PLUGIN_NAME = 'publish';

//将压缩后的内容替换到html中
function publish(options){
    let statics = new Statics(options);

    return through2.obj(function(file, enc, next){

        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Stream content is not supported'));
            return next(null, file);
        }

        if (file.isBuffer()) {
            let extname = path.extname(file.path);
            if(statics._if === true && !!statics.hostname && statics.testExt.test(extname)){
                try {
                    let content = statics.execture(file) || file.contents;
                    file.contents = new Buffer(content);
                }
                catch (err) {
                    this.emit('error', new PluginError(PLUGIN_NAME, ''));
                }
            }
        }
        this.push(file);
        return next();

    });

}

module.exports = publish;