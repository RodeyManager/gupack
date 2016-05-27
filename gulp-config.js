
var config = {
    //执行任务前，需要进行清理的
    clean: ['{{build}}*.html', '{{build}}assets/**', '{{build}}module/**'],
    //任务列表
    task: [
        'build.css'
        //'build.sass',
        //'build.module',
        //'build.config',
        //'build.libs',
        //'build.html',
        //'build.assets'
    ],
    //当前编译环境: stg: 测试环境(默认); int: 开发环境; prd: 生成环境
    env: 'std',
    //源文件路径, 默认为 src
    source: 'src',
    //编译产出路径, 默认为 build
    build: 'build',
    //静态资源版本控制号
    vQueryKey: '_cmbx_',
    //对应task中的任务
    builds: {
        //---说明：单个任务配置, {{source}}为源文件路径; {{build}}为编译产出路径
        'build.css': {
            //更新cache时对象资源的查找路径
            recache: { base: '{{source}}assets' },
            srcPrefix: '{{source}}assets/css/',
            src: [
                'reset.css',
                'app.css',
                'public.css',
                'animate.css',
                'fonts.css',
                'media.css'
            ],
            loader: {
                'gulp-concat': 'app.css'
            },
            //额外的插件样式，如果不是每个页面都用到，不建议合并到主样式文件中
            //可以单独在使用到的页面中引用
            plugins: [/*'{{source}}assets/js/plugins/tipDialog/css/xlongyu.css'*/],
            out: { dir: '{{build}}assets/css', filename: 'app.min.css' }
        },
        'build.sass': {
            //更新cache时对象资源的查找路径
            recache: { base: '{{source}}assets' },
            srcPrefix: '{{source}}assets/css/sass/',
            src: [
                'main.scss',
                'index.scss'
            ],
            //额外的插件样式，如果不是每个页面都用到，不建议合并到主样式文件中
            //可以单独在使用到的页面中引用
            plugins: [],
            out: { dir: '{{build}}assets/css', filename: 'app.min.css' }
        },
        'build.module': {
            src: ['{{source}}module/**/*'],
            //过滤调不进行编译的文件或则目录，前面加 !
            filters: [
                '!{{source}}module/model.js',
                '!{{source}}module/view.js',
                '!{{source}}module/main.js'
            ],
            //选择需要进行压缩的脚本
            compressList: [
                //'{{source}}module/model.js',
                //'{{source}}module/view.js'
            ],
            //忽略掉不进行压缩的文件, 不如里面的 html、css等非js文件则不进行js压缩，
            ignore: ['{{source}}module/**/*.html'],
            out: { dir: '{{build}}module' }
        },
        'build.html': {
            src: ['{{source}}views/**/*.html'],
            filters: [],
            out: {dir: '{{build}}'},
            //是否压缩html文件
            htmlminify: false,
            //是否将link样式改成style标签映入
            cssInline: true,
            //是否将script引入外部脚本插入页面中
            jsInline: true,
            //是否开发页面之间引入
            htmlInclude: true
        },

        'build.config': {
            src: [
                '{{source}}module/config.js',
                '{{source}}module/model.js',
                '{{source}}module/view.js'
            ],
            out: {dir: '{{build}}module', fileName: 'main.js'},
            //指定是否压缩（测试环境 false）
            compress: false
        },
        'build.libs': {
            src: [
                '{{source}}assets/js/jquery/jquery.min.js',
                '{{source}}assets/js/SYST/SYST.min.js'
            ],
            out: { dir: '{{build}}module', fileName: 'libs.js' },
            //指定是否压缩（测试环境 false）
            compress: true
        },
        'build.plugins': {
            src: [],
            out: { dir: '{{build}}module', fileName: 'plugins.js' },
            //指定是否压缩（测试环境 false）
            compress: true
        },
        'build.assets': {
            src: [
                '{{source}}assets/**'
            ],
            filters: [
                '!{{source}}assets/layout/**/*',
                '!{{source}}assets/components/**/*',
                '!{{source}}assets/css/**/*'
            ],
            out: { dir: '{{build}}assets' }
        }

    },
    //监听
    watch: {
        'build.css': '{{source}}assets/css/**/*',
        'build.sass': '{{source}}assets/css/sass/**/*',
        'build.html': [
            '{{source}}views/**/*.html',
            '{{source}}assets/layout/**/*.html',
            '{{source}}assets/components/**/*'
        ],
        'build.module': [
            '{{source}}module/**/*'
        ],
        'build.assets': '{{source}}assets/**/*',
        'build.config': [
            '{{source}}module/config.js',
            '{{source}}module/model.js',
            '{{source}}module/view.js'
        ],
        'build.libs': [
            '{{source}}assets/js/jquery/**/*',
            '{{source}}assets/js/easyui/**/*',
            '{{source}}assets/js/SYST/**/*'
        ],
        'build.plugins': []
    }
};


//导出模块
module.exports = config;
