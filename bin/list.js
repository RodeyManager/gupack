/**
 * Created by Rodey on 2016/8/25.
 * 对已有项目进行单个配置
 */

const
    util = require('util'),
    T  = require('../lib/tools'),
    projectList = require('../_projects.json').projectList;

/**
 * 列出所有项目
 * gupack list
 */
module.exports.list = function(){

    var info = T.argv['i'] || T.argv['info'];
    if(util.isObject(projectList) && Object.keys(projectList).length !== 0){
        T.log.green('\n\r  \u5df2\u5b58\u5728\u7684\u9879\u76ee\u5217\u8868 --->>>');
        if(info){
            T.log.green(JSON.stringify(projectList, null, 2));
        }else{
            T.log.green(Object.keys(projectList).join('\n\r  '));
        }
        T.log.yellow('\n\r  \u67e5\u770b\u9879\u76ee\u4fe1\u606f\uff1a' +
                    '\n\r  gupack info [projectName] \u6216 gupack [projectName] -i');
    }else{
        T.log.red('\n\r  \u6682\u65e0\u9879\u76ee');
    }

};

/**
 * 查看单个项目配置信息
 * gupack info [projectName]
 */
module.exports.info = function(){

    var info = T.argv['i'] || T.argv['info'],
        name;
    if(info){
        //执行的是 gupack tmall -i[--info]
        name = T.argv._[0];
    }else{
        name = T.argv._[1];
    }
    name = name || T.Path.parse(process.cwd())['name'];

    if(util.isObject(projectList[name]) && Object.keys(projectList[name]).length !== 0){
        T.log.green('\n\r' + JSON.stringify(projectList[name], null, 2));
    }else{
        T.log.red('\n\r  \u8be5\u9879\u76ee\u90e8\u5b58\u5728\uff0c\u67e5\u770b\u9879\u76ee\u4fe1\u606f\uff1a');
        T.log.yellow('\n\r  gupack info [projectName] \u6216 gupack [projectName] -i');
    }

};
