/**
 * Created by Rodey on 2016/4/12.
 */

var gulp            = require('gulp'),
    watch           = require('gulp-watch'),
    plumber         = require('gulp-plumber'),
    sourcemaps      = require('gulp-sourcemaps'),
    watch           = require('gulp-watch'),
    del             = require('del'),
    util            = require('util'),
    fse             = require('fs-extra'),
    tool            = require('./lib/tools');


//获取配置
var projects = require('./projects.js');
var cwd = tool.argv['cwdir'] || '';
var resolve = tool.Path.resolve;


//变量
var proName, proOpt, company, projectPath, basePath, sourcePath, buildPath,
    proConfig, tasks, builds, watchers, env, cleans;

//指定构建的项目名称, 在gulp后面传递参数
proName = tool.argv['p'] || tool.argv['project'];
//指定构建后的目录
buildPath = tool.argv['d'] || tool.argv['buildpath'];
if(buildPath && /^\./i.test(buildPath)){
    //相对路径
    buildPath = resolve(cwd, buildPath);
}

//执行初始化
(function __init__(){

    //项目选项
    proOpt = projects.projectList[proName];
    if(!proOpt) throw new Error('该项目不存在！');
    //项目根目录
    basePath = projectPath = proOpt.path;
    if(proOpt['config']){
        proConfig = require(resolve(basePath, proOpt['config']));
    }else{
        proConfig = proOpt;
    }
    //源文件路径
    sourcePath = resolve(basePath, (proConfig['source'] || 'src'));
    //编译产出路径
    buildPath = buildPath || tool.getBuildPath(basePath, (proConfig['build'] || 'build'));
    //执行任务前需要清理的
    cleans = proConfig['clean'] || [buildPath];
    //任务列表
    tasks = proConfig['task'] || [];
    //需要监听
    watchers = proConfig['watchers'] || {};
    //编译选项
    builds = proConfig['builds'] || {};
    //指定构建环境 stg: 测试；prd: 生成
    env = tool.argv['e'] || tool.argv['env'] || proConfig['env'] || 'stg';

})();

//如果任务列表不存在，终止所有流程操作
//if(!tasks || !util.isArray(tasks) || tasks.length === 0)    return;

//缓存插件
var gulplugins = {};

if(util.isObject(builds)){

    Object.keys(builds).forEach(taskName => {

        var build = builds[taskName],
            source = build['src'] || [],
            watcher = build['watch'] || source || [],
            pathPrefix = build['pathPrefix'] || '';

        tasks.push(taskName);

        //watcher
        if(!build['watch'] && pathPrefix){
            if(util.isString(source)){
                watcher = pathPrefix + source;
            }else if(util.isArray(source)){
                watcher = source.map(function(s){
                    return pathPrefix + s;
                });
            }else{
                throw new ReferenceError('没有可用的源文件，请设置 src 文件地址');
            }
        }
        watchers[taskName] = loadWatch(watcher);

        gulp.task(taskName, build['rely'] || [], () => {

            //源文件 src
            (source && source.length !== 0)
            && (source = loadSource(source, pathPrefix));

            //过滤文件 filters
            var filters = build['filters'] || [];
            filters = loadSource(filters, pathPrefix, '!');
            source = source.concat(filters);

            //插件样式
            var plugins = build['plugins'] || [];
            plugins = loadSource(plugins, pathPrefix);
            source = source.concat(plugins);

            //合并压缩后的输出
            var dist = build['dest'] ? resolve(buildPath, build['dest']) : buildPath;

            //加载的gulp插件
            var loaders = build['loader'];
            var stream = gulp.src(source);
            stream = stream.pipe(plumber());
            loaders && (Object.keys(loaders).forEach(loader => {
                var gulplugin = gulplugins[loader] || (()=>{
                        var pp = require(loader);
                        gulplugins[loader] = pp;
                        return pp;
                    })();
                var options = loaders[loader];
                if(util.isObject(options)){
                    if('_if' in options){
                        //如果为生产环境，执行压缩
                        (options['_if'] || env === 'prd' || env === 'production' )
                        && (stream = stream.pipe(gulplugin(options)));
                    }else{
                        stream = stream.pipe(gulplugin(options));
                    }
                }else{
                    stream = stream.pipe(gulplugin(options));
                }
            }));

            //输出
            stream.pipe(gulp.dest(dist));
            return stream;

        });

    });

}

//加载文件
function loadSource(source, pathPrefix, nos){
    nos = nos || '';
    pathPrefix = pathPrefix || '';
    if(util.isString(source)){
        source = [nos + resolve(sourcePath, pathPrefix, source)];
    }else{
        source = source.map(function(src){
            return  nos + resolve(sourcePath, pathPrefix, src);
        });
    }
    return source;
}

function loadWatch(source, pathPrefix){
    pathPrefix = pathPrefix || '';
    if(util.isString(source)){
        source = resolve(sourcePath, pathPrefix, source);
    }else{
        source = source.map(function(src){
            return  resolve(sourcePath, pathPrefix, src);
        });
    }
    return source;
}

//监听文件变化
gulp.task('watch', function(){
    if(watchers){
        var source, watch;
        for(var k in watchers){
            source = watchers[k];
            watch = gulp.watch(source, [k]);
        }
        /*watch.on('change', function(event) {
            console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
        });*/
    }
});

//合并当前项目指定的task数组
function isTask(taskname){
    return tasks.indexOf(taskname) !== -1;
}

//添加监听任务
tasks.push('watch');

//在执行任务之前进行清理
if(util.isArray(cleans) && cleans.length !== 0){
    cleans = cleans.map(function(clean){
        return resolve(buildPath, clean);
    });
    del.sync(cleans, { force: true });
}

//清理成功后执行任务列表
gulp.task('default', tasks);
