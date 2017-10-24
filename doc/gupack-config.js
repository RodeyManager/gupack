'use strict';

const
    env = require('./config/app-env'),
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
    // 每次执行编译之前是否清理当前编译目录
    startClean: true,
    port: 3000,
    sport: 10030,
    // task任务列表
    buildTasks: {
        // ---说明：单个任务配置
        'build.css': {
            // 源文件
            src: [
                'assets/css/app.scss',
                'assets/css/components/**/*'
            ],
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
            src: [
                '../node_modules/axios/dist/axios.min.js',
                '../node_modules/react/umd/react.production.min.js',
                '../node_modules/react-dom/umd/react-dom.production.min.js'
            ],
            dest: 'assets/js',
            loader: Object.assign({
                'gulp-concat': 'libs.js'
            }, jsLoaders())
        },

        'build.assets': {
            src: 'assets/{fonts,images,js,libs}/**/*',
            filters: [
                'assets/js/libs.js'
            ],
            dest: 'assets',
            loader: jsLoaders()
        },

        'build.modules.views': {
            src: 'modules/**/*View.js',
            dest: 'modules',
            rely: [ 'build.css' ],
            loader: {
                'gulp-webpack-multi-entry': webpackConfig
            }
        },

        'build.views': {
            src: ['views/**/*.html'],
            filters: [],
            rely: [
                'build.css',
                'build.lib.js',
                'build.modules.views'
            ],
            dest: 'views',
            loader: htmlLoaders(),
            watch: ['../src/**/*']
        }

    },
    // 发布配置
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
            remotePath: '/var/www/moon'
        }
    ]

};

function cssLoaders(fileName){
    return {
        'gulp-sass': null,
        'gulp-merge-css': {fileName: fileName},
        'gulp-recache': recache(env.dest.path + '/assets'),
        'gulp-autoprefixer': {
            browsers: ['> 5%', 'IE > 8', 'last 2 versions']
        },
        'gulp-uglifycss': {_if: env.isProduction}
    }
}

function jsLoaders(){
    return {
        'gulp-jsminer': {
            _if: false, preserveComments: '!'
        }
    }
}

function htmlLoaders(){
    return {
        'gulp-tag-include': {compress: env.isProduction},
        'gulp-recache': recache(env.dest.path)
    }
}

function recache(path){
    return {
        _if: env.isIf,
        queryKey: '_rvc_',
        // hash值长度
        hashSize: 10,
        // 控制字节大小以内的图片转base64,
        toBase64Limit: 1000,
        basePath: path
    }
}