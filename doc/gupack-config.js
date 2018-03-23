'use strict';

const env = require('./config/app-env'),
    webpackConfig = require('./config/webpack.config')(env);

//导出模块
module.exports = {
    env: env.name,
    // 源文件路径, 默认为 src
    sourceDir: env.source.path,
    // 编译产出路径，可以是绝对或者相对路径，默认为 build
    buildDir: env.dest.path,
    // 默认启动页面地址
    indexFile: 'views/index.html',
    // 每次执行编译之前是否清理当前编译目录, 默认true
    // startClean: true,
    // 开启开发静态调式服务器的端口, 默认3200
    // port: 3100,
    // 更热新websocket端口
    // sport: 10030,
    // task任务列表
    buildTasks: {
        // ---说明：单个任务配置
        'build.css': {
            // 源文件
            src: ['assets/css/app.scss', 'assets/css/components/**/*'],
            // 输出路径
            dest: 'assets/css',
            // 依赖task列表
            rely: ['build.assets'],
            // gulp插件
            loader: cssLoaders('app.min.css'),
            // 监听变化（文件改变执行该任务）
            watch: ['assets/css/**/*']
        },

        'build.lib.js': {
            src: ['../node_modules/axios/dist/axios.min.js', '../node_modules/react/umd/react.production.min.js', '../node_modules/react-dom/umd/react-dom.production.min.js'],
            dest: 'assets/js',
            loader: Object.assign(
                {
                    'gulp-concat': 'libs.js'
                },
                jsLoaders()
            )
        },

        'build.assets': {
            src: 'assets/{fonts,images,js,libs}/**/*',
            filters: ['assets/js/libs.js'],
            dest: 'assets',
            loader: jsLoaders()
        },

        'build.modules.views': {
            src: 'modules/**/*View.js',
            dest: 'modules',
            rely: ['build.css'],
            loader: {
                'gulp-webpack-multi-entry': webpackConfig
            }
        },

        'build.views': {
            src: ['views/**/*.html'],
            filters: [],
            rely: ['build.css', 'build.lib.js', 'build.modules.views'],
            dest: 'views',
            loader: htmlLoaders(),
            watch: ['../src/**/*']
        }
    },
    // 发布配置, 支持多节点
    deploy: [
        {
            isExecute: false,
            host: '192.168.1.1',
            user: 'root',
            pass: 'root123',
            port: 22,
            timeout: 50000,
            // localPath: path.join(env.dest.path, '/**/*'),
            // filters: [],
            remotePath: '/var/www/moon',
            // @String 部署方式 全量：full(默认)；增量：increment
            type: 'increment',
            // 发布之前进行备份 [String | Object<推荐> | Array]
            // 如果为String，则代表备份文件输出路径 outPath
            // 如果为Array, 则应遵循规则 [outPath, name, mode, log, isExecute]
            backup: {
                // 备份输出路径(输入路径为remotePath)
                outPath: path.resolve(env.dest.path, '../backs'),
                // 备份文件名称 (默认使用当前日期时间为尾，例：VUE_SPA-2018-03-16_201010)
                // date format (yyyy-mm-dd_HH:MM:ss) https://www.npmjs.com/package/dateformat#mask-options
                name: 'VUE_SPA-',
                // 备份模式： String
                // remote (远程备份，将备份文件存在远程服务器上，需要有server shell的执行权限 [ zip, unzip, cd ])
                // local (默认，本地备份，将备份到本地，直接将服务器目录拉取到本地)
                mode: 'local',
                // 控制台打印方式 String
                // all (默认，打印详细信息，列出所有备份文件列表)
                // progress (简单进度)
                log: 'all',
                // 是否执行备份操作, 默认false
                isExecute: false
            }
        }
    ]
};

function cssLoaders(fileName) {
    return {
        'gulp-sass': null,
        'gulp-merge-css': { fileName: fileName },
        'gulp-recache': recache(env.dest.path + '/assets'),
        'gulp-autoprefixer': {
            browsers: ['> 5%', 'IE > 8', 'last 2 versions']
        },
        'gulp-uglifycss': { _if: env.isProduction }
    };
}

function jsLoaders() {
    return {
        'gulp-jsminer': {
            _if: false,
            preserveComments: '!'
        }
    };
}

function htmlLoaders() {
    return {
        'gulp-tag-include': { compress: env.isProduction },
        'gulp-recache': recache(env.dest.path)
    };
}

function recache(path) {
    return {
        _if: env.isIf,
        queryKey: '_rvc_',
        // hash值长度
        hashSize: 10,
        // 控制字节大小以内的图片转base64,
        toBase64Limit: 1000,
        basePath: path
    };
}
