<h1 align="center"><img src="/doc/assets/images/gupack-128.png" alt="gupack" /><br /><br /></h1>

[![Build Status](https://travis-ci.org/RodeyManager/gupack.svg?branch=master)](https://travis-ci.org/RodeyManager/gupack)
[![npm Status](https://img.shields.io/npm/v/gupack.svg)](https://www.npmjs.com/package/gupack)

### 安装

```javascript
    npm install -g gupack
```

### 命令使用参数

**使用帮助查看命令：gupack -h**

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
    remove              <projectName> 从本地磁盘中删除(谨慎执行(u_u));
    alias               <name> 为gupack设置一个全局命令别名;
    versions            查看相关版本;

### 使用说明

new【新建项目】

```javascript
    // 新建项目将提示选择对应的模板
    gupack new <projectName>
    // 指定项目模板（gupack listTemplate 查看项目模板）
    gupack new mall --template <templateName>
    // 项目编译主要已gulp为基础
```

build【编译项目】对项目进行编译

```javascript
    gupack build -e <envName>
    //编译项目可带命令参数，请查看[命令参数]
```

task【编译指定任务】

```javascript
    gupack task <taskName>
    //未指定，将显示任务列表提示选择
```

start【启动项目】运行 gupack 自带的静态文件服务器，便于本地调式项目（包括浏览器实时更新功能）

```javascript
    gupack start <projectName>
    //编译项目可带命令参数，请查看[命令参数]
```

publish【发布项目】

```javascript
    gupack publish <projectName>
    //如果在gupack-config.js中配置了statics选项，则publish后，项目中的所有连接地址都会加上statics中对应配置地址
```

## gupack-config 项目配置（Object）

*   `env`：String, 当前编译环境(本地(默认):local; 开发:dev; 测试:stg; 生产:prd)
*   `sourceDir`：String, 源文件路径, 默认为项目下的 src
*   `buildDir`：String, 编译产出路径，可以是绝对或者相对路径，默认项目下的 dist
*   `port`Number, 本地开发 Node 调式服务器端口
*   `liveDelay`Number, 浏览器实时更新延迟时间
*   `buildTasks`：Object, 项目编译任务列表 [请查看单个任务相关配置](task)
*   `statics`: Object, 发布部署 CDN 相关配置
*   `proxy`: Object | String, 代理, [Options](https://www.npmjs.com/package/http-proxy#options)
*   `deploy`: Array, 发布部署服务器相关配置(支持多节点上传)
*   `startClean`: Boolean, 编译项目前是否清空编译目录
*   `indexFile`: String, 启动内置 Node 静态服务器，默认打开的首页，相对于 buildDir 路径

## buildTask 单个任务相关配置（Object）[name="task"]

*   `src`：String or Array, 当前任务编译源码(支持 glob)
*   `dest`：String, 当前任务源码编译后目录
*   `filter`：Array, 过滤列表(支持 glob)
*   `watch`：Array, 监听列表(支持 glob)
*   `nowatch`：Boolean, 是否监听文件按变化触发任务执行
*   `rely`：Array, 当前任务所依赖的任务列表
*   `loader`: Object, 任务流（gulp 插件）相关配置
*   `run`: Boolean, 是否执行当前任务
*   `before`: Function, 任务执行前
*   `after`: Function, 任务执行后

## statics 相关配置（Object）

*   `testExt`：regexp, 需要匹配替换的文件后缀（exp：/^\.(html|tpl|jade|md|css|scss|less|styl|vue|jsx)[^\.]\*$/i,）
*   `hostname`：String, 主机
*   `nodes`：Array, 分散节点，例如需要对图片、视频或者 js 和 css 做不同的 CDN 配置，包含独立的匹配模式

                exp:
                {
                    extname: /^\.(png|jpg|jpeg|gif|svg|bmp|ico|webpng)[^\.]*$/i,
                    pathname: 'pic',
                    hostname: 'http://image.cdn.com'
                },

## deploy 相关配置（Object | Array）

*   `isExecute`：Boolean，是否执行部署
*   `host`：String, 服务器主机
*   `port`Number, 服务器端口，默认：22
*   `user`：String, 用户名
*   `pass`：String, 密码
*   `timeout`Number, 发布上传超市时间，默认：50000
*   `localPath`: String, 上传的本地目录，默认：项目编译后的目录（支持 glob）
*   `remotePath`: String, 远程服务器目录
*   `filters`: Array, 发布上传中需要过滤的文件（支持 glob）
*   `type`：String, 部署方式（"full"全量；"increment"增量），默认：full
*   `onUploadedComplete`: Function, 发布完成事件回调
*   `onUploadedFileSuccess`: Function, 文件发布成功事件回调
*   `onUploadedFileError`: Function, 文件发布失败事件回调
*   `backup`: String | Object | Array, 发布之前进行备份 [options](https://github.com/RodeyManager/gupack/blob/master/doc/gupack-config.html)

更多认证参数请参考 [ssh2](https://github.com/mscdex/ssh2)

## [gupack-config.js](https://github.com/RodeyManager/gupack/blob/master/doc/gupack-config.js) 文件配置实例

#License
[MIT License](https://en.wikipedia.org/wiki/MIT_License)
