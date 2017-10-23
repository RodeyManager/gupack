/**
 * Created by r9luox on 2016/8/23.
 * 获取用户配置信息
 */
'use strict';

const config = require('../serconf'),
      T      = require('../tools');

module.exports = () => {
    let gupackConfig;
    gupackConfig = T.getConfig() || {};
    gupackConfig['host'] = T.argv['host'] || gupackConfig['host'] || config.servers.host;
    gupackConfig['port'] = T.argv['port'] || gupackConfig['port'] || config.servers.port;
    gupackConfig['sport'] = T.argv['sport'] || gupackConfig['sport'] || config.servers.sport;
    gupackConfig['liveDelay'] = T.argv['liveDelay'] || gupackConfig['liveDelay'] || config.servers.liveDelay;
    gupackConfig['indexFile'] = gupackConfig['indexFile'] || config.indexFile.file;
    return gupackConfig;
};
