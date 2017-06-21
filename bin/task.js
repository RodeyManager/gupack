
const
    T  = require('../lib/tools'),
    os = require('os');

const
    taskName = T.argv._.slice(-1)[0],
    from = T.Path.join(__dirname, '..'),
    isBuildPath = (T.argv['d'] || T.argv['dest']) !== null,
    buildPath = T.argv['d'] || T.argv['dest'],
    isEnv = (T.argv['e'] || T.argv['env']) !== null,
    env = T.argv['e'] || T.argv['env'],
    cwd = process.cwd();

const gulpShell = 'node ' + T.Path.resolve(__dirname, '../node_modules/gulp/bin/gulp.js');

//项目列表
var projectList = require('../_projects.json').projectList;

//task as gulp task
function task(){
    var shell = gulpShell;
    if(taskName)
        shell += ' ' + taskName + ' --gulpfile ' + T.Path.resolve(from, 'gupackFile.js');

    execute(shell);
}

//build project
function build(){

    //start();

    var shell = gulpShell;
    var projectName = _getProjectName();
    // 判断项目是否存在编译列表中
    if(!projectList[projectName]){
        T.log.red('\u8bf7\u5148\u5c06\u5f53\u524d\u9879\u76ee\u6dfb\u52a0\u5230\u7f16\u8bd1\u5217\u8868\u4e2d\uff0c\u6267\u884c\u547d\u4ee4: gupack add');
        process.exit(1);
    }

    shell += ' -p ' + projectName;
    if(isBuildPath){
        shell += ' -d ' + buildPath + ' --cwdir ' + cwd;
    }
    if(isEnv){
        shell += ' -e ' + env;
    }
    shell += ' --gulpfile ' + T.Path.resolve(from, 'gupackFile.js');

    execute(shell, 'gulp build');

}

//gupack start projectName
function start(){

    var server = _startServer();
    //打开默认浏览器
    _openBrowse(server.host, server.port);

}

//gupack restart projectName
function restart(){
    var server = _startServer();
}

function _startServer(){

    var projectName = _getProjectName(),
        projectConf = T.getProjectConfig(projectName);
    //判断项目是否存在
    if(!projectConf){
        T.log.red('--->>> \u8be5\u9879\u76ee\u4e0d\u5b58\u5728 ');
        process.exit(1);
    }

    var serverScript = T.Path.resolve(from, 'gupackServer.js'),
        nodemonShell = 'node ' + serverScript,
        host = _getHost(projectConf),
        port = _getPort(projectConf),
        dist = _getDist(projectConf);

    //写入配置
    _updateConfig(projectName, host, port, projectConf);

    //加入文件变更重启
    //nodemonShell += ' -w ' + serverScript;
    //nodemonShell += ' --config ' + T.Path.resolve(__dirname, '..', 'nodemon.json');
    nodemonShell += ' --project-name ' + projectName;
    nodemonShell += ' --server-path ' + dist;
    nodemonShell += ' --host ' + host;
    nodemonShell += ' --port ' + port;

    T.log.green(`--->>> starting server: http://${host}:${port} `);
    execute(nodemonShell);
    return { host: host, port: port };
}

/**
 * 打开默认浏览器
 * @param host
 * @param port
 * @private
 */
function _openBrowse(host, port){
    var osType = os.type();
    var shellFile = /windows/gi.test(osType) ? 'open.cmd' : 'open';
    shellFile = T.Path.resolve(__dirname, '../shell', shellFile);
    T.execFile(shellFile, ['http://' + host + ':' + port]);
}

function _getHost(config){
    return T.argv['host'] || (config && config['host']) || '127.0.0.1';
}

function _getPort(config){
    var port = T.argv['port'] || (config && config['port']) || Math.round(Math.random() * 1000 + 3000);
    //随机生成，端口去重
    if(!T.argv['port'] && (!config || !config['port'])){
        var tps = [];
        Object.keys(projectList).forEach((project) => {
            projectList[project]['port'] && tps.push(projectList[project]['port']);
        });
        port = T.generatePort(tps, port);
    }
    return port;
}

function _getDist(projectConf){
    var projectPath = projectConf.path,
        dist = '';
    if(isBuildPath){
        dist = buildPath;
    }else{
        //先找到项目的配置文件 gupack-config.js
        var config = require(T.Path.resolve(projectPath, projectConf.config));
        if(/^[a-zA-Z]\:/i.test(config.build)){
            //绝对路径
            dist = config.build;
        }else{
            dist = T.Path.resolve(projectPath, config.build);
        }
    }
    return dist;
}

function _updateConfig(projectName, host, port, config){
    if(!config['host'] && !config['port']){
        for(var pn in projectList){
            if(pn === projectName){
                config['host'] = host;
                config['port'] = port;
                config['sport'] = port + 1000;
            }
        }
        var projects = JSON.stringify({"projectList": projectList}, null, 2);
        T.fs.writeFileSync(T.Path.resolve(__dirname, '..', '_projects.json'), projects);
    }
}

function _getProjectName(){
    return String(T.argv._[1] || T.argv['p'] || T.argv['project'] || T.Path.parse(cwd)['name']);
}

//编译并发布
function publish(){
    var shell = gulpShell;
    var projectName = _getProjectName();
    shell += ' -p ' + projectName + ' --env prd --publish true';
    if(isBuildPath){
        shell += ' -d ' + buildPath + ' --cwdir ' + cwd;
    }
    //console.log(shell);

    execute(shell, 'gulp publish');
}

function execute(shell, shellName){
    //未指定可用命令
    if(!shell){
        T.log.red('--->>> \u672a\u6307\u5b9a\u53ef\u7528\u547d\u4ee4 ');
        return false;
    }
    var gulpExec = T.exec(shell, {cwd: from});

    gulpExec.stdout.on('data', data => {
        process.stdout.write(T.chalk.green(data));
    });

    gulpExec.on('exit', () => {
        process.exit(1);
    });

}

module.exports = {
    task: task,
    start: start,
    restart: restart,
    build: build,
    publish: publish,
    release: publish
};