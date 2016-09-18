
    <link rel="stylesheet" href="doc/assets/js/highlight/css/monokai-sublime.min.css"/>
    <link rel="stylesheet" href="doc/assets/css/main.css"/>
    <header class="header">

            [![gupack](doc/assets/images/gupack-128.png)](#)
            [Gupack 基于gulp的前端自动化构建工具](#)
    </header>
    <section class="wrap">
        <div class="options" id="params">

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

        </div>
        <div class="options" id="command">

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
                查看可配置的config选项：[Config Options](#config-options)

        </div>
        <div class="main">

### 使用说明

            <div class="code" id="create">

create【创建项目】[∧](#command)

                        gupack create mall
                    `</pre>
                </div>
                <div class="code" id="add">

    add【添加项目】将项目添加到gupack项目列表中[∧](#command)

                    <pre>`
                        gupack add mall D:\\Sites\\mall
                        //提示: 项目名称: (mall)
                        //提示：项目路径: D:\\Sites\\mall
                    `</pre>
                </div>
                <div class="code" id="build">

    build【编译项目】对项目进行编译[∧](#command)

                    <pre>`
                        gupack build mall
                        //或者定位到项目下，执行 gupack build
                    `</pre>

    编译项目可带命令参数，请查看[命令参数](#params)

                </div>
                <div class="code" id="start">

    start【启动项目】运行gupack自带的静态文件服务器，便于本地调式项目（包括浏览器实时更新功能）[∧](#command)

                    <pre>`
                        gupack start mall
                        //或者定位到项目下，执行 gupack start
                    `</pre>

    编译项目可带命令参数，请查看[命令参数](#params)

                </div>
                <div class="code" id="restart">

    restart【重启服务】[∧](#command)

                    <pre>`
                        gupack restart mall
                        //或者定位到项目下，执行 gupack restart
                    `</pre>
                </div>
                <div class="code" id="publish">

    publish【发布项目】[∧](#command)

                    <pre>`
                        gupack publish mall
                        //或者定位到项目下，执行 gupack publish
                    `</pre>

    如果在gupack-config.js中配置了hostname选项，则publish后，项目中的所有连接地址都会加上hostname地址

                </div>
                <div class="code" id="remove">

    remove【移除项目】[∧](#command)

                    <pre>`
                        gupack remove mall
                        //或者定位到项目下，执行 gupack remove
                    `</pre>

    从gupack项目列表中移除（不会删除硬盘文件）

                </div>
                <div class="code" id="delete">

    delete【删除项目】[∧](#command)

                    <pre>`
                        gupack delete mall
                        //或者定位到项目下，执行 gupack delete
                    `</pre>

    从gupack项目列表中删除（同时删除硬盘文件）

                </div>
                <div class="code" id="list">

    list【查看项目列表】[∧](#command)

                    <pre>`
                        gupack list
                    `</pre>

    列出gupack所有项目

                </div>
                <div class="code" id="install">

    install【安装gulp插件】[∧](#command)

                    <pre>`
                        gupack install gulp-rename
                        //任何位置执行
                    `</pre>

    安装gulp插件（由于gupack基于gulp插件运行）

                </div>
                <div class="code" id="uninstall">

    uninstall【卸载gulp插件】[∧](#command)

                    <pre>`
                        gupack uninstall gulp-rename
                        //任何位置执行
                    `</pre>

    卸载gulp插件（由于gupack基于gulp插件运行）

                </div>
                <div class="code" id="update">

    update【更新gulp插件】[∧](#command)

                    <pre>`
                        gupack update gulp-rename
                        //任何位置执行
                    `</pre>

    更新gulp插件（由于gupack基于gulp插件运行）

                </div>
                <div class="code" id="alias">

    alias【为gupack命令创建别名】[∧](#command)

                    <pre>`
                        gupack alias gp
                        //任何位置执行
                        gp create mall
                    `</pre>

    创建成功后，将可以以别名的方式运行gupack命令

                </div>
                <div class="code" id="config">

    config【查看或设置项目配置项】[∧](#command)

                    <pre>`
                        //查看项目服务端口
                        gupack config tmall --port
                        //设置项目服务端口
                        gupack config tmall --port 3350

                <div class="rexp">
                    **配置项**

*   config： gupack-config文件相对（相对path）路径，[gupack-config文件配置说明](gupack-config.html)
*   path： 项目绝对路径
*   host： Node本地服务器地址
*   port： Node本地服务器端口
*   liveDelay： 浏览器实时更新延迟时间
                </div>
            </div>
        </div>
    </section>
    <footer class="footer"></footer>
    <script src="doc/assets/js/jquery.min.js"></script>
    <script src="doc/assets/js/highlight/highlight.min.js"></script>
    <script>
        $(function(){
            $('pre code').each(function(i, block){
                hljs.highlightBlock(block);
            });
            $('.code>p').mouseover(function(){
               $(this).find('a').show();
            }).mouseout(function(){
                $(this).find('a').hide();
            });
        });
    </script>



#License
[MIT License](https://en.wikipedia.org/wiki/MIT_License)