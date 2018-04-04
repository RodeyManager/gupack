'use strict';

const inquirer = require('inquirer'),
    userHome = require('user-home'),
    _ = require('lodash'),
    T = require('../lib/tools'),
    LoadingORA = require('../lib/loadProgress').LoadingORA,
    templates = require('../templates');

const prompt = inquirer.createPromptModule();

if (T.isInSourcePath()) {
    T.setCWD(T.Path.resolve(process.cwd(), '../'));
}

function deleteProject() {
    let message = T.msg.red('提醒：') + T.msg.yellow('此操作会将项目目录从本地磁盘中删除，您确定要删除吗{ 谨慎执行(u_u) } ');

    let name = T.getProjectName();
    let path = T.Path.resolve(process.cwd(), `${name}`);

    if (!T.fs.existsSync(path)) {
        T.log.red('× 项目不存在');
        return false;
    }

    prompt([
        {
            type: 'confirm',
            name: 'ok',
            message: message
        }
    ]).then(awn => {
        if (awn.ok) {
            _delete(path);
        }
    });
}

function _delete(path) {
    const removePrg = new LoadingORA();
    removePrg.start('正在删除项目，请稍后......');
    T.fsa.remove(path, err => {
        if (err) T.log.red(`× ${err}`);
        else removePrg.stop('√ 项目删除成功！');
    });
}

function addTemplate() {
    let [action, name, url, vs] = T.argv._;
    vs && (vs = '^' + String(vs).replace(/^\^/, ''));
    name = String(name);
    if (!name || !url) {
        T.log.red(`× 必须指定模板名称<templateName>和模板地址<templateGitUrl(username/repo)>
                    \n 如：gupack addTemplate vue_browserify RodeyManager/vue_browserify`);
        return false;
    }
    templates[name] = {
        url,
        vs
    };

    let template = templates[name];
    require('./download')(template)
        .then(result => {
            T.log.end(T.msg.green(result.message + '  \n√ Path: ' + result.tempPath));
            templateWT();
        })
        .catch(err => {
            T.log.red(err.message);
        });
}

function removeTemplate() {
    let [action, name] = T.argv._;

    if (!name) {
        T.log.red(`× 必须指定需要删除模板名称<templateName>
                    \n 如：gupack removeTemplate vue_browserify`);
        return false;
    }
    if (!(name in templates)) {
        T.log.red(`× 未找到当前指定模板，当前已存在的模板：${Object.keys(templates).join('、')}`);
        return false;
    }

    prompt([
        {
            type: 'confirm',
            name: 'ok',
            message: `您确定要删除该(${name})模板吗?`
        }
    ]).then(awn => {
        if (!awn.ok) return;
        _rem;
    });

    return false;
}

function _removeTemplate(name) {
    const loading = new LoadingORA();
    loading.start(T.msg.yellow('start remove ......'));
    T.fsa.removeSync(T.Path.resolve(userHome, '.gupack-templates', templates[name]['url']));
    delete templates[name];
    loading.stop();
    templateWT();
    loading.stop(T.msg.green(`√ 你也可以使用 gupack new myapp --template ${name} --skip-cache 来创建项目并下载最新的模板了(╯﹏╰)!`));
}

function listTemplate() {
    const chalk = require('chalk');
    let tks = Object.keys(templates);
    let sl = tks.map(tk => {
        return tk.length;
    });
    let maxLen = _.max(sl);
    if (tks.length > 0) {
        let s = '',
            sl = [],
            template;
        tks.forEach((k, i) => {
            template = templates[k];
            s += `${T.msg.green(T.fillAlign(tks[i], maxLen))}: ${T.msg.gray('https://github.com/' + template.url)}, ${template.vs || ''} \n`;
        });
        T.log(s);
    } else {
        T.log.red(' 暂无模板，您可以添加模板, 如: gupack addTemplate GitHub_username/repo ');
    }
}

// wirite template and tips
function templateWT() {
    T.fsa.writeJSONSync(T.Path.resolve(__dirname, '../templates.json'), templates, 'utf8');
    T.log.green(`√ 模板添加成功! 你可以使用 gupack new myapp --template ${name} 来创建项目了!`);
    T.log.green(`! 你可以使用 gupack new myapp --template ${name} --skip-cache 来创建项目并下载最新的模板了(╯﹏╰)!`);
}

module.exports = {
    remove: deleteProject,
    addTemplate,
    removeTemplate,
    listTemplate
};
