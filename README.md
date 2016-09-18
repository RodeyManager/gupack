![gupack](doc/assets/images/gupack-128.png)

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

[config](#config), 获取配置或设置配置; EXP: gupack config [projectName] --path D:/Sites/lop --host 127.0.0.1 --port 8080 查看可配置的config选项：[Config Options](#config-options)
