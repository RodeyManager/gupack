
const T  = require('../lib/tools');

module.exports = function(){
    var pluginName = T.argv._.slice(-1)[0];
    var from = T.Path.join(__dirname, '..');
    var shell = 'npm update';
    if(pluginName){
        shell += ' ' + pluginName;
    }

    T.exec(shell, { cwd: from }, (error, stdout, stderr) => {
        if(error)   T.log.red(error);
        if(stdout)  T.log.green(stdout);
        if(stderr)  T.log.gray(stderr);
    });

};
