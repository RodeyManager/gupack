/**
 * Created by Rodey on 2017/6/7.
 */

const
    babel       = require('babel-core'),
    fs          = require('fs'),
    extend      = require('extend'),
    through2    = require('through2');

const PLUGIN_NAME = 'GPBabel';

//获取文件内容
function getFileContent(file){
    if(!fs.existsSync(file)) return '';
    return fs.readFileSync(file, { encoding: 'utf8' });
}

function GPBabel(options){
    var option = extend({
        presets: ['es2015', 'es2016', 'es2017', 'stage-2'],
        babelrc: false,
        plugins: ["transform-remove-strict-mode"]
    }, options || {});
    return through2.obj(function(file, enc, next){

        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Stream content is not supported'));
            return next(null, file);
        }

        if (file.isBuffer()) {
            try {
                var content = getFileContent(file.path) || file.contents.toString('utf8') || '',
                    result = babel.transform(content, option);
                file.contents = new Buffer(result.code);
                // console.log(result.code);
            }
            catch (err) {
                this.emit('error', new PluginError(PLUGIN_NAME, ''));
            }
        }
        this.push(file);
        return next();

    });

}

module.exports = GPBabel;
