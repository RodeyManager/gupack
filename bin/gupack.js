#!/usr/bin/env node
const
    prompt = require('prompt'),
    program = require('commander'),
    chalk = require('chalk'),
    version = require('../package.json')['version'];

// 提示
prompt.message = '\u63d0\u793a';

// --helper
const gupack = program
    //.version(version)
    .usage('[options] \n\r\t \u6b22\u8fce\u4f7f\u7528\u524d\u7aef\u81ea\u52a8\u5316\u6784\u5efa\u5de5\u5177 Gupack\uff0c \n\r\t ' +
    '\u5c06\u5e2e\u52a9\u60a8\u7b80\u5316\u524d\u7aef\u5f00\u53d1\u6d41\u7a0b\u548c\u63d0\u5347\u5f00\u53d1\u6548\u7387\u3002')
    .option('-p, --project', '\u6307\u5b9a\u5f53\u524d\u7f16\u8bd1\u7684\u9879\u76ee')
    .option('-i, --info', '\u9879\u76ee\u914d\u7f6e\u4fe1\u606f')
    .option('-d, --dest', '\u6307\u5b9a\u7f16\u8bd1\u540e\u7684\u8f93\u51fa\u8def\u5f84')
    .option('-e, --env', '\u8bbe\u7f6e\u73af\u5883')
    .option('--host', '\u670d\u52a1\u5668\u4e3b\u673a')
    .option('--port', '\u670d\u52a1\u5668\u7aef\u53e3')
    .option('--liveDelay', '\u9875\u9762\u5ef6\u8fdf\u66f4\u65b0\u65f6\u95f4\uff08\u5f00\u53d1\u8c03\u5f0f\u5b9e\u65f6\u66f4\u65b0\uff09')
    .option('--server-path', '\u9879\u76ee\u76ee\u5f55\uff08\u542f\u52a8\u670d\u52a1\u5668\u5f00\u53d1\u8def\u5f84\uff0c\u7f16\u8bd1\u540e\u7684\u76ee\u5f55\uff09')
    .option('-v, --version', '\u67e5\u770b\u5f53\u524d\u7248\u672c\u53f7', function(){
        require('./version').displayVersion();
    })
    /*
     Create Project 在当前目录先创建项目
     Exp1: gupack create tmall
     Exp2: gupack create tmall --host 127.0.0.1 --port 3000 --liveDelay 2000
     */
    .option('create', '\u521b\u5efa\u4e00\u4e2a\u9879\u76ee; ' + exp('EXP: gupack create mall'), function(){
        require('./create')();
    })
    // add project in projects file
    .option('add', '\u6dfb\u52a0\u9879\u76ee; ' + exp('EXP: gupack add mall D:\\Sites\\mall'), function(){
        require('./add').add();
    })
    .option('build', '\u7f16\u8bd1\u9879\u76ee; '+ exp('EXP: gupack build mall'), function(){
        require('./task').build();
    })
    // start dev server
    .option('start', '\u542f\u52a8Node\u670d\u52a1\u5668; '+ exp('EXP: gupack start mall'), function(){
        require('./task').start();
    })
    // resstart dev server
    .option('restart', '\u91cd\u542fNode\u670d\u52a1\u5668; '+ exp('EXP: gupack restart mall'), function(){
        require('./task').restart();
    })
    .option('publish', '\u7f16\u8bd1\u5e76\u53d1\u5e03\u9879\u76ee; '+ exp('EXP: gupack publish mall'), function(){
        require('./task').publish();
    })
    // remove project in projects file
    .option('remove', '\u79fb\u9664\u9879\u76ee; '+ exp('EXP: gupack remove mall'), function(){
        require('./add').remove();
    })
    // remove project in projects file
    .option('delete', '\u79fb\u9664\u9879\u76ee\uff0c\u5e76\u5220\u9664\u672c\u5730\u78c1\u76d8\u76ee\u5f55; '+ exp('EXP: gupack delete mall'), function(){
        require('./add').deleteProject();
    })
    .option('list', '\u67e5\u770b\u6240\u6709\u9879\u76ee; '+ exp('EXP: gupack list'), function(){
        require('./list').list();
    })
    .option('info', '\u67e5\u770b\u6240\u6709\u9879\u76ee; '+ exp('EXP: gupack info'), function(){
        require('./list').info();
    })
    // install gulp plugins
    .option("install", '\u5b89\u88c5gulp\u63d2\u4ef6; '+ exp('EXP: gupack install gulp-rename'), function(){
        require('./install').install();
    })
    // uninstall gulp plugins
    .option('uninstall', '\u5378\u8f7dgulp\u63d2\u4ef6; '+ exp('EXP: gupack uninstall gulp-rename'), function(){
        require('./install').uninstall();
    })
    // update gulp plugins
    .option('update', '\u66f4\u65b0gulp\u63d2\u4ef6; '+ exp('EXP: gupack update gulp-rename'), function(){
        require('./update')();
    })
    .option('alias', '\u8bbe\u7f6e\u547d\u4ee4\u522b\u540d '+ exp('EXP: gupack alias gp'), function(){
        require('./alias')();
    })
    //获取配置、设置配置
    .option('config', '\u83b7\u53d6\u914d\u7f6e\u6216\u8bbe\u7f6e\u914d\u7f6e; '+ exp('EXP: gupack config [projectName]\n\r\t\t        ' +
                        '--path D:/Sites/lop --host 127.0.0.1 --port 8080 '), function(){
        require('./config')();
    })
    .parse(process.argv);

function exp(msg){
    return chalk.yellow(msg);
}
