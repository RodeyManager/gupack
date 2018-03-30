/**
 * Created by Rodey on 2017/8/5.
 */
'use strict';

const through2 = require('through2'),
    browserify = require('browserify'),
    PluginError = require('plugin-error');

const PLUGIN_NAME = 'gulpBrowserify';

//将压缩后的内容替换到html中
function gulpBrowserify(options) {
    options = options || {};

    return through2.obj(function(file, enc, next) {
        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Stream content is not supported'));
            return next(null, file);
        }

        if (file.isBuffer()) {
            let bw = browserify(options).add(file.path);
            if (Array.isArray(options.external)) {
                bw = bw.external(options.external || []);
            }
            bw.bundle((err, src) => {
                if (!err) {
                    file.contents = new Buffer(src);
                    this.push(file);
                    return next();
                } else {
                    this.emit('error', new PluginError(PLUGIN_NAME, err.message || 'browserify bundle error'));
                }
            });
        }
    });
}

module.exports = gulpBrowserify;
