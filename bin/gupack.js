#!/usr/bin/env node

'use strict';

const program = require('commander'),
    T = require('../lib/tools'),
    version = require('../package.json')['version'];

// --helper
const gupack = program
    .usage('[options] \n\r\t 欢迎使用前端自动化构建工具 Gupack; \n\r\t ' + '将帮助您简化前端开发流程和提升开发效率。')
    .option('-c, --clear-dest', '清空编译目录')
    .option('-d, --dest', '指定编译后的输出路径')
    .option('-e, --env', '设置环境')
    .option('-o, --open-browser', '启动内置静态服务器是否打开默认浏览器')
    .option('-s, --server', '是否启动内置静态服务器')
    .option('-t, --task', '指定编译任务')

    .option('-C, --clear-templates', '清除项目模板')
    .option('-D, --download-template', '下载项目模板')
    .option('-T, --template', '新建项目时指定模板')

    .option('-f, --gupackfile', '指定配置文件')
    .option('--host', '服务器主机')
    .option('--port', '服务器端口')
    .option('--liveDelay', '热更新延迟时间，单位ms')
    .option('-v, --version', '查看当前版本号 \n\nCommands _ _ _ _ _ _ _ _ _ _ _\n', function() {
        require('./version').displayVersion();
    })
    /*
     Create Project 在当前目录先创建项目
     Exp1: gupack new tmall --template vue_spa
     Exp2: gupack new tmall --template vue_spa --host 127.0.0.1 --port 3000 --liveDelay 2000
     */
    .option(
        'new',
        repx('<projectName*> 创建项目; ' + exp('\n\t -T --template: 选择项目模板' + ' \n\t --auto-install: 新建项目后自动安装npm相关依赖模块' + '\n\t --skip-cache: 跳过缓存,下载模板') + ''),
        function() {
            require('./create')();
        }
    )
    .option('create', repx('new alias '), function() {
        require('./create')();
    })
    .option('task', repx('<taskName>(可选) 编译指定任务; '), function() {
        require('./task').task();
    })
    .option(
        'build',
        repx(
            '[<projectName>]  [<options>]编译项目; ' +
                exp(
                    '\n\t -e, --env <env> 指定编译环境,(local:本地; dev:开发; stg:测试; prd:生产) ' +
                        '\n\t -d, --dest <destPath> 指定编译输出目录 ' +
                        '\n\t -t, --task <taskName> 指定编译任务（gupack build -t js+css -e dev） ' +
                        '\n\t -c, --clear-dest 编译前清空编译路径下的所有文件 ' +
                        '\n\t -o, --open-browser 启动内置静态服务器是否打开默认浏览器 ' +
                        '\n\t -s, --server 是否启动内置静态服务器（热更新）'
                ) +
                ''
        ),
        function() {
            require('./task').build();
        }
    )
    // start dev server
    .option('start', repx('启动内置Node静态服务器; ' + exp('\n\t -o, --open-browser 启动内置静态服务器是否打开默认浏览器')), function() {
        require('./task').start();
    })
    .option('publish', repx('[<projectName>] [<options>] 发布部署项目; '), function() {
        require('./task').publish();
    })
    .option('gc', repx('<type> <name>生成指定组件（类型：vue、react、angluar）; '), function() {
        require('./generator').generateComponent();
    })
    .option('gs', repx('<type> <name>生成指定服务组件（类型：default、angluar）; '), function() {
        require('./generator').generateService();
    })
    .option('gv', repx('<type> <name>生成指定视图模块（类型：default、angluar）; '), function() {
        require('./generator').generateView();
    })
    .option('gt', repx('<name*>生成测试用例; '), function() {
        require('./generator').generateSpec();
    })
    .option('test', repx('<testName[fileName]>用例测试; '), function() {
        require('./testor').test();
    })
    .option('clean', repx(' 清空编译路径下的所有文件; ' + exp('\n\t -f, --gupackfile 指定项目配置文件路径')), function() {
        require('./task').clean();
    })
    // remove project in projects file
    .option('remove', repx('<projectName*> 从本地磁盘中删除(谨慎执行(u_u)); alias delete '), function() {
        require('./add').remove();
    })
    .option('delete', repx('alias remove '), function() {
        require('./add').remove();
    })
    .option('addTemplate', repx('<templateName*> <templateGitUrl(注：github username/repo)*> 添加项目模板; ' + exp('\n\t -D, --download-template 下载模板')), function() {
        require('./add').addTemplate();
    })
    .option('removeTemplate', repx('<templateName>删除指定项目模板, templateName为空,删除所有模板; gupack removeTemplate vue_wbpack'), function() {
        require('./add').removeTemplate();
    })
    .option('listTemplate', repx('模板列表; '), function() {
        require('./add').listTemplate();
    })
    .option('alias', repx('<name*> 为gupack设置一个全局命令别名;'), function() {
        require('./alias')();
    })
    .option('versions', repx('查看相关版本;'), function() {
        require('./version').displayDescVersion();
    })
    .parse(process.argv);

function exp(s) {
    return T.msg.gray(s);
}

function repx(s) {
    return T.msg.green(s);
}
