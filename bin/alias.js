/**
 * Created by Rodey on 2016/8/25.
 * 为 gupack 创建别名
 * gupack alias gp
 *
 * 之后可以使用 gp命令 代替 gupack命令
 */
'use strict';

const
    T = require('../lib/tools'),
    exec = require('child_process').exec,
    prompt = require('prompt');
// 提示
prompt.message = '提示';

function alias(){

    let aliasName = T.argv._[1],
        isRemove = T.argv['remove'],
        npmPath;
    if(!aliasName){
        T.log.red('× 未指定别名');
        return false;
    }

    let npmRoot = exec('npm root -g');
    npmRoot.stdout.on('data', data => {
        npmPath = data;
        isRemove ? remove(aliasName, npmPath) : _alias(aliasName, npmPath);
    });

}

/**
 * 设置别名
 * @param name      别名名称
 * @param path      命令文件路径（存在于npm -g 目录）
 * @private
 */
function _alias(name, path){

    prompt.start();
    T.prompt('是否确认创建别名（别名有可能覆盖系统命令，请确保别名不与系统其它命令重复）? [yes/no]').then(() => {
        console.log('\n\r');
        _copyFiles(name, path);
    }).catch(err => {
        T.log.red(`× ${ err } `);
        prompt.stop();
    });

}

function _copyFiles(name, path){

    try{
        T.fsa.copySync(T.Path.resolve(path, '../gupack'), T.Path.resolve(path, '../', name));
        T.fsa.copySync(T.Path.resolve(path, '../gupack.cmd'), T.Path.resolve(path, '../', name + '.cmd'));
        T.log.green(`√ 创建别名成功，您可以使用${ name }命令了！`);
    }catch(e){
        T.log.red(`× ${ e.message }`);
    }
    prompt.stop();
}

/**
 * 删除别名
 * @param name  别名
 * @param path  路径
 */
function remove(name, path){

    prompt.start();
    T.prompt('是否确认删除别名? [yes/no]').then(() => {
        console.log('\n\r');
        _remove(name, path);
    }).catch((err) => {
        T.log.red(`× ${ err } `);
        prompt.stop();
    });
}

function _remove(name, path){
    try{
        T.fsa.removeSync(T.Path.resolve(path, '../', name));
        T.fsa.removeSync(T.Path.resolve(path, '../', name + '.cmd'));
        // 删除成功！
        T.log.green('√ 删除成功！');
    }catch(e){
        T.log.red(`× ${ e.message }`);
    }
    prompt.stop();
}

module.exports = alias;
