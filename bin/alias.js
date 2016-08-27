/**
 * Created by Rodey on 2016/8/25.
 * 为 gupack 创建别名
 * gupack alias gp
 *
 * 之后可以使用 gp命令 代替 gupack命令
 */

var T = require('../lib/tools');
var prompt = require('prompt');
prompt.message = '\u63d0\u793a';

function alias(){

    var aliasName = T.argv._[1],
        isRemove = T.argv['remove'],
        npmPath;
    if(!aliasName){
        T.log.yellow('\n\r  \u672a\u6307\u5b9a\u522b\u540d');
        return false;
    }

    var npmRoot = T.exec('npm root -g');
    npmRoot.stdout.on('data', function(data){
        npmPath = data;
        isRemove ? remove(aliasName, npmPath) : _alias(aliasName, npmPath);
    });

    //npmRoot.on('exit', function(code){
    //    process.exit(1);
    //});

}

/**
 * 设置别名
 * @param name      别名名称
 * @param path      命令文件路径（存在于npm -g 目录）
 * @private
 */
function _alias(name, path){

    prompt.start();
    prompt.get([{
        name: 'ok',
        message: '\u662f\u5426\u786e\u8ba4\u521b\u5efa\u522b\u540d\uff08\u522b\u540d\u6709\u53ef\u80fd\u8986\u76d6\u7cfb\u7edf\u547d\u4ee4\uff0c\u8bf7\u786e\u4fdd\u522b\u540d\u4e0d\u4e0e\u7cfb\u7edf\u5176\u5b83\u547d\u4ee4\u91cd\u590d\uff09? [yes/no]'
    }], function(err, result){
        if(/^y|yes|ok|\u662f$/i.test(result.ok)){
            console.log('\n\r');
            _copyFiles(name, path);
        }else{
            console.log('\n\r\x1b[31m  Aborting\x1b[0m');
            prompt.stop();
        }

    });

}

function _copyFiles(name, path){

    try{
        T.fsa.copySync(T.Path.resolve(path, '../gupack'), T.Path.resolve(path, '../', name));
        T.fsa.copySync(T.Path.resolve(path, '../gupack.cmd'), T.Path.resolve(path, '../', name + '.cmd'));
        T.log.green('\u521b\u5efa\u522b\u540d\u6210\u529f\uff0c\u60a8\u53ef\u4ee5\u4f7f\u7528' + name + '\u547d\u4ee4\u4e86\uff01');
    }catch(e){
        T.log.red(e);
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
    prompt.get([{
        name: 'ok',
        message: '\u662f\u5426\u786e\u8ba4\u5220\u9664\u522b\u540d? [yes/no]'
    }], function(err, result){
        if(/^y|yes|ok|\u662f$/i.test(result.ok)){
            console.log('\n\r');
            _remove(name, path);
        }else{
            console.log('\n\r\x1b[31m  Aborting\x1b[0m');
            prompt.stop();
        }

    });

}

function _remove(name, path){
    try{
        T.fsa.removeSync(T.Path.resolve(path, '../', name));
        T.fsa.removeSync(T.Path.resolve(path, '../', name + '.cmd'));
        T.log.green('\u5220\u9664\u6210\u529f\uff01');
    }catch(e){
        T.log.red(e);
    }
    prompt.stop();
}

module.exports = alias;
