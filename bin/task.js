'use strict';

const inquirer = require('inquirer'),
    T = require('../lib/tools'),
    Gupack = require('../lib/config/gupack');

let config, gupack;

function checkConfig() {
    // 项目列表
    config = T.getConfig();
    if (!config) {
        T.log.error('× 不是有效的项目：缺少配置文件(src/gupack-config.js) ');
    }

    gupack = new Gupack(config);
    // 编译前是否清理相关目录
    gupack.startClean = T.hasArg(['c', 'clear-dest']) || gupack.startClean;
}

// task as gulp task
// 支持指定多个任务  gupack task build.css+build.html
// 如果不指定任务，将会从当前项目配置中读取供选择（可多选）  gupack task
function task(name) {
    _logEnv('Build single task');
    checkConfig();
    const taskName = name || T.argv._[1];
    if (!!taskName) {
        gupack.runTask(taskName.split(/\+/i));
    } else {
        let tasks = config.buildTasks;
        inquirer
            .prompt([
                {
                    type: 'checkbox',
                    name: 'tname',
                    message: '请选择单独编译的任务: ',
                    choices: Object.keys(tasks)
                }
            ])
            .then(awn => {
                gupack.runTask(awn.tname);
            });
    }
}

// build project
function build() {
    _logEnv('Build');
    checkConfig();
    if (T.hasArg(['t', 'task'])) {
        let taskName = T.getArg(['t', 'task']);
        return task(taskName);
    }
    gupack.run();
}

// gupack start projectName
function start() {
    checkConfig();
    gupack.runIndex = 1;
    gupack.run();
}

// 编译并发布(部署)
function deploy() {
    _logEnv('Deploy');
    checkConfig();
    gupack.runDeploy();
}

// 编译并发布(部署)
function publish() {
    if (!T.hasArg(['e', 'env'])) {
        process.env.NODE_ENV = 'prd';
    }
    _logEnv('Deploy');
    checkConfig();
    gupack.runDeploy();
}

// 备份
function backup() {
    if (!T.hasArg(['e', 'env'])) {
        process.env.NODE_ENV = 'prd';
    }
    _logEnv('Backup');
    checkConfig();
    gupack.runBackup();
}

// 回滚
function rollback() {
    if (!T.hasArg(['e', 'env'])) {
        process.env.NODE_ENV = 'prd';
    }
    _logEnv('Rollback');
    checkConfig();
    gupack.runRollback();
}

function clean() {
    // 如果指定配置文件，则将根据配置
    if (T.hasArg(['f', 'gupackfile'])) {
        checkConfig();
        Gupack.cleanBuildDir(null, gupack.buildDir);
    } else {
        let dist = T.getArg('cwdir') || process.cwd();
        dist = T.Path.resolve(dist, 'dist');
        Gupack.cleanBuildDir(null, dist);
    }
}

function _logEnv(commandName, env) {
    env = env || process.env.NODE_ENV || T.getArg(['e', 'env']);
    T.log.yellow(`→ [${T.getTime()}] ${commandName || ''} environment as '${env}'`);
}

module.exports = {
    task,
    start,
    build,
    deploy,
    publish,
    backup,
    rollback,
    clean
};
