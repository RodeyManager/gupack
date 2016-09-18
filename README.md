
    <link rel="stylesheet" href="doc/assets/js/highlight/css/monokai-sublime.min.css"/>
    <link rel="stylesheet" href="doc/assets/css/main.css"/>
    <header class="header">
        <p>
            <a href="#"><img src="doc/assets/images/gupack-128.png" class="logo" alt="gupack"/></a>
            <a href="#">Gupack 基于gulp的前端自动化构建工具</a>
        </p>
    </header>
    <section class="wrap">
        <div class="options" id="params">
            <h3>命令使用参数</h3>
            <p><strong>使用帮助查看命令：gupack --help</strong></p>
            <p>-v, --version, 查看当前版本号</p>
            <p>-p, --project, 指定当前编译的项目</p>
            <p>-i, --info, 项目配置信息</p>
            <p>-d, --buildpath, 指定编译后的输出路径</p>
            <p>-e, --env, 设置环境</p>
            <p>--host, 服务器主机</p>
            <p>--port, 服务器端口</p>
            <p>--liveDelay, 页面延迟更新时间（开发调式实时更新）</p>
            <p>--server-path, 项目目录（启动服务器开发路径，编译后的目录）</p>
            <p>-$, --terminal, 指定项目运行的终端平台，pc将使用jQuery；mobile将使用Zepto</p>
        </div>
        <div class="options" id="command">
            <h3>命令</h3>
            <p><a href="#create">create</a>, 创建一个项目; EXP: gupack create mall</p>
            <p><a href="#add">add</a>, 添加项目; EXP: gupack add mall D:\\Sites\\mall</p>
            <p><a href="#build">build</a>, 编译项目; EXP: gupack build mall</p>
            <p><a href="#start">start</a>, 启动Node服务器; EXP: gupack start mall</p>
            <p><a href="#restart">restart</a>, 重启Node服务器; EXP: gupack restart mall</p>
            <p><a href="#publish">publish</a>, 编译并发布项目; EXP: gupack publish mall</p>
            <p><a href="#remove">remove</a>, 移除项目; EXP: gupack remove mall</p>
            <p><a href="#delete">delete</a>, 移除项目，并删除本地磁盘目录; EXP: gupack delete mall</p>
            <p><a href="#list">list</a>, 查看所有项目; EXP: gupack list</p>
            <p><a href="#info">info</a>, 查看所有项目; EXP: gupack info</p>
            <p><a href="#install">install</a>, 安装gulp插件; EXP: gupack install gulp-rename</p>
            <p><a href="#uninstall">uninstall</a>, 卸载gulp插件; EXP: gupack uninstall gulp-rename</p>
            <p><a href="#update">update</a>, 更新gulp插件; EXP: gupack update gulp-rename</p>
            <p><a href="#alias">alias</a>, 设置命令别名 EXP: gupack alias gp</p>
            <p><a href="#config">config</a>,
                获取配置或设置配置; EXP: gupack config [projectName] --path D:/Sites/lop --host 127.0.0.1 --port 8080
                查看可配置的config选项：<a href="#config-options">Config Options</a>
            </p>
        </div>
        <div class="main">
            <h3>使用说明</h3>
            <div class="code" id="create">
                <p>create【创建项目】<a href="#command" class="return">∧</a></p>
                <pre><code>
                    gupack create mall
                </code></pre>
            </div>
            <div class="code" id="add">
                <p>add【添加项目】将项目添加到gupack项目列表中<a href="#command" class="return">∧</a></p>
                <pre><code>
                    gupack add mall D:\\Sites\\mall
                    //提示: 项目名称: (mall)
                    //提示：项目路径: D:\\Sites\\mall
                </code></pre>
            </div>
            <div class="code" id="build">
                <p>build【编译项目】对项目进行编译<a href="#command" class="return">∧</a></p>
                <pre><code>
                    gupack build mall
                    //或者定位到项目下，执行 gupack build
                </code></pre>
                <p class="rexp">编译项目可带命令参数，请查看<a href="#params">命令参数</a></p>
            </div>
            <div class="code" id="start">
                <p>start【启动项目】运行gupack自带的静态文件服务器，便于本地调式项目（包括浏览器实时更新功能）<a href="#command" class="return">∧</a></p>
                <pre><code>
                    gupack start mall
                    //或者定位到项目下，执行 gupack start
                </code></pre>
                <p class="rexp">编译项目可带命令参数，请查看<a href="#params">命令参数</a></p>
            </div>
            <div class="code" id="restart">
                <p>restart【重启服务】<a href="#command" class="return">∧</a></p>
                <pre><code>
                    gupack restart mall
                    //或者定位到项目下，执行 gupack restart
                </code></pre>
            </div>
            <div class="code" id="publish">
                <p>publish【发布项目】<a href="#command" class="return">∧</a></p>
                <pre><code>
                    gupack publish mall
                    //或者定位到项目下，执行 gupack publish
                </code></pre>
                <p class="rexp">如果在gupack-config.js中配置了hostname选项，则publish后，项目中的所有连接地址都会加上hostname地址</p>
            </div>
            <div class="code" id="remove">
                <p>remove【移除项目】<a href="#command" class="return">∧</a></p>
                <pre><code>
                    gupack remove mall
                    //或者定位到项目下，执行 gupack remove
                </code></pre>
                <p class="rexp">从gupack项目列表中移除（不会删除硬盘文件）</p>
            </div>
            <div class="code" id="delete">
                <p>delete【删除项目】<a href="#command" class="return">∧</a></p>
                <pre><code>
                    gupack delete mall
                    //或者定位到项目下，执行 gupack delete
                </code></pre>
                <p class="rexp">从gupack项目列表中删除（同时删除硬盘文件）</p>
            </div>
            <div class="code" id="list">
                <p>list【查看项目列表】<a href="#command" class="return">∧</a></p>
                <pre><code>
                    gupack list
                </code></pre>
                <p class="rexp">列出gupack所有项目</p>
            </div>
            <div class="code" id="install">
                <p>install【安装gulp插件】<a href="#command" class="return">∧</a></p>
                <pre><code>
                    gupack install gulp-rename
                    //任何位置执行
                </code></pre>
                <p class="rexp">安装gulp插件（由于gupack基于gulp插件运行）</p>
            </div>
            <div class="code" id="uninstall">
                <p>uninstall【卸载gulp插件】<a href="#command" class="return">∧</a></p>
                <pre><code>
                    gupack uninstall gulp-rename
                    //任何位置执行
                </code></pre>
                <p class="rexp">卸载gulp插件（由于gupack基于gulp插件运行）</p>
            </div>
            <div class="code" id="update">
                <p>update【更新gulp插件】<a href="#command" class="return">∧</a></p>
                <pre><code>
                    gupack update gulp-rename
                    //任何位置执行
                </code></pre>
                <p class="rexp">更新gulp插件（由于gupack基于gulp插件运行）</p>
            </div>
            <div class="code" id="alias">
                <p>alias【为gupack命令创建别名】<a href="#command" class="return">∧</a></p>
                <pre><code>
                    gupack alias gp
                    //任何位置执行
                    gp create mall
                </code></pre>
                <p class="rexp">创建成功后，将可以以别名的方式运行gupack命令</p>
            </div>
            <div class="code" id="config">
                <p>config【查看或设置项目配置项】<a href="#command" class="return">∧</a></p>
                <pre><code>
                    //查看项目服务端口
                    gupack config tmall --port
                    //设置项目服务端口
                    gupack config tmall --port 3350
                </code></pre>
                <div class="rexp">
                    <strong>配置项</strong>
                    <ul id="config-options">
                        <li>config： gupack-config文件相对（相对path）路径，<a href="gupack-config.html">gupack-config文件配置说明</a></li>
                        <li>path： 项目绝对路径</li>
                        <li>host： Node本地服务器地址</li>
                        <li>port： Node本地服务器端口</li>
                        <li>liveDelay： 浏览器实时更新延迟时间</li>
                    </ul>
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
