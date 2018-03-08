/**
 * Created by Rodey on 2017/6/29.
 */
'use strict';

const
    extend = require('extend'),
    PluginError = require('gulp-util').PluginError,
    plumber = require('gulp-plumber'),
    util = require('../utils'),
    publish = require('../plugins/publish'),
    T = require('../tools');

class TaskNode {

    /**
     * 任务
     * @param config        任务配置
     * @param gupack  Gupack对象
     */
    constructor(config, gupack) {

        this.name = undefined;
        this.src = '';
        this.filters = '';
        this.plugins = [];
        this.watch = '';
        this.run = true;
        this.noWatch = false;
        this.dest = null;
        this.rely = undefined;
        this.loader = {};
        this.pathPrefix = '';
        this.base = T.argv['cwdir'] || process.cwd();
        this.gupack = undefined;
        this._if = undefined;
        this.pluginCache = {};
        this.merge = false;
        this.stream = null;
        // 编译前
        this.before = null;
        // 编译后
        this.after = null;

        for (let prop in config) {
            if (config.hasOwnProperty(prop)) {
                this[prop] = config[prop];
            }
        }

        if (gupack) {
            this.gupack = gupack;
            this.gulp = this.gupack.gulp;
            this.basePath = this.gupack.basePath;
            this.sourceDir = this.gupack.sourceDir;
            this.buildDir = this.gupack.buildDir;

        }

        this.init();

    }

    init() {

        //watcher
        this.watch = this.getTaskWatch();

        //源文件 src
        this.src = this.getSource();

        //过滤文件 filters
        this.filters = this.getFilters();
        this.src = this.src.concat(this.filters);

        //插件样式
        this.plugins = this.getPlugins();
        this.src = this.src.concat(this.plugins);

        //合并压缩后的输出
        this.dest = this.getDist();

    }

    getTaskWatch() {

        let source = this.src || [],
            watcher = this.watch || source || [],
            pathPrefix = this.pathPrefix || '';

        if (!this.watch && this.pathPrefix.length > 0) {
            if (util.isString(source)) {
                watcher = T.Path.join(pathPrefix, source);
            } else if (util.isArray(source)) {
                watcher = source.map(s => {
                    return T.Path.join(pathPrefix, s);
                });
            } else {
                throw new ReferenceError('没有可用的源文件，请设置需要监听的文件或目录');
            }
        }
        if (!this.noWatch) {
            watcher = this.loadWatch(watcher);
        }
        return watcher;
    }

    getSource() {
        let source = this.src || [],
            pathPrefix = this.pathPrefix || '';
        (source && source.length !== 0) &&
        (source = this.loadSource(source, pathPrefix));
        return source;
    }

    getFilters() {
        let filters = this.filters || [];
        if (filters.length > 0) {
            filters = this.loadSource(filters, this.pathPrefix, '!');
        }
        return filters;
    }

    getPlugins() {
        let plugins = this.plugins || [];
        if (plugins.length > 0) {
            plugins = this.loadSource(plugins, this.pathPrefix);
        }
        return plugins;
    }

    getDist() {
        return this.dest && T.Path.resolve(this.buildDir, this.dest);
    }

    getTaskFunction(done) {

        // 加载的gulp插件
        let loaders = this.loader;
        this.stream = this.gulp.src(this.src);

        // 如果 loader 为Function，则必须返回stream
        if (util.isFunction(loaders)) {
            this.stream = loaders.call(this, done);
            // this.stream && this.excuteDest();
            return done();
            // return this.stream;
        }

        this.stream = this.stream.pipe(plumber());

        // 执行编译前 (必须返回stream)
        if (util.isFunction(this.before)) {
            this.stream = this.before.call(this, this.stream, done) || this.stream;
        }

        // 执行加载loader
        this.excuteLoader(loaders, done);

        // 判断是否存在hostname配置,如果存在则执行替换任务(一般在release)
        this.excutePublish();

        // 执行编译后
        if (util.isFunction(this.after)) {
            this.stream = this.after.call(this, this.stream, done) || this.stream;
        }

        this.stream = this.stream.pipe(plumber());

        // 输出
        this.excuteDest();

        return this.stream;
    }

    loadWatch(source, pathPrefix) {
        pathPrefix = pathPrefix || '';
        if (!source) return '';
        if (util.isString(source)) {
            source = T.Path.resolve(this.sourceDir, pathPrefix, source);
        } else {
            source = source.map(src => {
                return T.Path.resolve(this.sourceDir, pathPrefix, src);
            });
        }
        return source;
    }

    loadSource(source, pathPrefix, nos) {
        nos = nos || '';
        pathPrefix = pathPrefix || '';
        if (!source) return '';
        if (util.isString(source)) {
            source = [nos + T.Path.resolve(this.sourceDir, pathPrefix, source)];
        } else {
            source = source.map(src => {
                return nos + T.Path.resolve(this.sourceDir, pathPrefix, src);
            });
        }
        return source;
    }

    excuteLoader(loaders, done) {
        process.chdir(this.basePath);
        this.pluginCache = {};

        util.isObject(loaders) &&
            !util.isEmptyObject(loaders) &&
            (Object.keys(loaders).forEach(loaderName => {

                let pluginName = loaderName,
                    plugin = this.pluginCache[pluginName],
                    options = loaders[loaderName];

                if (util.isFunction(options)) {
                    this.stream = options.call(this, this.stream, done);
                    return false;
                }

                if (!plugin) {
                    plugin = (() => {
                        let ptemp = loaders[loaderName],
                            pp, pluginPath;
                        ptemp && util.isObject(ptemp) && ptemp['pluginName'] && (pluginName = ptemp['pluginName']);
                        if (ptemp && util.isObject(ptemp)) {
                            ptemp['pluginName'] && (pluginName = ptemp['pluginName']);
                            ptemp['pluginPath'] && (pluginPath = ptemp['pluginPath']);
                        }

                        // 设置插件路径
                        if (pluginPath) {
                            pluginPath = this.getPluginPath(pluginPath, pluginName);
                            pp = require(pluginPath);
                        } else {
                            try {
                                // 从项目src/node_modeuls中找
                                pp = require(T.Path.resolve(this.basePath, `node_modules/${ pluginName }/`));
                            } catch (e) {
                                // 从gupack中的node_modules中找
                                pp = require(pluginName);
                            }
                        }
                        if (!pp) {
                            throw new PluginError(loaderName, 'loader is  not loaded, Stream content is not supported');
                        }
                        pp && (this.pluginCache[pluginName] = pp);
                        return pp;
                    })();
                }

                // 某些插件需要区分环境，
                // 可能在开发环境不需要执行，而在生产或测试环境需要执行
                if (plugin && util.isObject(options) && '_if' in options) {
                    options._if === true && (this.stream = this.stream.pipe(plugin(options)));
                } else {
                    this.stream = this.stream.pipe(plugin(options));
                }

            }));
    }

    excutePublish() {
        if (!util.isEmptyObject(this.gupack.statics) && this.gupack.statics !== false) {
            this.stream = this.stream.pipe(publish(this.gupack.statics));
        }
    }

    excuteDest() {
        if (this.dest) {
            this.stream = this.stream.pipe(this.gulp.dest(this.dest || this.buildDir));
        }
    }

    // 获取自定义插件路径
    getPluginPath(pluginPath, pluginName) {
        if (!T.isAbsolutePath(pluginPath)) {
            pluginPath = T.Path.resolve(this.basePath, pluginPath);
        }
        if (!/.js$/i.test(pluginPath)) {
            pluginPath = T.Path.resolve(pluginPath, pluginName);
        }
        return pluginPath;
    }

}


module.exports = TaskNode;