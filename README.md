
![gupack](/doc/assets/images/gupack-128.png)

### 命令使用参数

**使用帮助查看命令：gupack --help**

-v, --version, 查看当前版本号

-p, --project, 指定当前编译的项目

-i, --info, 项目配置信息

-d, --buildpath, 指定编译后的输出路径

-e, --env, 设置环境

--host, 服务器主机

--port, 服务器端口

--liveDelay, 页面延迟更新时间（开发调式实时更新）

--server-path, 项目目录（启动服务器开发路径，编译后的目录）

-$, --terminal, 指定项目运行的终端平台，pc将使用jQuery；mobile将使用Zepto


### 命令

[create](#create), 创建一个项目; EXP: gupack create mall

[add](#add), 添加项目; EXP: gupack add mall D:\\Sites\\mall

[build](#build), 编译项目; EXP: gupack build mall

[start](#start), 启动Node服务器; EXP: gupack start mall

[restart](#restart), 重启Node服务器; EXP: gupack restart mall

[publish](#publish), 编译并发布项目; EXP: gupack publish mall

[remove](#remove), 移除项目; EXP: gupack remove mall

[delete](#delete), 移除项目，并删除本地磁盘目录; EXP: gupack delete mall

[list](#list), 查看所有项目; EXP: gupack list

[info](#info), 查看所有项目; EXP: gupack info

[install](#install), 安装gulp插件; EXP: gupack install gulp-rename

[uninstall](#uninstall), 卸载gulp插件; EXP: gupack uninstall gulp-rename

[update](#update), 更新gulp插件; EXP: gupack update gulp-rename

[alias](#alias), 设置命令别名 EXP: gupack alias gp

[config](#config),
                获取配置或设置配置; EXP: gupack config [projectName] --path D:/Sites/lop --host 127.0.0.1 --port 8080
                查看可配置的config选项：[Config Options]()

### 使用说明


create【创建项目】
```
    add【添加项目】将项目添加到gupack项目列表中
                
    gupack add mall D:\\Sites\\mall
    //提示: 项目名称: (mall)
    //提示：项目路径: D:\\Sites\\mall
```
build【编译项目】对项目进行编译

```
    gupack build mall
    //或者定位到项目下，执行 gupack build
    
    编译项目可带命令参数，请查看[命令参数]
```
start【启动项目】运行gupack自带的静态文件服务器，便于本地调式项目（包括浏览器实时更新功能）
```
    gupack start mall
    //或者定位到项目下，执行 gupack start
    编译项目可带命令参数，请查看[命令参数]
```

restart【重启服务】
```
    gupack restart mall
    //或者定位到项目下，执行 gupack restart
```
publish【发布项目】
```
    gupack publish mall
    //或者定位到项目下，执行 gupack publish

    如果在gupack-config.js中配置了hostname选项，则publish后，项目中的所有连接地址都会加上hostname地址
```
remove【移除项目】
 ```   
    gupack remove mall
    //或者定位到项目下，执行 gupack remove

    从gupack项目列表中移除（不会删除硬盘文件）
```
delete【删除项目】
```
    gupack delete mall
    //或者定位到项目下，执行 gupack delete

    从gupack项目列表中删除（同时删除硬盘文件）
```
list【查看项目列表】
```
    gupack list

    列出gupack所有项目
```
install【安装gulp插件】
```
    gupack install gulp-rename
    //任何位置执行

    安装gulp插件（由于gupack基于gulp插件运行）
```
uninstall【卸载gulp插件】
```
    gupack uninstall gulp-rename
    //任何位置执行

    卸载gulp插件（由于gupack基于gulp插件运行）
```
update【更新gulp插件】
```
    gupack update gulp-rename
    //任何位置执行

    更新gulp插件（由于gupack基于gulp插件运行）
```
alias【为gupack命令创建别名】
```
    gupack alias gp
    //任何位置执行
    gp create mall
    
    创建成功后，将可以以别名的方式运行gupack命令
```
config【查看或设置项目配置项】                     
```
    //查看项目服务端口
    gupack config tmall --port
    //设置项目服务端口
    gupack config tmall --port 3350
```
                    

##options[](options)
*   config： gupack-config文件相对（相对path）路径，[gupack-config文件配置说明]()
*   path： 项目绝对路径
*   host： Node本地服务器地址
*   port： Node本地服务器端口
*   liveDelay： 浏览器实时更新延迟时间
                
##gupack-config文件配置
```javascript

const
    nodePath      = require('path'),
    util            = require('util');

const
    argv          = process.argv.slice(2),
    _envIndex       = argv.indexOf('-e') || argv.indexOf('--env') || -1,

    //当前编译环境: dev: 开发环境(默认); stg: 测试环境; prd: 生成环境
    env             = argv[_envIndex + 1] || 'dev',
    isDev           = env === 'dev',
    isStg           = env === 'stg',
    isProduction    = env === 'prd' || env === 'production',
    isIf            = isStg || isProduction,

    //静态资源版本控制号
    vQueryKey       = '_rvc_',
    hashSize        = 10,
    //项目编译后的路径
    buildPath       = nodePath.resolve(__dirname, '../build'),
    //项目功能配置文件
    config          = 'config-' + (isDev ? 'dev' : isStg ? 'stg' : isProduction ? 'prd': 'dev') + '.js';

//导出模块
module.exports      =  {
    env: env,
    //源文件路径, 默认为 src
    source: 'src',
    //编译产出路径，可以是绝对或者相对路径，默认为 build
    build: 'build',
    //task任务列表
    buildTasks: {
        //---说明：单个任务配置
        'build.css': {
            src: 'assets/css/**/*',
            //额外的插件样式，如果不是每个页面都用到，不建议合并到主样式文件中
            //可以单独在使用到的页面中引用
            plugins: [],
            dest: 'assets/css',
            //依赖task列表
            rely: ['build.assets'],
            loader: util._extend({
                'gulp-concat-css': 'app.min.css'
            }, cssLoaders()),
            watch: ['assets/css/**/*']
        },

        'build.modules': {
            pathPrefix: 'modules/',
            src: ['**/*'],
            //过滤掉不进行编译的文件或目录
            filters: [
                'model.js',
                'view.js',
                'main.js'
            ],
            dest: 'modules',
            loader: util._extend({}, jsLoaders()),
            watch: [ 'modules/**/*']
        },

        'build.html': {
            src: ['views/**/*.html'],
            filters: [],
            dest: '',
            rely: ['build.assets', 'build.main'],
            loader: util._extend({}, htmlLoaders()),
            watch: [
                'views/**/*',
                'components/**/*',
                'templates/**/*'
            ]
        },

        'build.main': {
            src: [
                'config/' + config,
                'modules/main.js',
                'modules/model.js',
                'modules/view.js'
            ],
            dest: 'modules',
            loader: util._extend({
                'gulp-concat': 'main.js'
            }, jsLoaders())
        },

        //components目录下所有js进行打包
        'build.components.js': {
            src: 'components/**/*.js',
            dest: 'assets/js',
            loader: util._extend({
                'gulp-concat': 'components.js'
            }, jsLoaders())
        },

        //components目录下所有css进行打包
        'build.components.css': {
            src: 'components/**/*.{css,scss,less}',
            dest: 'assets/css',
            //依赖task列表
            rely: ['build.assets'],
            loader: util._extend({
                'gulp-concat-css': 'components.min.css'
            }, cssLoaders)
        },

        'build.assets': {
            src: 'assets/{fonts,images,js,libs}/**/*',
            dest: 'assets',
            loader: util._extend({}, jsLoaders())
        }

    }
};

function cssLoaders(){
    return {
        'gulp-sass': { outputStyle: 'compressed' },
        'gulp-recache': {
            _if: isIf,
            queryKey: vQueryKey,
            //hash值长度
            hashSize: hashSize,
            // 1000字节大小以内的图片转base64,
            toBase64Limit: 500,
            //资源根路径
            basePath: buildPath + '/assets'
        },
        'gulp-autoprefixer': {
            browsers: ['> 5%', 'IE > 8', 'last 2 versions'],
            cascade: false
        },
        'gulp-uglifycss': { _if: isIf }
    }
}

function jsLoaders(){
    return {
        'gulp-jsminer': {
            _if: isIf, preserveComments: '!'
        }
    }
}

function htmlLoaders(){
    return {
        'gulp-tag-include': {
            compress: isIf
        },
        'gulp-recache': {
            _if: isIf,
            queryKey: vQueryKey,
            //hash值长度
            hashSize: hashSize,
            // 1000字节大小以内的图片转base64,
            toBase64Limit: 1000,
            basePath: buildPath //'D:\\Sites\\test\\web_components\\build'
        },
        'gulp-minify-html': {
            _if: isIf,
            empty: true,       //去除空属性
            comments: false,    //去除html注释
            Spare: false        //属性值保留引号
        }
    }
}

```



#License
[MIT License](https://en.wikipedia.org/wiki/MIT_License)