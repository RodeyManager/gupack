/**
 * Created by r9luox on 2016/8/23.
 * 获取用户配置信息
 */
const url = require('url');
const config = require('./serconf');
const tools = require('./tools');
const projectList = require('../projects').projectList;

module.exports = (projectName) => {
    var gupackConfig = require(tools.Path.resolve(projectList[projectName]['path'], projectList[projectName]['config']));
    gupackConfig['host'] = tools.argv['host'] || gupackConfig['host'] || projectList[projectName]['host'] || config.servers.host;
    gupackConfig['port'] = tools.argv['port'] || gupackConfig['port'] || projectList[projectName]['port'] || config.servers.port;
    gupackConfig['sport'] = tools.argv['sport'] || gupackConfig['spost'] || projectList[projectName]['sport'] || config.servers.sport;
    gupackConfig['liveDelay'] = gupackConfig['liveDelay'] || projectList[projectName]['liveDelay'] || 2000;
    return gupackConfig;
};
