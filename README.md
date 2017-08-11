
![gupack](/doc/assets/images/gupack-128.png)

### 安装
```javascript
    npm install -g gupack
```  
taobao镜像 [http://npm.taobao.org/](http://npm.taobao.org/)
```javascript
    cnpm install -g gupack
```

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

[new](#create), 创建一个项目; EXP: gupack create mall

[build](#build), 编译项目; EXP: gupack build mall

[task](#task), 编译指定任务; EXP: gupack task <taskName>

[start](#start), 启动Node服务器; EXP: gupack start mall

[publish](#publish), 编译并发布项目; EXP: gupack publish mall

[remove](#remove), 移除项目; EXP: gupack remove mall

[delete](#delete), 移除项目，并删除本地磁盘目录; EXP: gupack delete mall

[install](#install), 安装gulp插件; EXP: gupack install gulp-rename

[uninstall](#uninstall), 卸载gulp插件; EXP: gupack uninstall gulp-rename

[update](#update), 更新gulp插件; EXP: gupack update gulp-rename

[alias](#alias), 设置命令别名 EXP: gupack alias gp

### 使用说明

new【新建项目】
```javascript
    gupack new mall
    // 新建项目后自定安装npm依赖模块
    gupack new mall --auto-install
```

build【编译项目】对项目进行编译

```javascript
    gupack build mall
    //或者定位到项目下，执行 gupack build
    
    编译项目可带命令参数，请查看[命令参数]
```

task【编译指定任务】
```javascript
    gupack task css
    //未指定，将显示任务列表提示选择
```

start【启动项目】运行gupack自带的静态文件服务器，便于本地调式项目（包括浏览器实时更新功能）
```javascript
    gupack start mall
    //或者定位到项目下，执行 gupack start
    编译项目可带命令参数，请查看[命令参数]
```

publish【发布项目】
```javascript
    gupack publish mall
    //或者定位到项目下，执行 gupack publish

    如果在gupack-config.js中配置了hostname选项，则publish后，项目中的所有连接地址都会加上hostname地址
```
remove【移除项目】
 ```javascript
    gupack remove mall
    //或者定位到项目下，执行 gupack remove

    从gupack项目列表中移除（不会删除硬盘文件）
```
delete【删除项目】
```javascript
    gupack delete mall
    //或者定位到项目下，执行 gupack delete

    从gupack项目列表中删除（同时删除硬盘文件）
```

install【安装gulp插件】
```javascript
    gupack install gulp-rename
    //任何位置执行

    安装gulp插件（由于gupack基于gulp插件运行）
```
uninstall【卸载gulp插件】
```javascript
    gupack uninstall gulp-rename
    //任何位置执行

    卸载gulp插件（由于gupack基于gulp插件运行）
```
update【更新gulp插件】
```javascript
    gupack update gulp-rename
    //任何位置执行

    更新gulp插件（由于gupack基于gulp插件运行）
```
alias【为gupack命令创建别名】
```javascript
    gupack alias gp
    //任何位置执行
    gp create mall
    
    创建成功后，将可以以别名的方式运行gupack命令
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
        util  = require('util'),
        env   = require('./config/app-env');
    
    const
        //静态资源版本控制号
        vQueryKey = '_rvc_',
        hashSize = 10;
    
    //导出模块
    module.exports      =  {
        env: env.name,
        // 源文件路径, 默认为 src
        sourceDir: 'src',
        // 编译产出路径，可以是绝对或者相对路径，默认为 build
        buildDir: env.dest.path,
        hostname: 'http://esales.cignacmb.com/',
        // task任务列表
        buildTasks: {
            // ---说明：单个任务配置
            'build.css': {
                // 源文件
                src: 'assets/css/**/*',
                // 额外的插件样式，如果不是每个页面都用到，不建议合并到主样式文件中
                // 可以单独在使用到的页面中引用
                plugins: [],
                dest: 'assets/css',
                // 依赖task列表
                rely: ['build.assets'],
                // gulp插件
                loader: cssLoaders('app.min.css'),
                // 监听变化（文件改变执行该任务）
                watch: ['assets/css/**/*']
            },
    
            'build.modules': {
                src: ['modules/**/*'],
                //过滤掉不进行编译的文件或目录
                filters: [
                    'modules/model.js',
                    'modules/view.js',
                    'modules/main.js'
                ],
                dest: 'modules',
                loader: jsLoaders(),
                watch: [ 'modules/**/*']
            },
    
            'build.views': {
                src: ['views/**/*.html'],
                filters: [],
                rely: ['build.assets', 'build.main'],
                dest: 'views',
                loader: htmlLoaders(),
                watch: [
                    'views/**/*',
                    'components/**/*',
                    'templates/**/*'
                ]
            },
    
            'build.main': {
                src: [
                    env.configPath,
                    'config/app-api.js',
                    'modules/main.js',
                    'modules/model.js',
                    'modules/view.js'
                ],
                dest: 'modules',
                // 开启babel编译转换
                babel: true,
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
                src: 'components/**/*.{css,scss,sass,styl,less}',
                dest: 'assets/css',
                //依赖task列表
                rely: ['build.assets'],
                loader: cssLoaders('components.min.css')
            },
    
            'build.assets': {
                src: 'assets/{fonts,images,js,libs}/**/*',
                dest: 'assets',
                loader: jsLoaders()
            }
    
        }
    };
    
    function cssLoaders(fileName){
        return {
            'gulp-merge-css': { fileName: fileName },
            'gulp-sass': { outputStyle: 'compressed' },
            'gulp-recache': recache(env.dest.path),
            'gulp-autoprefixer': {
                browsers: ['> 5%', 'IE > 8', 'last 2 versions']
            },
            'gulp-uglifycss': { _if: env.isIf }
    
        }
    }
    
    function jsLoaders(){
        return {
            'gulp-jsminer': {
                _if: env.isIf, preserveComments: '!'
            }
        }
    }
    
    function htmlLoaders(){
        return {
            'gulp-tag-include': { compress: env.isIf },
            'gulp-recache': recache(env.dest.path),
            'gulp-minify-html': { _if: env.isIf }
        }
    }
    
    function recache(path){
        return {
            _if: env.isIf,
            queryKey: vQueryKey,
            // hash值长度
            hashSize: hashSize,
            // 控制字节大小以内的图片转base64,
            toBase64Limit: 1000,
            basePath: path
        }
    }

````



#License
[MIT License](https://en.wikipedia.org/wiki/MIT_License)