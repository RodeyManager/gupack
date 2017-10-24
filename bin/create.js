'use strict';

const
    T            = require('../lib/tools'),
    // prompt       = require('prompt'),
    downloader   = require('download-github-repo'),
    fsrr         = require('fs-readdir-recursive'),
    inquirer     = require('inquirer'),
    userHome     = require('user-home'),
    LoadProgress = require('../lib/loadProgress').LoadProgress,
    cliSpinners  = require('../lib/loadProgress').cliSpinners,
    _templetes   = require('../templates.json');

const
    isAutoInstall       = 'auto-install' in T.argv,
    isSkipCacheTemplate = 'skip-cache-template' in T.argv,
    templateNamed       = T.argv['template'],
    host                = T.argv['host'],
    port                = T.argv['port'],
    liveDelay           = T.argv['liveDelay'],
    projectName         = T.getProjectName(),
    to                  = T.Path.resolve(process.cwd(), projectName);
let loadPrg;

// 创建新项目
function create(){

    if(T.fs.existsSync(to)){
        inquirer.prompt([{
            type: 'input',
            name: 'isExists',
            message: '当前项目已经存在，是否需要覆盖 [Y/n]: '
        }]).then(awn => {
            if(awn.isExists){
                let removePrg      = new LoadProgress('正在删除已存在项目，请稍后......', '√ 删除成功！');
                removePrg.frames   = cliSpinners.triangle.frames;
                removePrg.interval = cliSpinners.triangle.interval;
                removePrg.start();
                T.fsa.remove(to, (err) =>{
                    if(err) return T.log.red(`× ${ err } `);
                    removePrg.stop();
                    _createProject(projectName);
                });
            }else{
                process.exit();
            }
        });

    }else{
        _createProject(projectName);
    }

    return false;

}

function _createProject(){

    let templates = _templetes;
    //
    let tkeys     = Object.keys(templates),
        selectedTemplate, tempPath;

    // one: 如果 --template存在
    if(templateNamed){
        if(templates[templateNamed]){
            selectTemplatePrompt();
        }else if(/^[^\/]+\/[^/]+$/.test(templateNamed)){
            _next({url: templateNamed});
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
        }]).then(awn =>{
            selectedTemplate = templates[awn.template];
            _next(selectedTemplate);
        });
    }

    function _next(template){

        tempPath = T.Path.resolve(userHome, '.gupack-templates/', template.url);

        // 如果之前已经下载过
        if(isSkipCacheTemplate && T.fs.existsSync(tempPath)){
            T.fsa.removeSync(tempPath);
        }

        // 跳过缓存 或 缓存不存在则下载
        if(!T.fs.existsSync(tempPath)){
            downloadTemplateRepo(template).then(result =>{
                T.log.green(result.toString());
                _copyDir();
            }).catch(err =>{
                T.log.red(err.toString());
                loadPrg.close();
                process.exit(1);
            });
        }else{
            _copyDir();
        }
    }

    function _copyDir(){
        let rawCopy = tempPath + '/template';

        T.fsa.mkdirSync(to);
        T.fsa.copySync(rawCopy, to);
        // 更新项目名称
        _updateName(rawCopy);

        let files = fsrr(rawCopy, f => f);
        Array.isArray(files) && files.forEach(file =>{
            T.log.green(`√ '${ T.Path.resolve(to, file) }' is Created`);
        });
        if(!isAutoInstall) return process.exit(1);
        autoInstallPackages();
    }

    function _updateName(rawCopy){
        let packageJSONPath = rawCopy + '/package.json';
        let packageObject   = require(packageJSONPath);
        packageObject.name  = projectName;
        T.fs.writeFileSync(packageJSONPath, JSON.stringify(packageObject, null, 2), 'utf8');
        let indexPath = rawCopy + '/src/views/index.html';
        if(T.fs.existsSync(indexPath)){
            packageObject = T.fs.readFileSync(indexPath, 'utf8');
            // packageObject = packageObject.replace('title="GuPack"', 'title="'+ projectName +'"');
            packageObject = packageObject.replace(/(title=["'])([^"']*?)(["'])([^"']*?)/i, "$1" + projectName + "$3$4");
            T.fs.writeFileSync(indexPath, packageObject, 'utf8');
        }
    }

}

function downloadTemplateRepo(template){
    let url      = template.url;
    let tempPath = T.Path.resolve(userHome, '.gupack-templates/', url);
    if(!url) throw SyntaxError(T.msg.red('Not found template as github'));
    loadPrg = new LoadProgress('Downloading you selected template, Please wait a moment......', '\t');
    loadPrg.start();

    return new Promise((resove, reject) =>{
        downloader(url, tempPath, err =>{
            if(err)
                reject('× Download failed');
            else
                resove('√ Download Successfully');
            loadPrg.stop();
        });
    });
}

function autoInstallPackages(){

    process.nextTick(e =>{
        let pachageFile     = require(to + '/package.json');
        let devDependencies = pachageFile.devDependencies || {};
        let dependencies    = pachageFile.dependencies || {};
        let packages        = Object.keys(devDependencies).length + Object.keys(dependencies).length;
        // 安装对应插件
        let endText         = 'Finished OK =^_^= (^_^) =^_^= \n\r';
        endText += `${ T.msg.green('√') } Installed ${ packages } pachages \n\r`;
        let startText = `installing npm pachages [${ packages }] ......`;

        require('./install').runSwap(to, ['install'], startText, endText);

    });
}

module.exports = create;