/**
 * Created by Rodey on 2015/11/5.
 * gupack publish
 * 项目发布，
 * 如果在gulp-config中有设置hostname属性
 * 则将项目中所有资源链接替换，添加hostname
 */

var fs          = require('fs'),
    path        = require('path'),
    through2    = require('through2'),
    tool        = require('./tools');

//根据标签类型获取内容并压缩
var execture = function(file, options){

    var fileContents = file.contents.toString('utf8');
    if(typeof fileContents === 'undefined'){
        fileContents = getFileContent(file.path);
    }
    var content = fileContents;
    tool.pathRegxs.forEach(function(regx){
        content = content.replace(regx, function(match, $1){
            if(/^(https?:|\/\/|data:|about:|javascript:|\?|\<|\{|[@#&])/i.test($1)){
                return match;
            }
            return match.replace($1, options['hostname'] + tool.getRelativePath($1, file.path));
        });
    });
    return content;
};

//获取文件内容
var getFileContent = function(file){
    if(!fs.existsSync(file)) return null;
    return fs.readFileSync(file, { encoding: 'utf8' });
};

//获取压缩后的内容
var getContent = function(file, options){
    return execture(file, options);
};

//将压缩后的内容替换到html中
var publish = function(options){
    options = options || {};
    return through2.obj(function(file, enc, next){

        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Stream content is not supported'));
            return next(null, file);
        }
        if (file.isBuffer()) {
            try {
                var extname = path.extname(file.path);
                if(options['hostname'] && /^\.(html|tpl|jade|md|css|scss|less|styl)/gi.test(extname)){
                    var content = getContent(file, options);
                    //console.log(content);
                    file.contents = new Buffer(content);
                }
            }
            catch (err) {
                this.emit('error', new PluginError(PLUGIN_NAME, ''));
            }
        }
        this.push(file);
        return next();


    });

};

module.exports = publish;