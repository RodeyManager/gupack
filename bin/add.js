'use strict';

const
    inquirer = require('inquirer'),
    userHome = require('user-home'),
    _        = require('lodash'),
    T        = require('../lib/tools');

if(T.isInSourcePath()){
    T.setCWD(T.Path.resolve(process.cwd(), '../'));
}

function deleteProject(){
    let message = T.msg.red('提醒：') + T.msg.yellow('此操作会将项目目录从本地磁盘中删除，您确定要删除吗{ 谨慎执行(u_u) } ');

    let name = T.getProjectName();
    let path = T.Path.resolve(process.cwd(), `${ name }`);

    if(!T.fs.existsSync(path)){
        T.log.red('× 项目不存在');
        return false;
    }

    inquirer.prompt([{
        type: 'confirm',
        name: 'ok',
        message: message
    }]).then(awn =>{
        if(awn.ok){
            _delete(path);
        }
    });
}

function _delete(path){
    const LP           = require('../lib/loadProgress'),
          LoadProgress = LP.LoadProgress;
    let removePrg      = new LoadProgress('正在删除项目，请稍后......', '√ 项目删除成功！');
    removePrg.type     = 'triangle';
    removePrg.start();
    T.fsa.remove(path, err =>{
        if(err) T.log.red(`× ${ err }`);
        else removePrg.close();
    });
}

function addTemplate(){
    let templates               = require('../templates');
    let [action, name, url, vs] = T.argv._;
    vs && (vs = '^' + String(vs).replace(/^\^/, ''));
    if(!name || !url){
        T.log.red(`× 必须指定模板名称<templateName>和模板地址<templateGitUrl(username/repo)> 
                    \n 如：gupack addTemplate vue_browserify RodeyManager/vue_browserify`);
        return false;
    }
    templates[String(name)] = {
        url, vs
    };
    templates               = JSON.stringify(templates, null, 4);
    T.fs.writeFile(T.Path.resolve(__dirname, '../templates.json'), templates, 'utf8', (err) =>{
        if(err) T.log.red(`× ${ err }`);
        else T.log.green(`√ 模板添加成功! 你可以使用 gupack new myproject --template ${ name } 来创建项目了!`);
    });

}

function removeTemplate(){
    let templates      = require('../templates');
    let [action, name] = T.argv._;
    let clear          = 'C' in T.argv || 'clear-templates' in T.argv;

    if(clear){
        const LoadProgress = require('../lib/loadProgress').LoadProgress;
        const loadPrg      = new LoadProgress('start clean ......', '√ 清空所有模板成功！');
        loadPrg.start();

        return T.fsa.remove(T.Path.resolve(userHome, '.gupack-templates/**/*'), err =>{
            if(err) return T.log.red(`× ${ err.toString() }`);
            loadPrg.close();
        });
    }

    if(!name){
        T.log.red(`× 必须指定需要删除模板名称<templateName> 
                    \n 如：gupack removeTemplate vue_browserify`);
        return false;
    }
    if(!(name in templates)){
        T.log.red(`× 未找到当前指定模板，当前已存在的模板：${ Object.keys(templates).join('、') }`);
        return false;
    }
    delete templates[name];
    templates = JSON.stringify(templates, null, 4);
    T.fs.writeFile(T.Path.resolve(__dirname, '../templates.json'), templates, 'utf8', (err) =>{
        if(err) T.log.red(`× ${ err }`);
        else T.log.green(`√ 模板删除成功! 你以后将不能使用 gupack new myproject --template ${ name } 来创建项目了(╯﹏╰)!`);
    });
}

function listTemplate(){
    const chalk   = require('chalk');
    let templates = require('../templates');
    let tks       = Object.keys(templates);
    let sl        = tks.map(tk =>{
        return tk.length;
    });
    let maxLen    = _.max(sl);
    if(tks.length > 0){
        let s = '', sl = [], template;
        tks.forEach((k, i) =>{
            template = templates[k];
            s += `${ T.msg.green(T.fillAlign(tks[i], maxLen)) }: ${ T.msg.gray('https://github.com/' + template.url) }, ${ template.vs || '' } \n`;
        });
        T.log(s);
    }else{
        T.log.red(' 暂无模板，您可以添加模板, 如: gupack addTemplate GitHub_username/repo ');
    }
}

module.exports = {
    remove: deleteProject,
    addTemplate,
    removeTemplate,
    listTemplate
};
