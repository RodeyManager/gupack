[![Coverage Status](https://coveralls.io/repos/github/RodeyManager/gupack/badge.svg?branch=master)](https://coveralls.io/github/RodeyManager/gupack?branch=master)

<div style="text-align:center;"><img src="/doc/assets/images/gupack-128.png" alt="gupack" /></div>

### 安装
```javascript
    npm install -g gupack
```

### 命令使用参数

**使用帮助查看命令：gupack --help**

    -p, --project       指定当前编译的项目
    -d, --dest          指定编译后的输出路径
    -e, --env           设置环境
    -s, --server        是否启动内置静态服务器
    -o, --open-browser  启动内置静态服务器是否打开默认浏览器
    -t                  指定编译任务
    -T, --template      新建项目时指定模板
    -c                  清理编译目录
    --host              服务器主机
    --port              服务器端口
    --liveDelay         热更新延迟时间，单位ms
    -v, --version       查看当前版本号

### 命令

    new                 <projectName> 创建项目;
         --auto-install: 新建项目后自动安装npm相关依赖模块
         -T --template: 选择项目模板
    task                <taskName>(可选) 编译指定任务;
    build               [<projectName>] 编译项目;
         -e, --env <env> 指定编译环境,(local:本地; dev:开发; stg:测试; prd:生产)
         -d, --dest <destPath> 指定编译输出目录
         -t <taskName> 指定编译任务（gupack build -t js+css -e dev）
         -c 编译前清空编译路径下的所有文件
         -s, --server 是否启动内置静态服务器（热更新）
    start               启动内置Node静态服务器; -o, --open-browser 启动内置静态服务器是否打开默认浏览器
    publish             [<projectName>] 发布部署项目;
    gc                  <type> <name>生成指定组件（类型：vue、react、angluar）;
    gs                  <type> <name>生成指定服务组件（类型：default、angluar）;
    gv                  <type> <name>生成指定视图模块（类型：default、angluar）;
    clean                清空编译路径下的所有文件;
    delete              <projectName> 从本地磁盘中删除(谨慎执行(u_u));
    alias               <name> 为gupack设置一个全局命令别名;
    versions            查看相关版本;

### 使用说明

new【新建项目】
```javascript
    gupack new <prohectName>
    // 新建项目后自定安装npm依赖模块
    gupack new mall --auto-install
    // 新建项目将提示选择对应的模板
    // 目前模板列表（ES6+Browserify; vue+Browserify; react+Browserify; angluar2+Browserify）
    // 后期提供webpack相关模板
    // 项目编译主要已gulp为基础
```

build【编译项目】对项目进行编译

```javascript
    gupack build <prohectName>
    //或者定位到项目下，执行 gupack build
    
    //编译项目可带命令参数，请查看[命令参数]
```

task【编译指定任务】
```javascript
    gupack task <taskName>
    //未指定，将显示任务列表提示选择
```

start【启动项目】运行gupack自带的静态文件服务器，便于本地调式项目（包括浏览器实时更新功能）
```javascript
    gupack start <projectName>
    //或者定位到项目下，执行 gupack start
    //编译项目可带命令参数，请查看[命令参数]
```

publish【发布项目】
```javascript
    gupack publish <projectName>
    //或者定位到项目下，执行 gupack publish

    //如果在gupack-config.js中配置了statics选项，则publish后，项目中的所有连接地址都会加上statics中对应配置地址
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

    //从gupack项目列表中删除（同时删除硬盘文件）
```

alias【为gupack命令创建别名】
```javascript
    gupack alias gp
    //任何位置执行
    gp create mall
    
    创建成功后，将可以以别名的方式运行gupack命令
```
                    

## upack-config文件配置
*   ```env```：string, 当前编译环境(本地(默认):local; 开发:dev; 测试:stg; 生产:prd)
*   ```sourceDir```：string, 源文件路径, 默认为项目下的src
*   ```buildDir```：string, 编译产出路径，可以是绝对或者相对路径，默认项目下的build
*   ```port```：number, 本地开发Node调式服务器端口
*   ```liveDelay```：number, 浏览器实时更新延迟时间
*   ```buildTasks```：object, 项目编译任务列表
*   ```statics```: object, 发布部署CDN相关配置
*   ```deploy```: object, 发布部署服务器相关配置
*   ```startClean```: boolean, 编译项目前是否清空编译目录

## buildTask下单个任务相关配置
*   ```src```：string or array, 当前任务编译源码(支持glob)
*   ```dest```：string, 当前任务源码编译后目录
*   ```filter```：array, 过滤列表(支持glob)
*   ```watch```：array, 监听列表(支持glob)
*   ```nowatch```：boolean, 是否监听文件按变化触发任务执行
*   ```rely```：array, 当前任务所依赖的任务列表
*   ```loader```: object, 任务流（gulp插件）相关配置
*   ```run```: boolean, 是否执行当前任务
*   ```before```: function, 任务执行前
*   ```after```: function, 任务执行后

## statics相关配置
*   ```_if```：boolean, 是否执行
*   ```testExt```：regexp, 需要匹配替换的文件后缀（exp：/^\.(html|tpl|jade|md|css|scss|less|styl|vue|jsx)[^\.]*$/i,）
*   ```hostname```：string, 主机
*   ```nodes```：array, 分散节点，例如需要对图片、视频或者js和css做不同的CDN配置，包含独立的匹配模式

                exp:
                {
                    extname: /^\.(png|jpg|jpeg|gif|svg|bmp|ico|webpng)[^\.]*$/i,
                    pathname: 'pic',
                    hostname: 'http://image.cdn.com'
                },

## deploy相关配置
*   ```isExecute```：boolean，是否执行部署
*   ```host```：string, 服务器主机
*   ```port```：number, 服务器端口，默认：22
*   ```user```：string, 用户名
*   ```pass```：string, 密码
*   ```timeout```：number, 发布上传超市时间，默认：50000
*   ```localPath```: string, 上传的本地目录，默认：项目编译后的目录（支持glob）
*   ```remotePath```: string, 远程服务器目录
*   ```filters```: array, 发布上传中需要过滤的文件（支持glob）
*   ```onUploadedComplete```: function, 发布完成事件回调
*   ```onUploadedFileSuccess```: function, 文件发布成功事件回调
*   ```onUploadedFileError```: function, 文件发布失败事件回调

更多认证参数请参考 [ssh2](https://github.com/mscdex/ssh2)

## gupack-config.js 文件配置实例
```javascript

    'use strict';

    const
        path         = require('path'),
        babelify     = require('babelify'),
        vueify       = require('vueify'),
        extractCss   = require('vueify/plugins/extract-css'),
        env          = require('./config/app-env');

    const
        //静态资源版本控制号
        vQueryKey = '_rvc_',
        hashSize = 10;

    //导出模块
    module.exports      =  {
        env: env.name,
        // 源文件路径, 默认为 src
        sourceDir: env.source.path,
        // 编译产出路径，可以是绝对或者相对路径，默认为 build
        buildDir: env.dest.path,
        // 默认启动地址
        indexFile: 'views/index.html',
        // 每次执行编译之前是否清理当前编译目录
        startClean: true,
        // 静态资源CDN配置
        statics: {
            _if: false,
            // 需要匹配替换的文件后缀
            // testExt: /^\.(html|tpl|jade|md|css|scss|less|styl|vue|jsx)[^\.]*$/i,
            hostname: 'http://esales.cignacmb.com/',
            nodes: [
                { extname: /^\.(png|jpg|jpeg|gif|bmp|ico|webpng)[^\.]*$/i, pathname: 'pic', hostname: 'http://image.cdn.com' },
                { extname: /^\.(otf|eot|svg|ttf|woff2?)[^\.]*$/i, pathname: 'fonts-api' },
                { extname: /^\.(js?)[^\.]*$/i, pathname: 'scripts', hostname: 'http://js.cdn.com' }
            ]
        },
        port: 3000,
        // task任务列表
        buildTasks: {
            // ---说明：单个任务配置
            'build.css': {
                // 源文件
                src: [
                    'assets/css/reset.css',
                    'assets/css/**/*'
                ],
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

            'build.assets': {
                src: 'assets/{fonts,images,js,libs}/**/*',
                filters: [],
                dest: 'assets',
                loader: jsLoaders()
            },

            'build.views': {
                src: ['views/**/*.html'],
                filters: [],
                rely: [
                    'build.css',
                    'build.modules.views'
                ],
                dest: 'views',
                loader: htmlLoaders(),
                watch: [
                    'views/**/*',
                    'components/**/*',
                    'templates/**/*'
                ]
            },

            'build.modules.views': {
                src: 'modules/**/*View.js',
                dest: 'modules',
                //依赖task列表
                rely: ['build.assets'],
                loader: {
                    'gulp-browserify-multi-entry': {

                        debug: !env.isIf,
                        external: ['vue', 'axios'],
                        transform: [ vueify, babelify ],
                        plugin: [
                            [ extractCss, {
                                out: path.join(env.dest.path, 'assets/css/components.min.css')
                            }],
                        ]
                    },
                    'gulp-jsminer': {
                        _if: env.isProduction,
                        preserveComments: '!'
                    }
                },
                watch: [ 'assets/js/**/*', 'components/**/*', 'modules/**/*', 'config/**/*', 'services/**/*' ]
            }

        },
        // 发布配置
        deploy: [
            {
                isExecute: false,
                host: '192.168.233.130',
                user: 'root',
                pass: 'root123',
                port: 22,
                timeout: 50000,
                // localPath: path.join(__dirname, '../build/**/*'),
                filters: [],
                remotePath: '/var/www/app',
                onUploadedComplete: function(){
                    console.log('-----上传完成-----');
                }
            }
        ]

    };

    function cssLoaders(fileName){
        return {
            'gulp-merge-css': { fileName: fileName },
            'gulp-recache': recache(env.dest.path + '/assets'),
            'gulp-autoprefixer': {
                browsers: ['> 5%', 'IE > 8', 'last 2 versions']
            },
            'gulp-uglifycss': { _if: env.isProduction }

        }
    }

    function jsLoaders(){
        return {
            'gulp-jsminer': {
                _if: env.isProduction,
                preserveComments: '!'
            }
        }
    }

    function htmlLoaders(){
        return {
            'gulp-tag-include': { compress: env.isProduction },
            'gulp-recache': recache(env.dest.path)
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