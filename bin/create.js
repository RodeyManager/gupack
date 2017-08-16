'use strict';

const
    T             = require('../lib/tools'),
    prompt        = require('prompt'),
    downloader    = require('download-github-repo'),
    fsrr          = require('fs-readdir-recursive'),
    inquirer      = require('inquirer');

const
    isAutoInstall = 'auto-install' in T.argv,
    host = T.argv['host'],
    port = T.argv['port'],
    liveDelay = T.argv['liveDelay'],
    projectName = T.getProjectName(),
    to = T.Path.resolve(process.cwd(), projectName);
let ui;

// 创建新项目
function create(){

    if(T.fs.existsSync(to)){
        prompt.message = '提示';
        prompt.start();
        T.prompt('当前项目已经存在，是否需要覆盖? [yes/no]', () => {
            T.fsa.removeSync(to);
            _createProject(projectName);
        }).catch(err => {
            T.log.red(`× ${ err } `);
        });

    }else{
        prompt.stop();
        _createProject(projectName);
    }

}

function _createProject(){

    let templates = {
        'simple': { url: 'gupack_simple', desc: '', vs: '^1.0.0' },
        'vue + browserify': { url: 'vue_browserify', vs: '^1.0.0' },
        'react + browserify': { url: 'react_browserify', vs: '^1.0.0' },
        'angluar2 + browserify': { url: 'angular_browserify', vs: '^1.0.0' }
    };
    //
    let tkeys = Object.keys(templates),
        selectedTemplate, tempPath;

    inquirer.prompt([{
        type: 'list',
        name: 'template',
        message: '选择一款适合自己项目的模板: ',
        choices: tkeys
    }]).then(awn => {
        selectedTemplate = templates[awn.template];
        _next(selectedTemplate);
    });

    function _next(template){

        tempPath = T.Path.resolve(__dirname, '../templates/', template.url);

        // 如果之前已经下载过
        if(T.fs.existsSync(tempPath)){
            _copyDir();
            return false;
        }

        downloadTemplateRepo(template).then(result => {
            T.log.green('\n\n' + result.toString());
            _copyDir();
        }).catch(err => {
            T.log.red(err.toString());
            process.exit(1);
        });

    }

    function _copyDir(){
        let rawCopy = tempPath + '/template';
        // 更新项目名称
        _updateName(rawCopy);

        T.fsa.mkdirSync(to);
        T.fsa.copySync(rawCopy, to);
        let files = fsrr(rawCopy, f => f);
        Array.isArray(files) && files.forEach(file => {
            T.log.green(`√ '${ file }' is Created`);
        });
        if(!isAutoInstall)  return process.exit(1);
        autoInstallPackages();
    }

    function _updateName(rawCopy){
        let packageJSONPath = rawCopy + '/package.json';
        let packageObject = require(packageJSONPath);
        packageObject.name = projectName;
        T.fs.writeFileSync(packageJSONPath, JSON.stringify(packageObject, null, 2), 'utf8');
        packageJSONPath = rawCopy + '/src/views/index.html';
        packageObject = T.fs.readFileSync(packageJSONPath, 'utf8');
        packageObject = packageJSONPath.replace('title="GuPack"', 'title="'+ projectName +'"');
        T.fs.writeFileSync(packageJSONPath, packageObject, 'utf8');
    }

}

function downloadTemplateRepo(template){
    let url = template.url;
    let tempPath = T.Path.resolve(__dirname, '../templates/', url);
    if(!url)    throw SyntaxError(T.msg.red('Not found template as github'));

    return new Promise((resove, reject) => {
        let stin = downloading();
        downloader('RodeyManager/' + url, tempPath, err => {
            clearInterval(stin);
            downloaded();
            if(err)
                reject('× Download failed');
            else
                resove('√ Download Successfully');
        });
    });
}

function autoInstallPackages(){

    process.nextTick(e => {
        let pachageFile = require(to + '/package.json');
        let devDependencies = pachageFile.devDependencies || {};
        let dependencies = pachageFile.dependencies || {};
        let packages = Object.keys(devDependencies).length + Object.keys(dependencies).length;
        // 安装对应插件
        let endText = 'Finished OK =^_^= (^_^) =^_^= \n\r';
        endText += `${ T.msg.green('√') } Installed ${ packages } pachages \n\r`;

        require('./install').runSwap(to, ['install'], 'installing npm pachages ......', endText);

    });
}

function downloading(){

    let allows = require('cli-spinners').bouncingBar.frames.reverse() ;

    let loader = allows.map(s => T.msg.yellow(`${s} Downloading you selected template, Please wait a moment......`));
    let len = loader.length, i = 0;
    ui = new inquirer.ui.BottomBar({bottomBar: loader[i % len]});

    return setInterval(function () {
        ui.updateBottomBar(loader[i++ % len]);
    }, 100);

}

function downloaded(){
    ui.updateBottomBar('\t');
    ui = null;
    process.stdout.write('');
}

module.exports = create;