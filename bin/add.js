'use strict';

const
    prompt = require('prompt'),
    T  = require('../lib/tools');

if(T.isInSourcePath()){
    T.setCWD(T.Path.resolve(process.cwd(), '../'));
}

// 提示
prompt.message = '提示';

function deleteProject(){
    let message = '此操作会项目从本地磁盘中删除，您确定要删除吗( 谨慎执行(u_u) )? [yes/no]';

    let name = T.getProjectName();
    let path = T.Path.resolve(process.cwd(), `${ name }`);

    if(!T.fs.existsSync(path)){
        T.log.red('× 项目不存在');
        return false;
    }

    prompt.start();
    prompt.confirm(message, { name: 'ok' }, (err, result) => {
        if(result){
            T.fsa.remove(path, err => {
                if(err) T.log.red(`× ${ err }`);
                else    T.log.green('√ 项目删除成功!');
            });
            prompt.stop();
        }else{
            prompt.stop();
        }
    });
}

function addTemplate(){
    let templates = require('../templates');
    let [ action, name, url, vs ] = T.argv._;
    vs && (vs = '^' + String(vs).replace(/^\^/, ''));
    if(!name || !url){
        T.log.red(`× 必须指定模板名称<templateName>和模板地址<templateGitUrl(username/repo)> 
                    \n 如：gupack addTemplate vue_browserify RodeyManager/vue_browserify`);
        return false;
    }
    templates[String(name)] = {
        url, vs
    };
    templates = JSON.stringify(templates, null, 4);
    T.fs.writeFile(T.Path.resolve(__dirname, '../templates.json'), templates, 'utf8', (err) => {
        if(err) T.log.red(`× ${ err }`);
        else    T.log.green(`√ 模板添加成功! 你可以使用 gupack new myproject --template ${ name } 来创建项目了!`);
    });
}

function removeTemplate(){
    let templates = require('../templates');
    let [ action, name] = T.argv._;
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
    T.fs.writeFile(T.Path.resolve(__dirname, '../templates.json'), templates, 'utf8', (err) => {
        if(err) T.log.red(`× ${ err }`);
        else    T.log.green(`√ 模板删除成功! 你以后将不能使用 gupack new myproject --template ${ name } 来创建项目了(╯﹏╰)!`);
    });
}

module.exports = {
    remove: deleteProject,
    addTemplate,
    removeTemplate
};
