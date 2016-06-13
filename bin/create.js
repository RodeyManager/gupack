
var T = require('../lib/tools');
var Add = require('./add');
var prompt = require('prompt');
var loadTemplates = require('../_templates.js');

/**
 * 创建新项目
 * @param name      项目名称
 * @param form      模板地址
 * @param to        项目地址
 */

function createProject(name, from, to){

    if(Add.isInProject(name)){
        prompt.start();
        prompt.get([{
            name: 'ok',
            message: '\u5f53\u524d\u9879\u76ee\u5df2\u7ecf\u5b58\u5728\uff0c\u662f\u5426\u9700\u8981\u8986\u76d6? [yes/no] '
        }], function(err, result){
            if(/^y|yes|ok|\u662f$/i.test(result.ok)){
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

    var directory,
        dirs = [null, 'src', 'build'],
        assetsDirs = [null, 'css', 'js', 'js/SYST', 'fonts', 'components', 'components/legalSelector', 'layout', 'images', "mockData"],
        modulesDirs = [null, 'index', 'passport'],
        viewsDirs = [null];

    _create();

    //创建文件夹
    function _create(){
        dirs.forEach(function(dir){
            directory = !dir ? to : T.Path.resolve(to, dir);
            mkdir(directory);
        });

        assetsDirs.forEach(function(dir){
            directory = !dir ? T.Path.resolve(to, 'src/assets') : T.Path.resolve(to, 'src/assets', dir);
            mkdir(directory);
        });

        modulesDirs.forEach(function(dir){
            directory = !dir ? T.Path.resolve(to, 'src/modules') : T.Path.resolve(to, 'src/modules', dir);
            mkdir(directory);
        });

        viewsDirs.forEach(function(dir){
            directory = !dir ? T.Path.resolve(to, 'src/views') : T.Path.resolve(to, 'src/views', dir);
            mkdir(directory);
        });

        //复制模板
        _loadFiles(from, to);
        _load$(from, to);

        //将新增加的项目添加到 项目列表文件中 _projects.json
        Add.addCreate(name);

    }

    //console.log(form, to);

}

//创建模板文件
function _loadFiles(from, to){

    var otherRegx = /\.(jpg|jpeg|png|gif|webpg|svg|eot|ttf|woff|mp3|wma)+?/i;

    Object.keys(loadTemplates).forEach(file => {

        var template = loadTemplates[file];
        var content = otherRegx.test(T.Path.basename(template.source)) ? loadFile(template.source) : loadTemplateFile(template.source);
        //console.log(content);
        writeTemplateFile(T.Path.resolve(to, 'src', template.dest), content);

    });

}

function _load$(from, to){

    var $name = 'jquery', $version, $ns;
    var $terminal = T.argv['$'] || T.argv['terminal'];

    if($terminal && '' !== $terminal){
        $ns = $terminal.split('@');
        $name = $ns[0] || 'jquery';
        $version = $ns[1];

        //如果指定了版本号
        if(/^jquery$/i.test($name)){
            $name = 'jquery';
        }
        else if(/^zepto$/i.test($name)){
            $name = 'zepto';
        }else{
            $name = 'jquery';
        }

    }

    //创建对应的目录
    var tot = T.Path.resolve(to, 'src/assets/js', $name);
    mkdir(tot);

    var $content = loadTemplateFile('assets/js/' + $name + '/' + $name + '.js');


    if($name === 'zepto'){
        //加入 fastclick 库
        $content += '\n\r\t/* fastclick.js */\n' + loadTemplateFile('assets/js/' + $name + '/fastclick.js');
        $content += '\n' + '$(function() {' + '\n\r\t' + 'FastClick.attach(document.body);'+ '\n' +'});';
        //writeTemplateFile(T.Path.resolve(tot, 'fastclick.js'), $content);
    }

    writeTemplateFile(T.Path.resolve(tot, $name + '.js'), $content);

    var gulpConfig = loadTemplateFile('gulp-config.js');
    gulpConfig = gulpConfig.replace(/\{\{@_\$_\}\}/gi, $name);
    writeTemplateFile(T.Path.resolve(to, 'src/gulp-config.js'), gulpConfig);

}

function mkdir(directory){
    T.mkdirp.sync(directory);
    console.log('  \x1b[36m\u521b\u5efa\u76ee\u5f55\u6210\u529f\uff01\x1b[0m : \x1b[32m' + directory + '\x1b[39m');
}

//读取模板文件
function loadTemplateFile(name){
    return T.fs.readFileSync(T.Path.join(__dirname, '..', 'example/src', name), 'utf-8');
}

//读取模板文件
function loadFile(name){
    return T.fs.readFileSync(T.Path.join(__dirname, '..', 'example/src', name), null);
}

//写入模板文件
function writeTemplateFile(path, content, mode){
    T.fs.writeFileSync(path, content, { mode: mode || '0666' });
    console.log('  \x1b[36m\u521b\u5efa\u6587\u4ef6\u6210\u529f\uff01\x1b[0m : \x1b[32m' + path + '\x1b[39m');
}



module.exports = createProject;