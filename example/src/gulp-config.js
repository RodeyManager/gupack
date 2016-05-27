
var path = require('path');

var env = 'std';
//静态资源版本控制号
var vQueryKey = '_cmbx_';

var config = {
    //执行任务前，需要进行清理的,如果不配置，则将以编译目录下的所有文件
    //clean: ['**/*.html', 'assets/**', 'module/**'],
    //需要执行的任务列表
    task: [
        //'build.css',
        //'build.modules',
        //'build.main',
        //'build.libs',
        ////'build.html',
        //'build.assets'
    ],
    //当前编译环境: stg: 测试环境(默认); int: 开发环境; prd: 生成环境
    env: env,
    //源文件路径, 默认为 src
    source: 'src',
    //编译产出路径, 默认为 build
    build: 'build',
    //对应task中的任务
    builds: {
        //---说明：单个任务配置
        'build.css': {
            pathPrefix: 'assets/css',
            src: [
                'reset.css',
                'app.css',
                'public.css',
                'animate.css',
                'fonts.css',
                'media.css',
                'index.scss'
            ],
            //额外的插件样式，如果不是每个页面都用到，不建议合并到主样式文件中
            //可以单独在使用到的页面中引用
            plugins: ['assets/js/plugins/tipDialog/css/xlongyu.css'],
            dest: 'assets/css',
            loader: {
                'gulp-sass': { outputStyle: 'compressed' },
                'gulp-recache': { queryKey: vQueryKey, hashSize: 10 },
                'gulp-autoprefixer': {
                    browsers: ['> 5%', 'IE 9'],
                    cascade: false
                },
                'gulp-uglifycss': { "_if": env === 'prd' },
                'gulp-concat-css': 'app.min.css'
            },
            watch: ['assets/css/**/*']
        },

        'build.modules': {
            pathPrefix: 'modules/',
            src: ['**/*'],
            //过滤掉不进行编译的文件或目录
            filters: [
                'model.js',
                'view.js',
                'config.js',
                'main.js'
            ],
            dest: 'modules',
            loader: {},
            watch: [ 'modules/**/*']
        },
        //'build.html': {
        //    src: ['{{source}}views/**/*.html'],
        //    filters: [],
        //    out: {dir: '{{build}}'},
        //    //是否压缩html文件
        //    htmlminify: false,
        //    //是否将link样式改成style标签映入
        //    cssInline: true,
        //    //是否将script引入外部脚本插入页面中
        //    jsInline: true,
        //    //是否开发页面之间引入
        //    htmlInclude: true
        //},

        'build.main': {
            src: [
                'modules/config.js',
                'modules/model.js',
                'modules/view.js'
            ],
            dest: 'modules',
            loader: {
                'gulp-concat': 'main.js',
                'gulp-uglify': { _if: (true || env === 'prd'), preserveComments: '!' }
            }
        },
        'build.libs': {
            pathPrefix: 'assets/js',
            src: [
                '{{@_$_}}/{{@_$_}}.js',
                'SYST/SYST.min.js'
            ],
            dest: 'assets/js',
            loader: {
                'gulp-concat': 'libs.js',
                'gulp-uglify': { _if: (true || env === 'prd'), preserveComments: '!' }
            }
        },

        'build.fonts': {
            src: 'assets/fonts/*',
            dest: 'assets/fonts'
        },

        'build.images': {
            src: 'assets/images/**/*',
            dest: 'assets/images'
        },

        'build.js': {
            src: 'assets/js/**/*',
            filters: [
                'assets/js/?({{@_$_}}|SYST)/**/*'
            ],
            dest: 'assets/js'
        }

    }
};


//导出模块
module.exports = config;
