
var T  = require('../lib/tools');

var taskName = T.argv._.slice(-1)[0];
var from = T.Path.join(__dirname, '..');
var shell = 'gulp';

//task as gulp task
function task(){

    if(taskName)
        shell += ' ' + taskName;

    execute();
}

//gulp default
function start(){

    var projectName = T.argv['p'] || T.argv['project'] || T.Path.parse(process.cwd())['name'];
    shell += ' -p ' + projectName;
    //console.log(shell);

    execute();
}

function execute(){

    T.exec(shell, {cwd: from}, function(error, stdout, stderr){
        if(error)   T.log.red(error);
        if(stdout)  T.log.green(stdout);
    });
}


module.exports = {
    task: task,
    start: start
};