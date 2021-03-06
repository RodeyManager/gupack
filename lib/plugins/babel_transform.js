/**
 * Created by Rodey on 2017/6/7.
 */

'use strict';

const // babel       = require('babel-core'),
    fs = require('fs'),
    extend = require('extend'),
    through2 = require('through2'),
    PluginError = require('plugin-error'),
    T = require('../tools');

let cwd = T.argv['cwdir'] || process.cwd();

const PLUGIN_NAME = 'GPBabel';

let babel;

try {
    babel = require(T.Path.resolve(cwd, 'src/node_modules/babel-core/index'));
} catch (e) {
    babel = require('babel-core');
}

//获取文件内容
function getFileContent(file) {
    if (!fs.existsSync(file)) return '';
    return fs.readFileSync(file, { encoding: 'utf8' });
}

function GPBabel(options) {
    let option = extend(
        {
            presets: ['es2015', 'es2016', 'es2017', 'stage-2'],
            babelrc: false,
            plugins: ['transform-remove-strict-mode']
        },
        options || {}
    );
    return through2.obj(function(file, enc, next) {
        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Stream content is not supported'));
            return next(null, file);
        }

        if (file.isBuffer()) {
            try {
                let content = getFileContent(file.path) || file.contents.toString('utf8') || '',
                    result = babel.transform(content, option);
                file.contents = new Buffer(result.code);
                // console.log(result.code);
            } catch (err) {
                this.emit('error', new PluginError(PLUGIN_NAME, err.message));
            }
        }
        this.push(file);
        return next();
    });
}

module.exports = GPBabel;
