/**
 * Created by Rodey on 2017/6/29.
 */
'use strict';

const T = require('../tools'),
  util = require('../utils');

class TaskNodeFun {
  /**
   * 任务
   * @param config  任务配置
   * @param gupack  Gupack对象
   */
  constructor(fun, gupack) {
    this.name = undefined;
    this.fun = fun;
    this.src = '';
    this.filters = '';
    this.plugins = [];
    this.watch = [];
    this.run = true;
    this.noWatch = false;
    this.dest = null;
    this.loader = {};
    this.base = T.getArg('cwdir') || process.cwd();
    this.gupack = undefined;
    this.pluginCache = {};
    this.merge = false;

    if (gupack) {
      this.gupack = gupack;
      this.gulp = this.gupack.gulp;
      this.basePath = this.gupack.basePath;
      this.sourceDir = this.gupack.sourceDir;
      this.buildDir = this.gupack.buildDir;
    }

    // this.init();
  }

  init(cb) {
    // util.isFunction(this.fun) && this.fun();
  }

  getTaskFunction(name, cb, options = {}) {
    return Promise.resolve(this.fun(cb));
  }
}

module.exports = TaskNodeFun;
