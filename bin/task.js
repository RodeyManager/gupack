
'use strict';

const
    inquirer = require('inquirer'),
    T        = require('../lib/tools'),
    Gupack   = require('../lib/config/gupack');

let config, gupack;

function checkConfig(){
    // 项目列表
    config = T.getConfig();
    if(!config){
        T.log.red('× 不是有效的项目：缺少配置文件(src/gupack-config.js) ');
        process.exit(1);
    }

    gupack = new Gupack(config);
    // 编译前是否清理相关目录
    gupack.startClean = 'c' in T.argv || 'clean' in T.argv || gupack.startClean;
}

// task as gulp task
// 支持指定多个任务  gupack task build.css+build.html
// 如果不指定任务，将会从当前项目配置中读取供选择（可多选）  gupack task
function task(name){
    checkConfig();

    const taskName = name || T.argv._[1];
    if(!!taskName){
        gupack.runTask(taskName.split(/\+/i));
    }else{
        let tasks = config.buildTasks;
        inquirer.prompt([{
            type: 'checkbox',
            name: 'tname',
            message: '请选择单独编译的任务: ',
            choices: Object.keys(tasks)
        }]).then(awn => {
            gupack.runTask(awn.tname);
        });
    }
}

//build project
function build(){
    checkConfig();

    if('t' in T.argv || 'task' in T.argv){
        let taskName = T.argv['t'] || T.argv['task'];
        return task(taskName);
    }
    gupack.run();
}

//gupack start projectName
function start(){
    checkConfig();
    gupack.runIndex = 1;
    gupack.run();
}

//编译并发布(部署)
function publish(){
    checkConfig();
    // gupack.isPublish = true;
    // gupack.run();
    gupack.runDeploy();
}

//编译并发布版本
function release(){
    checkConfig();
    gupack.statics._if = true;
    publish();
}

function clean(){
    checkConfig();
    gupack.cleanBuildDir();
}

module.exports = {
    task,
    start,
    build,
    publish,
    release,
    clean
};