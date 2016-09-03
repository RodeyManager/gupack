
var T  = require('../lib/tools'),
    os = require('os');

var taskName = T.argv._.slice(-1)[0];
var from = T.Path.join(__dirname, '..');
var isBuildPath = (T.argv['d'] || T.argv['buildpath']) != null;
var buildPath = T.argv['d'] || T.argv['buildpath'];

var isEnv = (T.argv['e'] || T.argv['env']) != null;
var env = T.argv['e'] || T.argv['env'];

//项目列表
var projectList = require('../projects').projectList;

//task as gulp task
function task(){
    var shell = 'gulp';
    if(taskName)
        shell += ' ' + taskName;

    execute(shell);
}

//build project
function build(){

    var shell = 'gulp';
    var projectName = T.argv._[1] || T.argv['p'] || T.argv['project'] || T.Path.parse(process.cwd())['name'];
    shell += ' -p ' + projectName;
    if(isBuildPath){
        shell += ' -d ' + buildPath + ' --cwdir ' + process.cwd();
    }
    if(isEnv){
        shell += ' -e ' + env;
    }
    shell += ' --gulpfile ' + T.Path.resolve(from, 'gupackFile.js');
    //console.log(shell);

    execute(shell);

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

    var projectName = T.argv._[1] || T.argv['p'] || T.argv['project'] || T.Path.parse(process.cwd())['name'],
        projectConf = T.getProjectConfig(projectName);
    //判断项目是否存在
    if(!projectConf){
        T.log.red('\x1b[32m--->>> \u8be5\u9879\u76ee\u4e0d\u5b58\u5728 \x1b[39m');
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

    //start nodemon
    //console.log('\x1b[32m--->>> \u5f00\u59cb\u542f\u52a8\u670d\u52a1 \x1b[39m');
    T.log.green('\x1b[32m--->>> starting server \x1b[39m');
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
    return T.argv['host'] || config['host'] || '127.0.0.1';
}

function _getPort(config){
    var port = T.argv['port'] || config['port'] || Math.round(Math.random() * 1000 + 3000);
    //随机生成，端口去重
    if(!T.argv['port'] && !config['port']){
        var tps = [];
        Object.keys(projectList).forEach(function(project){
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
            if(pn == projectName){
                config['host'] = host;
                config['port'] = port;
                config['sport'] = port + 1000;
            }
        }
        var projects = JSON.stringify({"projectList": projectList}, null, 2);
        T.fs.writeFileSync(T.Path.resolve(__dirname, '..', '_projects.json'), projects);
    }
}

//编译并发布
function publish(){
    var shell = 'gulp';
    var projectName = T.argv._[1] || T.argv['p'] || T.argv['project'] || T.Path.parse(process.cwd())['name'];
    shell += ' -p ' + projectName + ' --env prd --publish true';
    if(isBuildPath){
        shell += ' -d ' + buildPath + ' --cwdir ' + process.cwd();
    }
    //console.log(shell);

    execute(shell);
}

function execute(shell){
    //未指定可用命令
    if(!shell){
        console.log('\x1b[32m--->>> \u672a\u6307\u5b9a\u53ef\u7528\u547d\u4ee4 \x1b[39m');
        return false;
    }
    var gulpExec = T.exec(shell, {cwd: from});
    gulpExec.stdout.on('data', function(data){
        process.stdout.write('\x1b[32m' + data + '\x1b[39m');
    });

    gulpExec.on('exit', function(code){
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