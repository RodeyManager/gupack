
const
    T = require('../lib/tools'),
    Add = require('./add'),
    prompt = require('prompt'),
    loadTemplates = require('../_templates.js'),
    cwd = process.cwd();
// 提示
prompt.message = '\u63d0\u793a';

/**
 * 创建新项目
 * @param name      项目名称
 * @param form      模板地址
 * @param to        项目地址
 */


function create(){

    var projectName = String(T.argv._[1] || T.Path.parse(cwd)['name']),
        to = T.Path.resolve(cwd, String(T.argv._[1]) ? projectName : ''),
        from = T.Path.join(__dirname, '..', 'example');

    prompt.start();
    prompt.get([{
        name: 'ok',
        // 是否创建项目
        message: '\u662f\u5426\u521b\u5efa\u9879\u76ee? [yes/no]'
    }], (err, result) => {
        if(/^y|yes|ok|\u662f$/i.test(result.ok)){
            console.log('\n\r');
            createProject(projectName, from, to);
        }else{
            console.log('\n\r\x1b[31m  Aborting\x1b[0m');
            prompt.stop();
        }

    });

}

function createProject(name, from, to){

    if(Add.isInProject(name)){
        prompt.start();
        prompt.get([{
            name: 'ok',
            // 当前项目已经存在，是否需要覆盖
            message: '\u5f53\u524d\u9879\u76ee\u5df2\u7ecf\u5b58\u5728\uff0c\u662f\u5426\u9700\u8981\u8986\u76d6? [yes/no]'
        }], (err, result) => {
            if(/^y|yes|ok|\u662f$/i.test(result.ok)){
                T.fsa.removeSync(Path.resolve(Add.getPath(), name));
                _createProject(name, from, to);
                prompt.stop();
            }else{
                prompt.stop();
            }
        });

    }else{
        _createProject(name, from, to);
        prompt.stop();
    }

}

function _createProject(name, from, to){

    T.fsa.copySync(T.Path.resolve(from, 'src'), T.Path.resolve(to, 'src'));
    T.fsa.mkdirsSync(T.Path.resolve(to, 'build'));

    // 将新增加的项目添加到 项目列表文件中 _projects.json
    Add.addCreate(name);

    loadTemplates.forEach(file => {
        // 创建文件成功！
        console.log('  \x1b[36m\u521b\u5efa\u6587\u4ef6\u6210\u529f\uff01\x1b[0m : \x1b[32m src/' + file + '\x1b[39m');
    });

}

module.exports = create;