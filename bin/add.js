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

module.exports = {
    remove: deleteProject
};
