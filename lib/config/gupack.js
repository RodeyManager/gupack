/**
 * Created by Rodey on 2017/6/29.
 */

'use strict';

const gulp = require('gulp'),
  gulpClean = require('gulp-clean'),
  prettyTime = require('pretty-hrtime'),
  extend = require('extend'),
  EventEmitter = require('events').EventEmitter,
  util = require('../utils'),
  T = require('../tools'),
  serconf = require('../serconf'),
  DeployManager = require('../deploy/deployManager'),
  TaskNode = require('./taskNode'),
  TaskNodeFun = require('./taskNodeFun');

process.setMaxListeners(0);

//获取配置
const //是否启动本地服务
  isStartServer = T.hasArg(['s', 'server']),
  isOpenBrowser = T.hasArg(['o', 'open-browser']),
  isSkipBackup = T.hasArg('skip-backup');

class Gupack extends EventEmitter {
  constructor(config, gulpInstance) {
    super();
    this.env = process.env.NODE_ENV || T.getArg(['e', 'env']) || 'local';
    this.project = T.getArg(['p', 'project']);
    this.basePath = T.getArg('cwdir') || process.cwd();
    this.sourceDir = 'src';
    this.buildDir = 'dist';
    this.indexFile = '';
    this.host = serconf.servers.host;
    this.port = serconf.servers.port;
    this.sport = serconf.servers.sport;
    this.liveDelay = serconf.servers.liveDelay;
    this.devServer = isStartServer;
    this.openBrowser = isOpenBrowser;
    this.hostname = null;
    // 默认编译前清空编译输出路径下所有文件
    this.startClean = true;
    this.isRunAloneTask = false;
    this.watch = true;
    this.watchOption = {};
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
    this.isAllTaskDone = true;
    this.isDeploy = T.getArg('skip-deploy');
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
    // 重组tasks，按照rely
    // this.recombineTasks();
    // 监听文件变化
    this.watch && this.initWatch();
    // 在执行任务之前进行清理
    this.initClean();
  }

  initPaths() {
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
      this.deploies.push(this.deploy);
    } else if (util.isArray(this.deploy)) {
      this.deploies = this.deploy.map((d) => {
        if (!d['localPath']) {
          d.localPath = T.Path.join(this.buildDir, '/**/*');
        }
        return d;
      });
    }
    const deploies = extend(true, [], this.deploies);
    this.deployManager = new DeployManager(deploies, this.watch);
  }

  initClean() {
    if (!util.isArray(this.cleans)) return false;
    this.cleansFilter = this.cleansFilter.concat(this.buildDir).map((cf) => {
      return '!' + cf.replace(/^!/i, '');
    });
    if (this.cleans.length > 0) {
      this.cleans = this.cleans.concat(this.cleansFilter);
      this.gulp.task('build._cleans', () => {
        return this.gulp.src(this.cleans).pipe(
          gulpClean({
            read: true
          })
        );
      });
      //添加清理任务
      this.tasks.unshift('build._cleans');
    }
  }

  initTasks() {
    if (!util.isObject(this.buildTasks)) {
      T.log.error(
        `× ${new TypeError(
          '参数 buildTask 未找到或类型错误（buildTask必须是一个对象Object）' +
            '\n× 请您检查项目的gupack-config.js文件配置'
        )}`
      );
      return false;
    }

    let tasks = this.buildTasks;
    for (let key in tasks) {
      if (tasks.hasOwnProperty(key)) {
        const task = tasks[key];
        const taskNode = !util.isFunction(task)
          ? new TaskNode(task, this)
          : new TaskNodeFun(task);
        taskNode.name = key;
        this.buildTasks[key] = taskNode;
      }
    }
    this.setTask();

    this.tasks = Object.keys(this.buildTasks).map((taskName) => {
      let tasker = this.buildTasks[taskName];

      if (!tasker.fun) {
        this.gulp.task(taskName, tasker['rely'], (done) => {
          return !!tasker.run === true ? tasker.getTaskFunction(done) : done();
        });
      } else {
        this.gulp.task(taskName, tasker['rely'], tasker.fun);
      }

      return taskName;
    });
  }

  initWatch() {
    // 如果config.watch中配置了监听列表，则直接使用config.watch
    if (
      util.isArray(this.watch) ||
      util.isString(this.watch) ||
      util.isObject(this.watch)
    ) {
      let watchSource = [],
        ts = null;
      if (util.isArray(this.watch)) {
        watchSource = this.watch.map((w) => T.Path.resolve(this.sourceDir, w));
      }
      if (util.isString(this.watch)) {
        watchSource = [T.Path.resolve(this.sourceDir, this.watch)];
      }
      if (util.isObject(this.watch)) {
        ts = [];
        Object.keys(this.watch).map((w) => {
          watchSource.push(T.Path.resolve(this.sourceDir, this.watch[w]));
          ts.push(w);
        });
      }

      this.gulp.task('build._watch', () => {
        this.gulp.watch(watchSource, this.watchOption || {}, ts || this.tasks);
      });
      //添加监听任务
      return this.tasks.push('build._watch');
    }

    // 否则将根据buildTask中的单个任务配置中的watch字段
    let watchers = this.watchers,
      relies = this.relies;

    Object.keys(watchers).length > 0 &&
      (() => {
        this.gulp.task('build._watch', () => {
          let source, watcher;

          Object.keys(watchers).forEach((k) => {
            source = watchers[k];
            let ts = [];
            //查找依赖，如: build.html的rely包含 build.css
            //当build.css的watch中的文件变化，将反转执行task（build.css -> build.html）
            Object.keys(relies).forEach((rely) => {
              if (relies[rely] && relies[rely].indexOf(k) !== -1) {
                ts.unshift(rely);
              }
            });
            ts.push(k);
            watcher = this.gulp.watch(source, this.watchOption || {}, ts);
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

    Object.keys(this.relies).forEach((rely) => {
      if (util.isArray(this.relies[rely]) && this.relies[rely].length !== 0) {
        this.relies[rely].forEach((task) => {
          if (paiallels.indexOf(task) === -1) {
            paiallels.unshift(task);
          }
        });
      }
    });
    //根据rely和taskName重组顺序
    Object.keys(this.relies).forEach((rely) => {
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

    tns.forEach((tn) => {
      let task = tasks[tn];
      task.name = tn;
      if (task.watch && !this.nowatch) {
        this.watchers[tn] = task.watch;
      }
      this.relies[tn] = task.rely;
      task.dest && task.beforeClean !== false && this.cleans.push(task.dest);
    });
  }

  addEvent() {
    let self = this,
      logCache = [],
      // 开始编译状态，emit socket browser
      isStart = false,
      tasks = Object.keys(this.buildTasks),
      finishMsg = `√ Builded finish OK =^_^= (^_^) =^_^= !!! \n\r`;

    this.gulp.on('task_start', (e) => {
      this.isAllTaskDone = false;
      let name = e.task,
        task = this.buildTasks[name],
        isRun =
          (task instanceof TaskNode || task instanceof TaskNodeFun) &&
          task.run === true;
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
    this.gulp.on('task_stop', (e) => {
      this.isAllTaskDone = false;
      let name = e.task,
        task = this.buildTasks[name],
        isRun =
          (task instanceof TaskNode || task instanceof TaskNodeFun) &&
          task.run === true,
        duration = prettyTime(e.hrDuration);
      if (util.isFunction(this.taskStopCallback)) {
        return this.taskStopCallback.call(this, e);
      }
      if (tasks.indexOf(name) > -1 && logCache.indexOf(name) === -1 && isRun) {
        T.log.green(
          `√ [${T.getTime()}] Finished '${e.task}', after ${T.msg.yellow(
            duration
          )}`
        );
        logCache.push(name);
        this.emit('finish_task', {
          task: e.task,
          name,
          duration
        });
      }
    });

    this.gulp.on('stop', (e) => {
      isStart = false;
      logCache = [];

      // 单独执行task
      if (this.isRunAloneTask) {
        return process.exit(0);
      }

      if (util.isFunction(this.allTaskDoneCallback)) {
        this.allTaskDoneCallback.call(this, e);
        _doneNext.apply(this);
        return false;
      } else {
        T.log.yellow(finishMsg);
      }
      this.emit('finish_all_task', {
        event: e,
        message: finishMsg
      });

      // 判断watch
      _doneNext.apply(this);
    });

    this.gulp.on('task_err', (e) => {
      self.server && self.server.stop();
      T.log.error(
        `'${e.task}' errored after ${prettyTime(
          e.hrDuration
        )} \n\r ${Gupack.formatError(e)}`
      );
    });

    this.gulp.on('task_not_found', (err) => {
      self.server && self.server.stop();
      T.log.error(
        `Task \'' + err.task + '\' is not found \n\r Please check the documentation for proper gupack-config file formatting`
      );
    });

    function _doneNext() {
      this.emit('finish_all_task_next_before', {
        gupack: this
      });

      // 开启本地live静态服务器
      this.devServer && this.startServer();

      const deploies = extend(true, [], this.deploies);
      if (this.isDeploy) {
        if (deploies.length > 0) {
          T.log.yellow(
            `→ has deploys. but now skip deploy(arg: --skip-deploy).`
          );
        }
        return T.log.end();
      }
      if (!this.deployManager) {
        this.deployManager = new DeployManager(deploies);
      } else {
        this.deployManager.setDeploy(deploies);
      }
      this.deployManager.startDeploy(isSkipBackup, this.watch);
      this.emit('finish_all_task_next_after', {
        gupack: this
      });
      this.isAllTaskDone = true;
    }
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
      this.runIndex++;
    });
  }

  setDefaultTask() {
    this.gulp.task('default', this.tasks);
    // this.gulp.task('default', runSequence.apply(this.gulp, this.tasks));
  }

  run() {
    let _run = () => {
      if (!this.isAllTaskDone) {
        return T.log.yellow(`» The last task has not been completed )====( `);
      }
      this.addEvent();
      //清理成功后执行任务列表
      this.setDefaultTask();
      this.gulp.start.apply(this.gulp, this.tasks);
    };

    if (this.startClean) {
      Gupack.cleanBuildDir((e) => {
        _run();
      }, this.buildDir);
    } else {
      _run();
    }
  }

  runTask(name) {
    let ts = [];
    if (util.isArray(name)) {
      name.forEach((nm) => {
        ts.push(nm);
      });
    } else {
      ts = [name];
    }

    ts = ts.filter((t) => {
      let isIndex = util.isObject(this.buildTasks[t]);
      if (!isIndex) T.log.red(`× not fount task: '${t}'`);
      return isIndex;
    });

    if (this.startClean) {
      ts.forEach((t) => {
        let taskNode = this.buildTasks[t],
          dest = taskNode.dest;
        if (!T.fsa.removeSync(dest))
          T.log.green(`√ '${dest}' clean successfully !!!`);
        else T.log.green(`× '${dest}' clean failed (╯︵╰,)`);
      });
    }

    if (ts.length === 0) {
      T.log.error(`× ${new TypeError('not fount task')}`);
    } else {
      this.isRunAloneTask = true;
      this.addEvent();
      this.gulp.task('default', ts);
      this.gulp.start.apply(this.gulp, ts);
    }
  }

  runDeploy() {
    this.deployManager.startDeploy(isSkipBackup, false);
  }

  runBackup() {
    this.deployManager.startBackup(null);
  }

  runRollback() {
    this.deployManager.startRollback();
  }

  static cleanBuildDir(cb, dist) {
    let startDate = Date.now();
    T.log.green('→ clean starting ......');
    T.fsa.remove(T.Path.join(dist, '**/*'), (err) => {
      if (err) {
        T.log.error('× clean failed: ' + err.toString());
      } else {
        let time = (Date.now() - startDate) * 0.001;
        time = time.toFixed(2) + ' s';
        T.log.green(`√ clean successfully !!!, after ${T.msg.yellow(time)}`);
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
