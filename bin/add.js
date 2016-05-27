
var prompt = require('prompt');

var T  = require('../lib/tools');
var projectList = require('../_projects.json');

// gupack add
function add(){

    var name, path,
        project = {
            config: "src/gulp-config.js"
        };

    (T.argv._[1]) && (name = T.argv._[1]);
    (T.argv._[2]) && (path = T.argv._[2]);

    prompt.start();
    //添加项目名称
    prompt.get([{
        name: 'name',
        default: name || '',
        message: '\u9879\u76ee\u540d\u79f0'
    }], function(err, result){

        name = result.name;
        if(projectList['projectList'][name]){
            T.confirm('\u5f53\u524d\u9879\u76ee\u5df2\u7ecf\u5b58\u5728\uff0c\u662f\u5426\u8986\u76d6? [yes/no]: ', function(ok){
                if(ok){
                    getPath();
                }else{
                    //如果已经存在
                    T.log.red('\u5f53\u524d\u9879\u76ee\u5df2\u5b58\u5728 ');
                    prompt.stop();
                }
            });

        }else{
            getPath();
        }

    });

    //添加项目路径
    function getPath(){
        prompt.get([{
            name: 'path',
            default: path || '',
            message: '\u9879\u76ee\u8def\u5f84 (\u7edd\u5bf9)'
        }], function(err, result){
            path = result.path;

            project['path'] = path;
            projectList['projectList'][name] = project;
            _add(name, project);
            T.log.green('\u6dfb\u52a0\u9879\u76ee\u6210\u529f\uff01 ');
            prompt.stop();

        });
    }

}

//gupack remove
function remove(){
    var name = T.argv._[1];

    if(!name || '' === name){
        T.log.red('\u672a\u6307\u5b9a\u9879\u76ee');
    }else{
        _delete();
    }

    function _delete(){
        projectList['projectList'][name] = null;
        delete projectList['projectList'][name];

        var content = JSON.stringify(projectList, null, 2);
        T.fs.writeFileSync(T.Path.resolve(__dirname, '..', '_projects.json'), content);

        T.log.green('\n\r  \u5220\u9664\u6210\u529f\uff01');
        T.log.cyan('\u5df2\u5b58\u5728\u7684\u9879\u76ee\u5217\u8868:  ');
        Object.keys(projectList['projectList']).forEach(function(project){
            T.log.green('\t' + project);
        });
    }
}

// gupack create
function addCreate(name){

    var project = {
        config: "src/gulp-config.js",
        path: T.Path.resolve(process.cwd(), name)
    };
    _add(name, project);

}

function _add(name, project){

    projectList['projectList'][name] = project;
    projectList = JSON.stringify(projectList, null, 2);

    T.fs.writeFileSync(T.Path.resolve(__dirname, '..', '_projects.json'), projectList);
}

function _isInProject(name){
    return null != projectList['projectList'][name];
}

module.exports = {
    add: add,
    addCreate: addCreate,
    remove: remove,
    isInProject: _isInProject
};
