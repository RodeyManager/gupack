/**
 * Created by Rodey on 2016/4/12.
 */


const
    plumber         = require('gulp-plumber'),
    gulpClean       = require('gulp-clean'),
    util            = require('util'),
    tool            = require('./lib/tools'),
    publish         = require('./lib/publish'),
    child           = require('child_process'),
    //gulp            = require(tool.Path.resolve(__dirname, 'node_modules/gulp/index.js')),
    gulp            = require('gulp'),
    taskSequence    = require('./lib/task_sequence'),
    gpbabel         = require('./lib/babel_transform');

//获取配置
const
    projects        = require('./projects.js'),
    cwd             = tool.argv['cwdir'] || process.cwd(),
    resolve         = tool.Path.resolve,
//指定构建的项目名称, 在gulp后面传递参数
    proName         = tool.argv['p'] || tool.argv['project'],
//是否发布
    isPublish       = tool.argv['publish'],
    empty           = function(){};

//变量
var
    proOpt, projectPath, basePath, sourcePath, buildPath,
    proConfig, tasks, buildTasks, watchers, env, cleans, cleansFilter,
    hostName, isProduction;

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
    cleans = proConfig['clean'] || [];// || [resolve(buildPath, '**', '*')];
    //执行任务前不被清理的
    cleansFilter = (proConfig['cleanFilter'] || ['.svn', '.git']).map(function(path){ return '!' + resolve(buildPath, path) });
    //需要监听
    watchers = proConfig['watchers'] || {};
    //编译选项
    buildTasks = proConfig['buildTasks'] || {};
    //是否指定域名，release
    hostName = proConfig['hostname'];
    //指定构建环境 stg: 测试；prd: 生成
    env = tool.argv['e'] || tool.argv['env'] || proConfig['env'] || 'stg';
    isProduction = (env === 'prd' || env === 'production');
    if(isPublish){
        env = 'prd';
    }

})();

//缓存插件
var gulplugins = {},
    taskCache = {},
    relies = {};

if(util.isObject(buildTasks)){

    Object.keys(buildTasks).forEach(taskName =>{

        var build = buildTasks[taskName],
            source = build['src'] || [],
            watcher = build['watch'] || source || [],
            pathPrefix = build['pathPrefix'] || '';

        // console.log(taskName, build['run'] === false);
        // if(build['run'] === false)  continue;

        if(build['run'] !== false){

            //watcher
            if(!build['watch'] && pathPrefix){
                if(util.isString(source)){
                    watcher = tool.Path.join(pathPrefix, source);
                }else if(util.isArray(source)){
                    watcher = source.map(s =>{
                        return tool.Path.join(pathPrefix, s);
                    });
                }else{
                    throw new ReferenceError('没有可用的源文件，请设置 src 文件地址');
                }
            }
            if(!build['nowatch']){
                watchers[taskName] = loadWatch(watcher);
            }

            //源文件 src
            (source && source.length !== 0)
            && (source = loadSource(source, pathPrefix));

            //过滤文件 filters
            var filters = build['filters'] || [];
            if(filters.length > 0){
                filters = loadSource(filters, pathPrefix, '!');
                source = source.concat(filters);
            }

            //插件样式
            var plugins = build['plugins'] || [];
            if(plugins.length > 0){
                plugins = loadSource(plugins, pathPrefix);
                source = source.concat(plugins);
            }

            //合并压缩后的输出
            var dist = build['dest'] && resolve(buildPath, build['dest']);
            //编译之前需要清理，加入到清理队列中
            build['dest'] && cleans.push(dist);

            taskCache[taskName] = () =>{

                //加载的gulp插件
                var loaders = build['loader'];
                var stream = gulp.src(source);
                stream = stream.pipe(plumber());

                // babel
                if('babel' in build){
                    stream.pipe(gpbabel(build.babel));
                }

                gulplugins[taskName] = {};

                loaders && (Object.keys(loaders).forEach(loader =>{
                    var gulplugin,
                        loaderData = gulplugins[taskName][loader];
                    if(loaderData){
                        gulplugin = loaderData
                    }else{
                        gulplugin = (() =>{
                            var ptemp = loaders[loader], pluginName = ptemp['pluginName'], pp;
                            if(pluginName){
                                pp = require(pluginName);
                            }else{
                                pp = require(loader);
                            }
                            pp && (gulplugins[taskName][loader] = pp);
                            return pp;
                        })();
                    }

                    //某些插件需要区分环境，
                    //可能在开发环境不需要执行，而在生产或者是测试环境需要执行
                    var options = loaders[loader];
                    if(gulplugin && util.isObject(options)){
                        if('_if' in options){
                            options['_if'] && (stream = stream.pipe(gulplugin(options)));
                        }else{
                            stream = stream.pipe(gulplugin(options));
                        }
                    }else{
                        stream = stream.pipe(gulplugin(options));
                    }

                }));

                //判断是否存在hostname配置,如果存在则执行替换任务(一般在release)
                if(isPublish && hostName){
                    stream = stream.pipe(publish({hostname: hostName}));
                }
                stream = stream.pipe(plumber());
                //输出
                if(dist){
                    stream.pipe(gulp.dest(dist || buildPath));
                }
                return stream;
            };

            relies[taskName] = build['rely'] || null;

        }

    });

}

//加载文件
function loadSource(source, pathPrefix, nos){
    nos = nos || '';
    pathPrefix = pathPrefix || '';
    if(util.isString(source)){
        source = [nos + resolve(sourcePath, pathPrefix, source)];
    }else{
        source = source.map(src => {
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
        source = source.map(src => {
            return  resolve(sourcePath, pathPrefix, src);
        });
    }
    return source;
}

//合并当前项目指定的task数组
function isTask(taskname){
    return tasks.indexOf(taskname) !== -1;
}

//在执行任务之前进行清理
if(util.isArray(cleans) && cleans.length !== 0){
    cleans = cleans.concat(cleansFilter);
    //cleans = [tool.Path.resolve(buildPath, '/**/*')];
    //console.log(buildPath);
    gulp.task('build._cleans', () => {
        return gulp.src(cleans).pipe(gulpClean({ read: true }));
    });
}

tasks = Object.keys(taskCache).map(taskName => {
    gulp.task(taskName, buildTasks[taskName]['rely'] || [], () => {
        return taskCache[taskName]();
    });
    return taskName;
});

//重组task，按照rely
//先存储所有被 rely的
var paiallels = [], //并行
    sequences = [], //串行
    removeTemp;

Object.keys(relies).forEach(rely => {

    if(util.isArray(relies[rely]) && relies[rely].length !== 0){
        relies[rely].forEach(task => {
            if(paiallels.indexOf(task) === -1){
                paiallels.unshift(task);
            }
        });
    }
});
//根据rely和taskName重组顺序
Object.keys(relies).forEach(rely => {

    if(relies[rely] && paiallels.indexOf(rely) !== -1){
        removeTemp = paiallels.splice([paiallels.indexOf(rely)], 1);
        sequences.unshift(removeTemp[0]);
    }else if(paiallels.indexOf(rely) === -1){
        sequences.push(rely);
    }
});

paiallels.length !== 0 && sequences.unshift(paiallels);
tasks = sequences;
//console.log(relies, sequences); return;

//监听文件变化
var isWatch = Object.keys(watchers).length !== 0;
isWatch && (() => {
    gulp.task('build._watch', () => {
        console.log('======== Start Watcher ========');
        var source, watcher;
        Object.keys(watchers).forEach(k => {
            source = watchers[k];
            var ts = [];
            //查找依赖，如: build.html的rely包含 build.css
            //当build.css的watch中的文件变化，将反转执行task（build.css -> build.html）
            Object.keys(relies).forEach(rely => {
                if(relies[rely] && relies[rely].indexOf(k) !== -1){
                    ts.unshift(rely);
                }
            });
            ts.push(k);
            watcher = gulp.watch(source, ts);
        });
    });
    //添加监听任务
    tasks.push('build._watch');
})();

//添加清理任务
tasks.unshift('build._cleans');
//console.log(tasks);

//清理成功后执行任务列表
gulp.task('default', taskSequence.apply(gulp, tasks));

