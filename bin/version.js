/**
 * Created by Rodey on 2016/9/22.
 * Get Version
 */

const
    T  = require('../lib/tools'),
    packages = require('../package.json');

module.exports.displayVersion = () => {
    T.log.green('Gupack => ' + packages.version);
};