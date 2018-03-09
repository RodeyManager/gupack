/**
 * Created by Rodey on 2017/6/29.
 */

'use strict';

const gulp = require('gulp'),
    gulpClean = require('gulp-clean'),
    prettyTime = require('pretty-hrtime'),
    util = require('../utils'),
    taskSequence = require('../task_sequence'),
    T = require('../tools'),
    serconf = require('../serconf'),
    Deploy = require('./deploy'),
    TaskNode = require('./taskNode');

//获取配置
const //是否启动本地服务
    isStartServer = T.hasArg(['s', 'server']),
    isOpenBrowser = T.hasArg(['o', 'open-browser']);

class Gupack {
    constructor(config, gulpInstance) {
        this.env = T.getArg(['e', 'env']) || 'local';
        this.project = T.getArg(['p', 'project']);
        this.sourceDir = 'src';
        this.buildDir = 'dist';
        this.indexFile = '';
        this.host = serconf.servers.host;
        this.port = serconf.servers.port;
        this.sport = serconf.servers.sport;
        this.liveDelay = serconf.servers.liveDelay;
        this.devServer = isStartServer;
        this.openBrowser = isOpenBrowser;
        this.statics = null;
        this.hostname = null;
        // 默认编译前清空编译输出路径下所有文件
        this.startClean = true;
        this.isRunAloneTask = false;
        this.watch = true;
        this.cleans = [];
        this.cleansFilter = ['!.svn', '!.git'];
        this.buildTasks = [];
        this.tasks = [];
        this.relies = {};
        this.watchers = {};
        this.basePath = process.cwd();
        this.gulp = gulpInstance || gulp;
        this.server = null;
        this.runIndex = 0;
        this.taskStartCallback = null;
        this.taskStopCallback = null;
        this.allTaskDoneCallback = null;
        this.deploy = null;
        this.deploies = [];

        for (let prop in config) {
            if (config.hasOwnProperty(prop)) {
                this[prop] = config[prop];
            }
        }

        this.init();
    }

    init() {
        // 初始化路径
        this.initPaths();
        // 初始化发布部署相关
        this.initDeploy();
        // 初始化tasks
        this.initTasks();
        // 在执行任务之前进行清理
        this.initClean();
        // 重组tasks，按照rely
        // this.recombineTasks();
        // 监听文件变化
        this.watch && this.initWatch();
        //添加清理任务
        // this.startClean &&
        this.tasks.unshift('build._cleans');
    }

    initPaths() {
        this.basePath = T.getArg('cwdir') || process.cwd();
        this.root = this.basePath;
        if (!T.isAbsolutePath(this.sourceDir)) {
            this.sourceDir = T.Path.resolve(this.basePath, this.sourceDir || 'src');
        }
        if (!T.isAbsolutePath(this.buildDir)) {
            this.buildDir = T.Path.resolve(this.basePath, this.buildDir || 'dist');
        }
    }

    // 初始化部署相关对象（SFTP）
    initDeploy() {
        if (util.isObject(this.deploy)) {
            if (!this.deploy['localPath']) {
                this.deploy.localPath = T.Path.join(this.buildDir, '/**/*');
            }
            this.deploy = new Deploy(this.deploy);
            this.deploies.push(this.deploy);
        } else if (util.isArray(this.deploy)) {
            this.deploies = this.deploy.map(d => {
                if (!d['localPath']) {
                    d.localPath = T.Path.join(this.buildDir, '/**/*');
                }
                return new Deploy(d);
            });
            // this.deploies = this.deploy;
        }
    }

    initClean() {
        if (!util.isArray(this.cleans)) return false;
        this.cleansFilter = this.cleansFilter.concat(this.buildDir).map(cf => {
            return '!' + cf.replace(/^!/i, '');
        });
        if (this.cleans.length !== 0) {
            this.cleans = this.cleans.concat(this.cleansFilter);
            this.gulp.task('build._cleans', () => {
                return this.gulp.src(this.cleans).pipe(gulpClean({ read: true }));
            });
        }
    }

    initTasks() {
        if (!util.isObject(this.buildTasks)) {
            T.log.red(`× ${new TypeError('参数 buildTask 未找到或类型错误（buildTask必须是一个对象Object）' + '\n× 请您检查项目的gupack-config.js文件配置')}`);
            process.exit(1);
            return false;
        }

        let tasks = this.buildTasks;
        for (let key in tasks) {
            if (tasks.hasOwnProperty(key)) {
                this.buildTasks[key] = new TaskNode(tasks[key], this);
            }
        }
        this.setTask();

        this.tasks = Object.keys(this.buildTasks).map(taskName => {
            let task = this.buildTasks[taskName];
            this.gulp.task(taskName, this.buildTasks[taskName]['rely'] || [], done => {
                return !!task.run === true ? task.getTaskFunction(done) : done();
            });
            return taskName;
        });
    }

    initWatch() {
        let watchers = this.watchers,
            relies = this.relies;

        Object.keys(watchers).length !== 0 &&
            (() => {
                this.gulp.task('build._watch', () => {
                    let source, watcher;
                    Object.keys(watchers).forEach(k => {
                        source = watchers[k];
                        let ts = [];
                        //查找依赖，如: build.html的rely包含 build.css
                        //当build.css的watch中的文件变化，将反转执行task（build.css -> build.html）
                        Object.keys(relies).forEach(rely => {
                            if (relies[rely] && relies[rely].indexOf(k) !== -1) {
                                ts.unshift(rely);
                            }
                        });
                        ts.push(k);
                        watcher = this.gulp.watch(source, ts);
                    });
                });
                //添加监听任务
                this.tasks.push('build._watch');
            })();
    }

    recombineTasks() {
        //先存储所有被 rely的
        let paiallels = [], //并行
            sequences = []; //串行

        Object.keys(this.relies).forEach(rely => {
            if (util.isArray(this.relies[rely]) && this.relies[rely].length !== 0) {
                this.relies[rely].forEach(task => {
                    if (paiallels.indexOf(task) === -1) {
                        paiallels.unshift(task);
                    }
                });
            }
        });
        //根据rely和taskName重组顺序
        Object.keys(this.relies).forEach(rely => {
            if (this.relies[rely] && paiallels.indexOf(rely) !== -1) {
                let index = paiallels.indexOf(rely);
                let removeTemp = paiallels.splice(index, 1);
                sequences.unshift(removeTemp[0]);
            } else if (paiallels.indexOf(rely) === -1) {
                sequences.push(rely);
            }
        });

        paiallels.length !== 0 && sequences.unshift(paiallels);
        this.tasks = sequences;
    }

    setTask() {
        let tasks = this.buildTasks;
        let tns = Object.keys(tasks);

        tns.forEach(tn => {
            let task = tasks[tn];
            task.name = tn;
            // 过滤 task.run 为false的
            // if(task.rely){
            //     let rls = [];
            //     task.rely.forEach(ry => {
            //         if(!!tasks[ry]['run'] === true){
            //             rls.push(ry);
            //         }
            //     });
            //     task.rely = rls;
            // }
            if (task.watch || !this.nowatch) {
                this.watchers[tn] = task.watch;
            }
            this.relies[tn] = task.rely;
            task.dest && task.clean !== false && this.cleans.push(task.dest);
        });
    }

    addEvent() {
        let self = this,
            logCache = [],
            // 开始编译状态，emit socket browser
            isStart = false,
            tasks = Object.keys(this.buildTasks),
            finishMsg = `√ Builded finish OK =^_^= (^_^) =^_^= !!! \n\r`;

        this.gulp.on('task_start', e => {
            let name = e.task,
                task = this.buildTasks[name],
                isRun = task instanceof TaskNode && task.run === true;
            if (util.isFunction(this.taskStartCallback)) {
                return this.taskStartCallback.call(this, e);
            }
            if (tasks.indexOf(name) > -1 && logCache.indexOf(name) === -1 && isRun) {
                T.log.green(`→ [${T.getTime()}] Starting '${name}' ...`);
            }
            if (!isStart) {
                isStart = true;
                this.server && this.server.emitBuilding();
            }
        });
        this.gulp.on('task_stop', e => {
            let name = e.task,
                task = this.buildTasks[name],
                isRun = task instanceof TaskNode && task.run === true;
            if (util.isFunction(this.taskStopCallback)) {
                return this.taskStopCallback.call(this, e);
            }
            if (tasks.indexOf(name) > -1 && logCache.indexOf(name) === -1 && isRun) {
                T.log.green(`√ [${T.getTime()}] Finished '${e.task}', after ${T.msg.yellow(prettyTime(e.hrDuration))}`);
                logCache.push(name);
            }
        });

        this.gulp.on('stop', e => {
            isStart = false;
            logCache = [];
            T.log.yellow(finishMsg);

            // 单独执行task
            if (this.isRunAloneTask) {
                process.exit(1);
                return false;
            }

            if (util.isFunction(this.allTaskDoneCallback)) {
                this.allTaskDoneCallback.call(this, e);
                this.startDeploy();
                this.startServer();
                return false;
            }

            this.startDeploy();
            this.startServer();
        });

        this.gulp.on('task_err', e => {
            T.log.red(`'${e.task}' errored after ${prettyTime(e.hrDuration)} \n\r ${Gupack.formatError(e)}`);
            self.server && self.server.stop();
        });

        this.gulp.on('task_not_found', err => {
            T.log.red(`Task \'' + err.task + '\' is not found \n\r Please check the documentation for proper gupack-config file formatting`);
            process.exit(1);
            self.server && self.server.stop();
        });
    }

    startServer() {
        if (!this.devServer || this.runIndex) return;
        process.nextTick(() => {
            // 可自定义devServer，开发环境热更新服务器
            if (util.isFunction(this.devServer)) {
                this.devServer.call(this);
            }
            if (this.devServer === true) {
                this.server = require('../gupackServer');
                this.server.createLiveServer(this);
            }
            // !this.watch && process.exit(0);
            this.runIndex++;
        });
    }

    startDeploy() {
        // 支持多节点部署
        if (this.deploies.length > 0) {
            this.deploies.forEach(deploy => {
                deploy && deploy instanceof Deploy && deploy.start();
            });
        }
    }

    setDefaultTask() {
        this.gulp.task('default', this.tasks);
    }

    run() {
        let _run = () => {
            this.addEvent();
            //清理成功后执行任务列表
            this.setDefaultTask();
            this.gulp.start.apply(this.gulp, this.gulp.tasks);
        };

        if (this.startClean) {
            Gupack.cleanBuildDir(e => {
                _run();
            }, this.buildDir);
        } else {
            _run();
        }
    }

    runTask(name) {
        let ts = [];
        if (util.isArray(name)) {
            name.forEach(nm => {
                ts.push(nm);
            });
        } else {
            ts = [name];
        }

        ts = ts.filter(t => {
            let isIndex = util.isObject(this.buildTasks[t]);
            if (!isIndex) T.log.red(`× not fount task: '${t}'`);
            return isIndex;
        });

        if (this.startClean) {
            ts.forEach(t => {
                let taskNode = this.buildTasks[t],
                    dest = taskNode.dest;
                if (!T.fsa.removeSync(dest)) T.log.green(`√ '${dest}' clean successfully !!!`);
                else T.log.green(`× '${dest}' clean failed (╯︵╰,)`);
            });
        }

        if (ts.length === 0) {
            T.log.red(`× ${new TypeError('not fount task')}`);
            process.exit(1);
        } else {
            this.isRunAloneTask = true;
            this.addEvent();
            this.gulp.task('default', ts);
            this.gulp.start.apply(this.gulp, ts);
        }
    }

    runDeploy() {
        this.startDeploy();
    }

    static cleanBuildDir(cb, dist) {
        let startDate = Date.now();
        T.log.green('→ clean starting......');
        T.fsa.remove(T.Path.join(dist, '**/*'), err => {
            if (err) {
                T.log.red('× clean failed: ' + err.toString());
                process.exit(1);
            } else {
                let time = (Date.now() - startDate) * 0.001;
                T.log.green(`√ clean successfully !!!, after ${T.msg.yellow(time.toFixed(2))} s`);
                cb && cb();
            }
        });
    }
    static formatError(e) {
        if (!e.err) {
            return e.message;
        }
        if (typeof e.err.showStack === 'boolean') {
            return e.err.toString();
        }
        if (e.err.stack) {
            return e.err.stack;
        }
        return new Error(String(e.err)).stack;
    }
}

module.exports = Gupack;
