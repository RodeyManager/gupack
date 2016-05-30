#!/usr/bin/env node

var prompt = require('prompt')
    ,program = require('commander');

var T  = require('../lib/tools');
var version = require('../package.json')['version'];

// --helper
program
    .version(version)
    .option('-v, --version', '\u67e5\u770b\u5f53\u524d\u7248\u672c\u53f7')
    .option('-p, --project', '\u6307\u5b9a\u5f53\u524d\u7f16\u8bd1\u7684\u9879\u76ee')
    .option('-l, --list', '\u5217\u51fa\u6240\u6709\u9879\u76ee')
    .option('-d, --buildpath', '\u6307\u5b9a\u7f16\u8bd1\u540e\u7684\u8f93\u51fa\u8def\u5f84')
    .option('-f, --projectFile', '\u6307\u5b9a\u9879\u76ee\u6587\u4ef6\u5730\u5740')
    .option('-$, --terminal', '\u6307\u5b9a\u9879\u76ee\u8fd0\u884c\u7684\u7ec8\u7aef\u5e73\u53f0\uff0c\n\r\t\t       ' +
                                'pc\u5c06\u4f7f\u7528jQuery\uff1bmobile\u5c06\u4f7f\u7528Zepto')
    .option('create', '\u521b\u5efa\u4e00\u4e2a\u9879\u76ee; EXP: gupack create mall')
    .option('add', '\u6dfb\u52a0\u9879\u76ee; EXP: gupack add mall D:\\Sites\\mall')
    .option('remove', '\u79fb\u9664\u9879\u76ee; EXP: gupack remove mall')
    .option('delete', '\u79fb\u9664\u9879\u76ee\uff0c\u5e76\u5220\u9664\u672c\u5730\u78c1\u76d8\u76ee\u5f55; EXP: gupack delete mall')
    .option('list', '\u67e5\u770b\u6240\u6709\u9879\u76ee; EXP: gupack list')
    .option('install', '\u5b89\u88c5gulp\u63d2\u4ef6; EXP: gupack install gulp-rename')
    .option('uninstall', '\u5378\u8f7dgulp\u63d2\u4ef6; EXP: gupack uninstall gulp-rename')
    .option('update', '\u66f4\u65b0gulp\u63d2\u4ef6; EXP: gupack update gulp-rename')
    .parse(process.argv);

//console.log(T.argv);
var argv = T.argv;
var cwd = process.cwd();
//console.log(cwd);

// Create Project
if(argv._.indexOf('create') !== -1){
    var projectName = argv._.slice(-1)[0];
    var to = T.Path.resolve(cwd, projectName);
    var from = T.Path.join(__dirname, '..', 'example');
    //console.log(from, to);

    prompt.start();
    prompt.get([{
        name: 'ok',
        message: '\u662f\u5426\u521b\u5efa\u9879\u76ee? [yes/no]:  '
    }], function(err, result){
        if(/^y|yes|ok|\u662f$/i.test(result.ok)){
            console.log('\n\r');
            require('./create')(projectName, from, to);
        }else{
            console.log('\n\r\x1b[31m  Aborting\x1b[0m');
            prompt.stop();
        }

    });

}

//add project in projects file
else if(argv._.indexOf('add') !== -1){

    require('./add').add();

}

//remove project in projects file
else if(argv._.indexOf('remove') !== -1){

    require('./add').removeProject();

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

//gulp task
else if(argv._.indexOf('start') !== -1 || argv._.indexOf('build') !== -1){

    require('./task').start();

}

//list projects
else if(argv._.indexOf('list') !== -1 || argv['l'] || argv['list']){

    require('./list')();

}

