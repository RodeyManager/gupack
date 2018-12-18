'use strict';

const T = require('../lib/tools'),
    // prompt       = require('prompt'),
    downloader = require('download-github-repo'),
    fsrr = require('fs-readdir-recursive'),
    inquirer = require('inquirer'),
    userHome = require('user-home'),
    LoadingORA = require('../lib/loadProgress').LoadingORA,
    cliSpinners = require('../lib/loadProgress').cliSpinners,
    downloadTemplateRepo = require('./download'),
    _templetes = require('../templates.json');

const isAutoInstall = T.hasArg('auto-install'),
    isSkipCacheTemplate = T.hasArg('skip-cache'),
    templateNamed = T.getArg('template'),
    host = T.hasArg('host'),
    port = T.hasArg('port'),
    liveDelay = T.hasArg('liveDelay'),
    projectName = T.getProjectName(),
    to = T.Path.resolve(process.cwd(), projectName);
let loadPrg;

// 创建新项目
function create() {
    if (T.fs.existsSync(to)) {
        inquirer
            .prompt([{
                type: 'confirm',
                name: 'ok',
                message: '当前项目已经存在，是否需要覆盖 [Y/n]: '
            }])
            .then(awn => {
                if (awn.ok) {
                    let removePrg = new LoadingORA();
                    removePrg.start(T.msg.yellow('→ 正在删除已存在项目，请稍后......'));
                    T.fsa.remove(to, err => {
                        if (err) return T.log.red(`× ${err} `);
                        removePrg.stop(T.msg.green('√ 删除成功！'));
                        _createProject(projectName);
                    });
                } else {
                    T.log.end();
                }
            });
    } else {
        _createProject(projectName);
    }

    return false;
}

function _createProject() {
    let templates = _templetes;

    let tkeys = Object.keys(templates),
        selectedTemplate,
        tempPath;

    // one: 如果 --template存在
    if (templateNamed) {
        let template = templates[templateNamed];
        // 如果模板对象存在
        if (template) {
            // selectTemplatePrompt();
            _next(template);
        } else if (/^[^\/]+\/[^/]+$/.test(templateNamed)) {
            _next({
                url: templateNamed
            });
        }
        // two: --template 不存在
    } else {
        // 命令行会列出已存在的模板供选择
        selectTemplatePrompt();
    }

    function selectTemplatePrompt() {
        inquirer
            .prompt([{
                type: 'list',
                name: 'template',
                message: '选择一款适合自己项目的模板: ',
                choices: tkeys
            }])
            .then(awn => {
                selectedTemplate = templates[awn.template];
                _next(selectedTemplate);
            });
    }

    function _next(template) {
        tempPath = T.Path.resolve(userHome, '.gupack-templates', template.url);

        // 如果之前已经下载过
        if (isSkipCacheTemplate && T.fs.existsSync(tempPath)) {
            T.fsa.removeSync(tempPath);
        }

        // 跳过缓存 或 缓存不存在则下载
        if (!T.fs.existsSync(tempPath) || !T.fs.existsSync(T.Path.resolve(tempPath, 'template'))) {
            downloadTemplateRepo(template)
                .then(result => {
                    T.log.green(result.message);
                    _copyDir();
                })
                .catch(err => {
                    T.log.red(err.message);
                });
        } else {
            _copyDir();
        }
    }

    function _copyDir() {
        let rawCopy = T.Path.resolve(tempPath, 'template');

        T.fsa.mkdirSync(to);
        T.fsa.copySync(rawCopy, to);
        // 更新项目名称
        _updateName(to);

        let files = fsrr(rawCopy, f => f);
        Array.isArray(files) &&
            files.forEach(file => {
                T.log.green(`√ '${T.Path.resolve(to, file)}' is Created`);
            });
        if (!isAutoInstall) return process.exit(1);
        autoInstallPackages();
    }

    function _updateName(to) {
        let packageJSONPath = to + '/package.json';
        let packageObject = require(packageJSONPath);
        packageObject.name = projectName;
        T.fs.writeFileSync(packageJSONPath, JSON.stringify(packageObject, null, 2), 'utf8');
    }
}

function autoInstallPackages() {
    process.nextTick(e => {
        let pachageFile = require(to + '/package.json');
        let devDependencies = pachageFile.devDependencies || {};
        let dependencies = pachageFile.dependencies || {};
        let packages = Object.keys(devDependencies).length + Object.keys(dependencies).length;
        // 安装对应插件
        let endText = 'Finished OK =^_^= (^_^) =^_^= \n\r';
        endText += T.msg.green(`${T.msg.green('√')} Installed ${packages} pachages \n\r`);
        let startText = T.msg.yellow(`→ installing npm pachages [${packages}] ......`);

        require('./install').runSwap(to, ['install'], startText, endText);
    });
}

module.exports = create;