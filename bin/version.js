/**
 * Created by Rodey on 2016/9/22.
 * Get Version
 */
'use strict';

const
    T  = require('../lib/tools'),
    packages = require('../package.json');

module.exports.displayVersion = () => {
    T.log.green('Gupack => ' + packages.version);
};

module.exports.displayDescVersion = () => {
    T.log.green('Gupack => ' + packages.version);
    T.log.green('NodeJS => ' + packages.engines.nodejs);
    T.log.green('NPM => ' + packages.engines.npm);
};