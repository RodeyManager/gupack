/**
 * Created by Rodey on 2017/6/30.
 */
'use strict';

const
    gulp   = require('gulp');

const create = require('./bin/create');
const task = require('./bin/task').task;
const start = require('./bin/task').start;
const publish = require('./bin/task').publish;
const remove = require('./bin/add').remove;
const version = require('./bin/version').displayVersion;
const versions = require('./bin/version').displayDescVersion;
const Gupack = require('./lib/config/gupack');
module.exports = { create, task, start, publish, remove, version, versions, Gupack, instance: Gupack };
// module.exports.Gupack = function(config){
//     let gp = new Gupack(config, gulp);
//     gp.run();
// };


