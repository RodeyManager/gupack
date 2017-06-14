#!/usr/bin/env node
const
    prompt = require('prompt')
    ,program = require('commander')
    ,T  = require('../lib/tools')
    ,version = require('../package.json')['version'];

prompt.message = '\u63d0\u793a';

// --helper
program
    //.version(version)
    .usage('[options] \n\r\t \u6b22\u8fce\u4f7f\u7528\u524d\u7aef\u81ea\u52a8\u5316\u6784\u5efa\u5de5\u5177 Gupack\uff0c \n\r\t ' +
    '\u5c06\u5e2e\u52a9\u60a8\u7b80\u5316\u524d\u7aef\u5f00\u53d1\u6d41\u7a0b\u548c\u63d0\u5347\u5f00\u53d1\u6548\u7387\u3002')
    .option('-v, --version', '\u67e5\u770b\u5f53\u524d\u7248\u672c\u53f7', ()=> {
        require('./version').displayVersion();
    })
    .option('-p, --project', '\u6307\u5b9a\u5f53\u524d\u7f16\u8bd1\u7684\u9879\u76ee')
    .option('-i, --info', '\u9879\u76ee\u914d\u7f6e\u4fe1\u606f')
    .option('-d, --dest', '\u6307\u5b9a\u7f16\u8bd1\u540e\u7684\u8f93\u51fa\u8def\u5f84')
    .option('-e, --env', '\u8bbe\u7f6e\u73af\u5883')
    .option('--host', '\u670d\u52a1\u5668\u4e3b\u673a')
    .option('--port', '\u670d\u52a1\u5668\u7aef\u53e3')
    .option('--liveDelay', '\u9875\u9762\u5ef6\u8fdf\u66f4\u65b0\u65f6\u95f4\uff08\u5f00\u53d1\u8c03\u5f0f\u5b9e\u65f6\u66f4\u65b0\uff09')
    .option('--server-path', '\u9879\u76ee\u76ee\u5f55\uff08\u542f\u52a8\u670d\u52a1\u5668\u5f00\u53d1\u8def\u5f84\uff0c\u7f16\u8bd1\u540e\u7684\u76ee\u5f55\uff09')

    .option('create', '\u521b\u5efa\u4e00\u4e2a\u9879\u76ee; EXP: gupack create mall')
    .option('add', '\u6dfb\u52a0\u9879\u76ee; EXP: gupack add mall D:\\Sites\\mall')
    .option('build', '\u7f16\u8bd1\u9879\u76ee; EXP: gupack build mall')
    .option('start', '\u542f\u52a8Node\u670d\u52a1\u5668; EXP: gupack start mall')
    .option('restart', '\u91cd\u542fNode\u670d\u52a1\u5668; EXP: gupack restart mall')
    .option('publish', '\u7f16\u8bd1\u5e76\u53d1\u5e03\u9879\u76ee; EXP: gupack publish mall')
    .option('remove', '\u79fb\u9664\u9879\u76ee; EXP: gupack remove mall')
    .option('delete', '\u79fb\u9664\u9879\u76ee\uff0c\u5e76\u5220\u9664\u672c\u5730\u78c1\u76d8\u76ee\u5f55; EXP: gupack delete mall')
    .option('list', '\u67e5\u770b\u6240\u6709\u9879\u76ee; EXP: gupack list')
    .option('info', '\u67e5\u770b\u6240\u6709\u9879\u76ee; EXP: gupack info')
    .option('install', '\u5b89\u88c5gulp\u63d2\u4ef6; EXP: gupack install gulp-rename')
    .option('uninstall', '\u5378\u8f7dgulp\u63d2\u4ef6; EXP: gupack uninstall gulp-rename')
    .option('update', '\u66f4\u65b0gulp\u63d2\u4ef6; EXP: gupack update gulp-rename')
    .option('alias', '\u8bbe\u7f6e\u547d\u4ee4\u522b\u540d EXP: gupack alias gp')
    //获取配置、设置配置
    .option('config', '\u83b7\u53d6\u914d\u7f6e\u6216\u8bbe\u7f6e\u914d\u7f6e; EXP: gupack config [projectName]\n\r\t\t        ' +
                        '--path D:/Sites/lop --host 127.0.0.1 --port 8080 ')
    .parse(process.argv);

const argv = T.argv;

// Create Project 在当前目录先创建项目
// Exp1: gupack create tmall
// Exp2: gupack create tmall --host 127.0.0.1 --port 3000 --liveDelay 2000
if(argv._.indexOf('create') !== -1){
    require('./create')();
}

//add project in projects file
else if(argv._.indexOf('add') !== -1){
    require('./add').add();
}

//remove project in projects file
else if(argv._.indexOf('remove') !== -1){
    require('./add').remove();
}

//remove project in projects file
else if(argv._.indexOf('delete') !== -1){
    require('./add').deleteProject();
}

//update gulp plugins
else if(argv._.indexOf('update') !== -1){
    require('./update')();
}

//install gulp plugins
else if(argv._.indexOf('install') !== -1){
    require('./install').install();
}

//uninstall gulp plugins
else if(argv._.indexOf('uninstall') !== -1){
    require('./install').uninstall();
}

//gulp task
else if(argv._.indexOf('task') !== -1){
    require('./task').task();
}

//start server
else if(argv._.indexOf('start') !== -1){
    require('./task').start();
}

//restart server
else if(argv._.indexOf('restart') !== -1){
    require('./task').restart();
}

//gulp build
else if(argv._.indexOf('build') !== -1){
    require('./task').build();
}

//gulp release
else if(argv._.indexOf('publish') !== -1 || argv._.indexOf('release') !== -1){
    require('./task').publish();
}

//list projects
else if(argv._.indexOf('list') !== -1 || argv['l'] || argv['list']){
    require('./list').list();
}

//get one project
else if(argv._.indexOf('info') !== -1 || argv['i'] || argv['info']){
    require('./list').info();
}

//gupack config
else if(argv._.indexOf('config') !== -1){
    require('./config')();
}

//gupack alias
else if(argv._.indexOf('alias') !== -1){
    require('./alias')();
}

else{
    T.log.yellow('\n\r  gupack -h \u67e5\u770b\u5e2e\u52a9');
}

