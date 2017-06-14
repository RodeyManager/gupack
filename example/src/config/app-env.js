/**
 * Created by Rodey on 2017/6/14.
 */

const
    fs = require('fs'),
    path = require('path');

const
    argv = process.argv.slice(2),
    _ei = argv.indexOf('-e') > -1 ? argv.indexOf('-e') : argv.indexOf('--env') > -1 ? argv.indexOf('--env') : -2,
    _di = argv.indexOf('-d') > -1 ? argv.indexOf('-d') : argv.indexOf('--dest') > -1 ? argv.indexOf('--dest') : -2,

    // 当前编译环境: local: 本地开发环境(mock data); dev: 开发环境(默认); stg: 测试环境; prd: 生成环境
    env = argv[_ei + 1] || 'local',
    configPath = path.resolve(__dirname, 'config-' + env + '.js');

module.exports = {
    argv: argv,
    name: env,
    argvIndex: _ei,
    isLocal: env === 'local',
    isDev: env === 'dev',
    isStg: env === 'stg',
    isProduction: env === 'prd',
    isIf: env === 'stg' || env === 'prd',
    configPath: configPath,
    config: require(configPath),
    configCode: fs.readFileSync(configPath, 'utf8'),
    // 项目编译后的路径
    dest: {
        name: env,
        argvIndex: _di,
        path: path.resolve(__dirname, '../', argv[_di + 1] || '../build')
    }
};


