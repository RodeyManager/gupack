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
    // 源文件路径, 默认为 src
    source: 'src',
    // 编译产出路径，可以是绝对或者相对路径，默认为 build
    build: 'build',
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
            loader: util._extend({
                'gulp-merge-css': 'app.min.css'
            }, cssLoaders()),
            // 监听变化（文件改变执行该任务）
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

        'build.views': {
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
            browsers: ['> 5%', 'IE > 8', 'last 2 versions']
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
