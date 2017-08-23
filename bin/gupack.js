#!/usr/bin/env node

'use strict';

const
    program = require('commander'),
    T = require('../lib/tools'),
    version = require('../package.json')['version'];

// --helper
const gupack = program
    .usage('[options] \n\r\t 欢迎使用前端自动化构建工具 Gupack; \n\r\t ' +
    '将帮助您简化前端开发流程和提升开发效率。')
    .option('-d, --dest', '指定编译后的输出路径')
    .option('-e, --env', '设置环境')
    .option('-s, --server', '是否启动内置静态服务器')
    .option('-o, --open-browser', '启动内置静态服务器是否打开默认浏览器')
    .option('-t', '指定编译任务')
    .option('-T, --template', '新建项目时指定模板')
    .option('-c', '清理编译目录')
    .option('-f, --gupackfile', '指定配置文件')
    .option('--host', '服务器主机')
    .option('--port', '服务器端口')
    .option('--liveDelay', '热更新延迟时间，单位ms')
    .option('-v, --version', '查看当前版本号 \n\nCommands _ _ _ _ _ _ _ _ _ _ _\n', function(){
        require('./version').displayVersion();
    })
    /*
     Create Project 在当前目录先创建项目
     Exp1: gupack new tmall
     Exp2: gupack new tmall --host 127.0.0.1 --port 3000 --liveDelay 2000
     */
    .option('new', T.msg.cyan('<projectName> 创建项目; '
        + exp('\n\t --auto-install: 新建项目后自动安装npm相关依赖模块'
        + '\n\t -T --template: 选择项目模板')
        + ''), function(){
        require('./create')();
    })
    .option('task', T.msg.cyan('<taskName>(可选) 编译指定任务; '), function(){
        require('./task').task();
    })
    .option('build', T.msg.cyan('[<projectName>] 编译项目; '
        + exp('\n\t -e, --env <env> 指定编译环境,(local:本地; dev:开发; stg:测试; prd:生产) '
        + '\n\t -d, --dest <destPath> 指定编译输出目录 '
        + '\n\t -t <taskName> 指定编译任务（gupack build -t js+css -e dev） '
        + '\n\t -c 编译前清空编译路径下的所有文件 '
        + '\n\t -s, --server 是否启动内置静态服务器（热更新）')
        + ''), function(){
        require('./task').build();
    })
    // start dev server
    .option('start', T.msg.cyan('启动内置Node静态服务器; '
        + exp('-o, --open-browser 启动内置静态服务器是否打开默认浏览器')), function(){
        require('./task').start();
    })
    .option('publish', T.msg.cyan('[<projectName>] 发布部署项目; '), function(){
        require('./task').publish();
    })
    // .option('g', T.msg.cyan('<type> <name>生成指定模块（类型：view、service、component）; '), function(){
    //     require('./generator').generate();
    // })
    .option('gc', T.msg.cyan('<type> <name>生成指定组件（类型：vue、react、angluar）; '), function(){
        require('./generator').generateComponent();
    })
    .option('gs', T.msg.cyan('<type> <name>生成指定服务组件（类型：default、angluar）; '), function(){
        require('./generator').generateService();
    })
    .option('gv', T.msg.cyan('<type> <name>生成指定视图模块（类型：default、angluar）; '), function(){
        require('./generator').generateView();
    })
    .option('gt', T.msg.cyan('<name>生成测试用例; '), function(){
        require('./generator').generateSpec();
    })
    .option('test', T.msg.cyan('<testName[fileName]>用例测试; '), function(){
        require('./testor').test();
    })
    .option('clean', T.msg.cyan(' 清空编译路径下的所有文件; '), function(){
        require('./task').clean();
    })
    // remove project in projects file
    .option('remove', T.msg.cyan('<projectName> 从本地磁盘中删除(谨慎执行(u_u)); '), function(){
        require('./add').remove();
    })
    .option('alias', T.msg.cyan('<name> 为gupack设置一个全局命令别名;'), function(){
        require('./alias')();
    })
    .option('versions', T.msg.cyan('查看相关版本;'), function(){
        require('./version').displayDescVersion();
    })
    .parse(process.argv);

    function exp(s){
        return T.msg.gray(s);
    }