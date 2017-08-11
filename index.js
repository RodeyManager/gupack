/**
 * Created by Rodey on 2017/6/30.
 */
'use strict';

const
    gulp   = require('gulp'),
    Gupack = require('./lib/config/gupack');

module.exports = function(config){
    let gp = new Gupack(config, gulp);
    gp.run();
};
