/**
 * Created by Rodey on 2016/8/25.
 * 对已有项目进行单个配置
 * exp1:
 * gupack config tmall --liveDelay 2000 --path D:/Sites/test/tmall --host 127.0.0.1 --port 3350
 * exp2:
 * gupack config tmall port  //=> 3350
 * exp3:
 * gupack config tmall --port //=> 3350
 *
 */

var T   = require('../lib/tools'),
    _   = require('lodash');
var projectList = require('../_projects.json').projectList;

module.exports = function(){
    var argv    = T.argv,
        name = argv._[1],
        key = argv._[2],
        project = projectList[name];

    if(!project){
        T.log.red('\n\r  \u4e0d\u5b58\u5728\u9879\u76ee: '+ name);
        return false;
    }

    //配置列表
    var cfs = argv;
    delete cfs['_'];

    //查看单个配置
    var kcfs = Object.keys(cfs);
    if(key || (kcfs.length === 1 && cfs[kcfs[0]] === true)){
        var value = project[key || kcfs[0]];
        T.log.yellow('\n\r  ' + value);
        return false;
    }

    //设置配置
    projectList[name] = _.assign(project, cfs);

    var projects = JSON.stringify({ "projectList" : projectList }, null, 2);
    T.fs.writeFile(T.Path.resolve(__dirname, '..', '_projects.json'), projects, 'utf8', function(err){
        if(err){
            T.log.red('\n\r  \u8bbe\u7f6e\u914d\u7f6e\u5931\u8d25');
        }else{
            T.log.green('\n\r  \u8bbe\u7f6e\u914d\u7f6e\u6210\u529f');
        }
    });

};