const
    path = require('path'),
    env = require('./default_env');

const
    vQueryKey = '_rvc_',
    hashSize = 10;

module.exports = {
    env: 'local',
    sourceDir: env.source.path,
    buildDir: env.dest.path,
    buildTasks: {
        'build.css': {
            src: [
                'assets/css/reset.css',
                'assets/css/**/*'
            ],
            dest: 'assets/css',
            rely: ['build.assets'],
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
        'build.modules': {
            src: 'modules/**/*',
            dest: 'modules',
            loader: jsLoaders()
        },
        'build.views': {
            src: ['views/**/*.html'],
            rely: [ 'build.css'],
            dest: 'views',
            loader: htmlLoaders(),
            watch: [
                'views/**/*',
                'components/**/*',
                'templates/**/*'
            ]
        },
    }
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