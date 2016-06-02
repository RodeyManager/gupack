
var T  = require('../lib/tools');

var taskName = T.argv._.slice(-1)[0];
var from = T.Path.join(__dirname, '..');
var shell = 'gulp';
var isBuildPath = (T.argv['d'] || T.argv['buildpath']) != null;
var buildPath = T.argv['d'] || T.argv['buildpath'];

var isEnv = (T.argv['e'] || T.argv['env']) != null;
var env = T.argv['e'] || T.argv['env'];

//task as gulp task
function task(){

    if(taskName)
        shell += ' ' + taskName;

    execute();
}

//gulp default
function start(){

    var projectName = T.argv._[1] || T.argv['p'] || T.argv['project'] || T.Path.parse(process.cwd())['name'];
    shell += ' -p ' + projectName;
    if(isBuildPath){
        shell += ' -d ' + buildPath + ' --cwdir ' + process.cwd();
    }
    if(isEnv){
        shell += ' -e ' + env;
    }
    //console.log(shell);

    execute();
}

function execute(){

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
    start: start
};