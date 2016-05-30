
var T  = require('../lib/tools');

var pluginName = T.argv._.slice(-1)[0];
var from = T.Path.join(__dirname, '..');
var shell = 'npm install';
var isG = T.argv['g'] != null;
var isSave = T.argv['save'] != null;
var isSaveDev = T.argv['save-dev'] != null;
var isForce = T.argv['force'] != null;

//install as npm install
function install(){

    if(pluginName)
        shell += ' ' + pluginName;

    execute();
}
//install as npm uninstall
function uninstall(){

    shell = 'npm uninstall';
    if(pluginName)
        shell += ' ' + pluginName;

    execute();
}

function execute(){
    if(isG)
        shell += ' -g';
    if(isSaveDev)
        shell += ' --save-dev';
    if(isForce)
        shell += ' --force';
    //console.log('shell ==== ' + shell);
    T.exec(shell, {cwd: from}, function(error, stdout, stderr){
        if(error)   T.log.red(error);
        if(stdout)  T.log.green(stdout);
        //if(stderr)  T.log.gray(stderr);
    });
}


module.exports = {
    install: install,
    uninstall: uninstall
};