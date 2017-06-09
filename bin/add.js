
const prompt = require('prompt'),
    T  = require('../lib/tools');
var projectList = require('../_projects.json');

prompt.message = '\u63d0\u793a';

// gupack add
function add(){

    var name, path,
        project = {
            config: "src/gupack-config.js"
        };

    name = String(T.argv._[1] || T.Path.parse(process.cwd())['name']);
    path = String(T.argv._[1] || T.Path.parse(process.cwd())['dir']);
    path = T.Path.join(path, name);

    prompt.start();
    //添加项目名称
    prompt.get([{
        name: 'name',
        default: name || '',
        message: '\u9879\u76ee\u540d\u79f0'
    }], (err, result) => {

        name = result.name;
        if(name && projectList['projectList'][name]){
            T.confirm('\u5f53\u524d\u9879\u76ee\u5df2\u7ecf\u5b58\u5728\uff0c\u662f\u5426\u8986\u76d6? [yes/no]', ok => {
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
        }], (err, result) => {
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
    _deleteProject(false);
}

function deleteProject(){
    _deleteProject(true);
}

function _deleteProject(flag){
    //默认为移除项目 remove action
    var message = '\u6b64\u64cd\u4f5c\u5c06\u79fb\u9664\u8be5\u9879\u76ee\uff08\u4e0d\u4f1a\u5220\u9664\u786c\u76d8\u6587\u4ef6\uff09\uff0c\u60a8\u786e\u5b9a\u8981\u79fb\u9664\u5417? [yes/no]';
    if(flag){
        message = '\u6b64\u64cd\u4f5c\u5c06\u5220\u9664\u8be5\u9879\u76ee\uff08\u5e76\u5220\u9664\u786c\u76d8\u6587\u4ef6\uff09\uff0c\u60a8\u786e\u5b9a\u8981\u5220\u9664\u5417? [yes/no]';
    }

    var name = T.argv._[1];
    if(!name || '' == name){
        T.log.red('\u672a\u6307\u5b9a\u9879\u76ee');
        return false;
    }
    if(_isInProject(name)){
        prompt.start();
        prompt.confirm(message, { name: 'ok' }, (err, result) => {
            if(result){
                _delete(flag, name);
                prompt.stop();
            }else{
                prompt.stop();
            }
        });
    }else{
        T.log.red('\u672a\u627e\u5230\u5bf9\u5e94\u9879\u76ee');
        prompt.stop();
    }

}

// gupack create
function addCreate(name){

    var project = {
        config: "src/gupack-config.js",
        path: _getPath(),
        sourceDir: 'src',
        buildDir: 'build'
    };
    _add(name, project);

}

/**
 * 添加项目
 * @param name      项目名称
 * @param project   项目配置对象
 * @private
 */
function _add(name, project){

    var plist = projectList.projectList,
        host = T.argv['host'] || '127.0.0.1',
        port = T.argv['port'] || Math.round(Math.random() * 1000 + 3000);
    //端口去重
    if(!T.argv['port']){
        var tps = [];
        Object.keys(plist).forEach(p => {
            plist[p]['port'] && tps.push(plist[p]['port']);
        });
        port = T.generatePort(tps, port);
    }

    //储存 gupack start时需要的 host 、 port 、sport
    project['host'] = host;
    project['port'] = port;
    //websocket端口 在 http/https端口上加上 1000
    project['sport'] = port + 1000;
    //浏览器热更新延迟时间, 默认2秒
    project['liveDelay'] = T.argv['liveDelay'] || 2000;
    projectList['projectList'][name] = project;
    projectList = JSON.stringify(projectList, null, 2);

    T.fs.writeFileSync(T.Path.resolve(__dirname, '..', '_projects.json'), projectList);
}

/**
 * 移除项目
 * @param flag      是否删除硬盘文件
 * @param name      项目名称
 * @returns {boolean}
 * @private
 */
function _delete(flag, name){

    var path = projectList['projectList'][name]['path'];
    projectList['projectList'][name] = null;
    delete projectList['projectList'][name];

    var content = JSON.stringify(projectList, null, 2);
    T.fs.writeFileSync(T.Path.resolve(__dirname, '..', '_projects.json'), content, 'utf8');

    T.log.green(flag ? '\n\r  \u5220\u9664\u6210\u529f\uff01' : '\n\r  \u79fb\u9664\u6210\u529f');
    T.log.cyan('\u5df2\u5b58\u5728\u7684\u9879\u76ee\u5217\u8868:  ');
    Object.keys(projectList['projectList']).forEach(function(project){
        T.log.green('\t' + project);
    });

    if(flag){
        //delete directory
        if(T.fs.existsSync(path)){
            T.fsa.remove(path, err => {
                if(err) T.log.red(err);
            });
        }else{
            T.log.green('\n\r  \u9879\u76ee\u76ee\u5f55\u4e0d\u5b58\u5728');
        }
    }

}

function _isInProject(name){
    return !!projectList['projectList'][name];
}

function _getPath(){

    var name = String(T.argv._[1]),
        path = String(T.argv._[2]) || T.argv['path'];
    //存在路径,将作为作为项目路径
    if(path && path !== true && (/^[\.]{1,2}/.test(path) || ':' === path.slice(1, 2))){
        return T.Path.resolve(path, name || '');
    }else{
        return T.Path.resolve(process.cwd(), name || '');
    }
}

module.exports = {
    add: add,
    addCreate: addCreate,
    remove: remove,
    deleteProject: deleteProject,
    isInProject: _isInProject,
    getPath: _getPath
};
