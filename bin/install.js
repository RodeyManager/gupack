
'use strict';

const
    inquirer = require('inquirer'),
    cliSpinners = require('cli-spinners'),
    spawn = require('child_process').spawn,
    T  = require('../lib/tools'),
    Gupack = require('../lib/config/gupack');

function getSourceDir(){
    let gupack = new Gupack(T.getConfig());
    return gupack.sourceDir;
}

function install(){
    runSwap(getSourceDir(), null, 'Installing npm package......', 'Installed Done');
}

function uninstall(){
    runSwap(getSourceDir(), null, 'Uninstalling npm package......', 'Uninstalled Done');
}

function update(){
    runSwap(getSourceDir(), null, 'Updating npm package......', 'Updated Done');
}

function runSwap(cwdir, arg, startText, endText){

    cwdir = cwdir || process.cwd();

    arg = arg || process.argv.slice(2) || [];
    arg = arg.filter(a => {
        return !/^-+/.test(a);
    });
    arg = arg.concat(process.argv.slice(2).filter(a => {
        return /^-+/.test(a);
    }));

    startText = startText || 'installing......';
    endText = endText || 'installed done';

    let allows = cliSpinners.bouncingBar.frames.reverse() ;//[ '⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

    let loader = allows.map(s => T.msg.yellow(`${s} ${startText}`));
    let len = loader.length, i = 0;
    let ui = new inquirer.ui.BottomBar({bottomBar: loader[i % len]});

    setInterval(function () {
        ui.updateBottomBar(loader[i++ % len]);
    }, 100);

    let cmd = spawn(T.cmdify('npm'), arg, {stdio: 'pipe', cwd: cwdir });
    cmd.stdout.pipe(ui.log);
    cmd.on('close', function () {
        ui.updateBottomBar(T.msg.yellow(endText) + '\n');
        process.exit();
    });
}

module.exports = {
    install,
    uninstall,
    update,
    runSwap
};