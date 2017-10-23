'use strict';

const
    T             = require('../lib/tools'),
    prompt        = require('prompt'),
    downloader    = require('download-github-repo'),
    fsrr          = require('fs-readdir-recursive'),
    inquirer      = require('inquirer'),
    _templetes    = require('../templates.json');

const
    isAutoInstall = 'auto-install' in T.argv,
    isSkipCacheTemplete = 'skip-cache-templete' in T.argv,
    templateNamed = T.argv['template'],
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

    let templates = _templetes;
    //
    let tkeys = Object.keys(templates),
        selectedTemplate, tempPath;

    // one: 如果 --template存在
    if(templateNamed){

        if(templates[templateNamed]){
            selectTemplatePrompt();
        }else if(/^[^\/]+\/[^/]+$/.test(templateNamed)){
            _next({ url: templateNamed });
        }

    // two: --template 不存在
    }else{
        selectTemplatePrompt();
    }

    function selectTemplatePrompt(){
        inquirer.prompt([{
            type: 'list',
            name: 'template',
            message: '选择一款适合自己项目的模板: ',
            choices: tkeys
        }]).then(awn => {
            selectedTemplate = templates[awn.template];
            _next(selectedTemplate);
        });
    }

    function _next(template){

        tempPath = T.Path.resolve(__dirname, '../templates/', template.url);

        // 如果之前已经下载过
        if(isSkipCacheTemplete && T.fs.existsSync(tempPath)){
            _copyDir();
            return false;
        }

        // 跳过缓存 或 缓存不存在则下载
        if(isSkipCacheTemplete || !T.fs.existsSync(tempPath)){
            downloadTemplateRepo(template).then(result => {
                T.log.green('\n\n' + result.toString());
                _copyDir();
            }).catch(err => {
                T.log.red(err.toString());
                process.exit(1);
            });
        }else{
            _copyDir();
        }

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
        let indexPath = rawCopy + '/src/views/index.html';
        if(T.fs.existsSync(indexPath)){
            packageObject = T.fs.readFileSync(indexPath, 'utf8');
            // packageObject = packageObject.replace('title="GuPack"', 'title="'+ projectName +'"');
            packageObject = packageObject.replace(/(title=["'])([^"']*?)(["'])([^"']*?)/i, "$1"+ projectName +"$3$4");
            T.fs.writeFileSync(indexPath, packageObject, 'utf8');
        }
    }

}

function downloadTemplateRepo(template){
    let url = template.url;
    let tempPath = T.Path.resolve(__dirname, '../templates/', url);
    if(!url)    throw SyntaxError(T.msg.red('Not found template as github'));

    return new Promise((resove, reject) => {
        let stin = downloading();
        downloader(url, tempPath, err => {
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