'use strict';

const inquirer = require('inquirer'),
  spawn = require('child_process').spawn,
  T = require('../lib/tools'),
  LoadingORA = require('../lib/loadProgress').LoadingORA,
  cliSpinners = require('../lib/loadProgress').cliSpinners,
  Gupack = require('../lib/config/gupack.js.bak');

function getSourceDir() {
  let gupack = new Gupack(T.getConfig());
  return gupack.sourceDir;
}

function install() {
  runSwap(
    getSourceDir(),
    null,
    'Installing npm package......',
    '√ Installed Done'
  );
}

function uninstall() {
  runSwap(
    getSourceDir(),
    null,
    'Uninstalling npm package......',
    '√ Uninstalled Done'
  );
}

function update() {
  runSwap(getSourceDir(), null, 'Updating npm package......', '√ Updated Done');
}

function runSwap(cwdir, arg, startText, endText) {
  cwdir = cwdir || process.cwd();

  arg = arg || process.argv.slice(2) || [];
  arg = arg.filter((a) => {
    return !/^-+/.test(a);
  });
  arg = arg.concat(
    process.argv.slice(2).filter((a) => {
      return /^-+/.test(a);
    })
  );

  startText = startText || '→ installing npm packages ......';
  endText = endText || '√ installed done';

  let loadPrg = new LoadingORA();
  loadPrg.start(startText);

  let cmd = spawn(T.cmdify('npm'), arg, { stdio: 'pipe', cwd: cwdir });
  cmd.on('close', function () {
    loadPrg.stop(endText);
  });
  cmd.stdout.on('data', (err, data) => {
    loadPrg.test(data.toString());
  });
}

module.exports = {
  install,
  uninstall,
  update,
  runSwap
};
