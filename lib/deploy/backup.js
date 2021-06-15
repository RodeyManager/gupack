/**
 * Created by Rodey on 2018/3/15.
 * 运程备份操作
 */
'use strict';

const util = require('../utils'),
  extend = require('extend'),
  SSH2 = require('ssh2').Client,
  EventEmitter = require('events').EventEmitter,
  LoadingORA = require('../loadProgress').LoadingORA,
  dateFormat = require('dateformat'),
  inquirer = require('inquirer'),
  Downloader = require('./downloader'),
  os = require('os'),
  T = require('../tools');

const prompt = inquirer.createPromptModule();

class Backup extends EventEmitter {
  constructor(deploy) {
    super();

    this.deploy = deploy;

    this.ssh2 = null;
    this.sftp = null;

    this.outPath = null;
    this.zipPath = null;
    this.zipName = null;
    this.created = null;
    this.count = 0;
    // 是否即时备份 (每次部署前都备份) * Deprecated
    // 有时候我们测试环境并非每次部署都备份，或者开发环境需要将编译部署到另外的机器
    // 这时就可以开发单备份模式，或者通过指定编译环境进行设置
    this.loop = false;
    // 备份模式：
    // remote (默认，远程备份，将备份文件存在远程服务器上，需要有server shell的执行权限 [ zip, unzip, cd ])
    // local (默认，本地备份，将备份到本地，直接将服务器目录拉取到本地)
    this.mode = 'local';
    // 在项目根目录下存储备份列表，可用于rollback操作
    this.backupFile = T.Path.resolve(process.cwd(), 'backup.json');
    // 打印方式:
    // all (打印详细信息)
    // progress (默认，进度条方式)
    this.log = this.deploy.log || 'progress';
    // 进度条
    this.loadingORA = null;
    // 备份过滤列表
    this.filters = [];

    this.options = extend(true, (this.deploy && this.deploy.backup) || {});
    // 默认不执行备份
    this.isExecute = true;
    // 初始化是否执行
    this.initExecute();
    // 如果设置不执行，则不进行系列初始化
    this.options && this.isExecute && this.init();
    this.deploy && (this.auths = this.deploy._getConnectOptions());
    // 备注信息
    this.remark = T.getArg(['m', 'message']);
  }

  init() {
    // 初始化备份列表文件
    this.initStoreFile();
    // 初始化备份压缩包名和路径
    this.initZIP();
    // 初始化模式 (远程 or 本地)
    this.initMode();
    // 初始化打印方式 (详细信息 or 简单进度条)
    this.initLog();
    // 初始化备份过滤列表
    this.initFilters();
  }

  initExecute() {
    const options = this.options;
    if (!options) return (this.isExecute = false);
    if (util.isObject(options)) {
      this.isExecute = !!options['isExecute'];
    }
    if (util.isArray(options)) {
      this.isExecute = !!options[4];
    }
  }

  initStoreFile() {
    this.backupFile = T.Path.resolve(
      this.deploy ? this.deploy.basePath : process.cwd(),
      'backup.json'
    );
    const isExists = T.fs.existsSync(this.backupFile);
    !isExists && this._writeBackupJsonFile();
  }

  initZIP() {
    let outPath, name;

    // backup: <备份输出路径>
    if (util.isString(this.options)) {
      outPath = this.options;
    }
    // backup: { outPath: <备份输出路径>, name: <备份输出名称>, mode: <备份模式>, log: <显示方式> }
    if (util.isObject(this.options)) {
      outPath = this.options['outPath'];
      name = this.options['name'];
      'mode' in this.options && (this.mode = this.options['mode']);
      'log' in this.options && (this.log = this.options['log']);
    }
    // backup: [<备份输出路径>, <备份输出名称>]
    if (util.isArray(this.options)) {
      outPath = this.options[0];
      name = this.options[1];
      this.mode = this.options[2] || this.mode;
      this.log = this.options[3] || this.log;
    }

    name = (name || '').trim();

    // 如果没有设置name, 则已remotePath的最后目录为name
    if (!name) {
      name = this.deploy.remotePath.split(/\/|\\\\/).slice(-1)[0] + '-';
    }

    this.created = Date.now();
    const dateString = dateFormat(Date.now(), 'yyyy-mm-dd_HHMMss');

    if (/@time/g.test(name)) {
      name = name.replace('@time', dateString);
    } else {
      name = name + dateString;
    }

    // 备份名称中不能包含空格或特殊字符
    if (/[^\w_-]/.test(name)) {
      T.log.error(
        `× [${T.getTime()}] backup name field not has special characters or spaces can be included`
      );
    }

    this.outPath = outPath;
    this.zipName = name + (this.mode === 'remote' ? '.zip' : '');
    this.zipPath = T.Path.join(
      this.outPath || this.deploy.remotePath,
      this.zipName
    );
  }

  initMode() {
    this._isRemoteMode = this.mode === 'remote';
    this._isLocalMode = this.mode === 'local';
  }

  initLog() {
    this._isLogAll = this.log === 'all';
    this.loadingORA = new LoadingORA();
  }

  initFilters() {
    if (util.isObject(this.options)) {
      this.filters = this.options.filters || [];
    }
    if (util.isArray(this.options)) {
      this.filters = this.options[5] || [];
    }
  }

  // 清理备份
  removeBackup() {
    const name = T.getArg('name');
    const backlist = this.getBackups();
    let dates = Object.keys(backlist);
    dates = dates.filter((date) => {
      let backs = backlist[date];
      return util.isArray(backs) && backs.length > 0;
    });
    if (dates.length === 0) {
      T.log.error(`× 当前无备份列表`);
    }
    if (!name) {
      prompt([
        {
          type: 'list',
          name: 'date',
          message: `选择需要清除的备份版本所在的日期 (${dates.length}): `,
          choices: dates
        }
      ]).then((awn) => {
        // 显示当前日期下的备份列表
        this._showBacks(awn.date);
      });
    } else {
      this._removeBacks(name);
    }
  }

  _showBacks(date) {
    let backlist = this.getBackups();
    let backNames = backlist[date].map((back) => back.name);
    prompt([
      {
        type: 'checkbox',
        name: 'backs',
        message: `选择需要清除的备份版本 (支持多选): `,
        choices: backNames
      }
    ]).then((awn) => {
      // 显示当前日期下的备份列表
      backNames = awn.backs;
      backNames.length > 0 &&
        backNames.map((backName) => {
          this._removeBacks(backName);
        });
    });
  }

  _removeBacks(backName) {
    backName = backName || T.getArg('name');
    let backlist = this.getBackups();
    let backs, backup, date;

    const ms = backName.match(/(\d{4}-\d{1,2}-\d{1,2})/g);
    if (ms && ms.length > 0) {
      date = ms[0];
    } else {
      T.log.error(`× 未找到指定的备份`);
    }
    if (date) {
      backs = backlist[date];
      backup = backs.find((back) => back.name === backName);
    }

    if (backup) {
      if (backup.mode === 'local') {
        // 本地
        T.fs.existsSync(backup.path) && T.fsa.removeSync(backup.path);
      } else if (backup.mode === 'remote') {
        // 远程
      }

      // 更新backup.json
      const index = backs.indexOf(backup);
      backs.splice(index, 1);
      backlist[date] = backs;
      this._writeBackupJsonFile(JSON.stringify(backlist, null, 4));
      T.log.yellow(
        `√ [${backup.server.host}] backup '${backName}]' is remove done `
      );
      this.emit('remove_done', {
        backName,
        backup
      });
    }
  }

  start() {
    if (this._isLocalMode) {
      this._startLocalBackup();
    } else {
      this._startRemoteBackup();
    }
  }

  // 备份到本地
  _startLocalBackup() {
    // 判断本地目录是否存在
    if (/^\//.test(this.outPath)) {
      T.log.error(`× Mode is Local, the outPath is not found`);
    }

    !T.fs.existsSync(this.zipPath) && T.fsa.mkdirsSync(this.zipPath);
    const remotePath = this.deploy.remotePath;

    const downloader = new Downloader(
      remotePath,
      this.zipPath,
      this.auths,
      this.filters
    );
    downloader.on('start', ({ message }) => {
      T.log.gray(message);
    });
    downloader.on('before_download', ({ message }) => {
      T.log.yellow(this._startText());
      !this._isLogAll && this.loadingORA.start(this._startText());
    });
    downloader.on('file_downloaded', ({ message }) => {
      this._isLogAll
        ? T.log.green(message)
        : this.loadingORA.text(T.msg.green(message));
    });
    downloader.on('error', ({ message, directory }) => {
      message = `${this.auths.host} ${message}`;
      if (directory === remotePath) {
        this._isLogAll
          ? T.log.error(message)
          : this.loadingORA.text(T.msg.red(message));
      }
    });
    downloader.on('done', this._onDone.bind(this));
    downloader.start();
  }

  async _mkdirectory(dir, cb) {
    return new Promise((resolve, reject) => {
      this.sftp.mkdir(dir, (err) => {
        return resolve(err);
      });
    });
  }

  async _hasExists(dir, cb) {
    return new Promise((resolve, reject) => {
      this.sftp.exists(dir, async (stream) => {
        if (!stream) {
          const mkExists = await this._mkdirectory(dir);
          mkExists
            ? T.log.error(`× [${T.getTime()}] '${dir}' mkdir Failed`)
            : T.log.green(`√ [${T.getTime()}] '${dir}' mkdir Successfully`);
          return resolve(!!mkExists);
        }
        return resolve(!!stream);
      });
    });
  }

  _onReady() {
    this.ssh2.sftp((err, sftp) => {
      if (err) T.log.error(err.message);
      this.sftp = sftp;
      this._preBackup.call(this);
    });
  }

  async _preBackup() {
    // 检查备份输入路径
    const remotePath = await this._hasExists(this.deploy.remotePath);
    if (!remotePath) return process.exit();
    const zipPath = await this._hasExists(this.outPath);
    zipPath && this._backup.call(this);
  }

  // 远程服务器上备份
  _startRemoteBackup() {
    if (!this.ssh2) {
      this.ssh2 = new SSH2();
    }

    this.ssh2.on('ready', this._onReady.bind(this));
    this.ssh2.connect(this.auths);
  }

  _backup() {
    const host = this.deploy.host;
    const { password, privateKey } = this.auths;
    this.zipPath = this.zipPath.replace(/\\\\?/g, '/');
    const command = `cd ${this.deploy.remotePath} && zip -q -r ${this.zipPath} *`;

    let message = this._startText();
    T.log.yellow(message);

    if (password) {
      T.log.gray(`→ [${host}] Authenticating with password.`);
    } else if (privateKey) {
      T.log.gray(`→ [${host}] Authenticating with private key.`);
    }

    this.loadingORA.start(message);

    this.ssh2.exec(command, (err, stream) => {
      console.log('exec command', typeof stream);
      if (err) {
        this.loadingORA.stop();
        T.log.error(
          `× [${host}] Remote server exec command failed \n\t ${err.message}`
        );
      }
      stream.on('close', (err) => {
        if (err) {
          this.loadingORA.fail(`× [${host}] Backup failed`);
        }
        this.loadingORA.stop();
        this._onDone({});
      });

      stream.on('data', (data) => {});
    });
  }

  _onDone({ message, state, directory }) {
    !this._isLogAll && this.loadingORA.stop();
    if (state !== 200) {
      T.log.yellow(T.msg.red(message));
      T.fs.existsSync(this.zipPath) &&
        this.deploy.remotePath === directory &&
        T.fsa.removeSync(this.zipPath);
    } else {
      this.setBackup();
    }
    // 打印相关信息
    let info = this._getBackupInfo();
    ['name', 'date', 'user', 'rollback'].forEach((name) => {
      delete info[name];
    });
    const status = JSON.stringify(info, null, 4)
      .replace(/^\{\n|\n\}$/g, '')
      .replace(/\"/g, '');
    T.log.yellow(`√ [${this.deploy.host}] Backup Status: `);
    T.log.cyan(status);
    T.log.yellow(this._stopText());
    this.emit('backup_done', {
      deploy: this.deploy,
      backup: this
    });
  }

  // 写入备份列表文件
  _writeBackupJsonFile(jsonData) {
    T.fsa.writeFileSync(this.backupFile, jsonData || '{}', 'utf8');
  }

  // 将备份信息写入文件
  setBackup(backupObj) {
    const today = dateFormat(Date.now(), 'yyyy-mm-dd');

    let backs = this.getBackups();
    let back = backs[today] || [];
    !util.isArray(back) && (back = []);
    back.push(backupObj || this._getBackupInfo());

    backs[today] = back;
    // write
    this._writeBackupJsonFile(JSON.stringify(backs, null, 4));
  }

  // 获取备份列表
  getBackups() {
    let backs = null;
    try {
      backs = require(this.backupFile);
    } catch (e) {
      T.log.error(
        `× [${T.getTime()}] '${this.backupFile}' is not found \n ${e.message}`
      );
    }
    return backs || {};
  }

  // 更新备份（回滚操作之后）
  updateBackup(name) {
    let backs = this.getBackups();
    for (let back in backs) {
      if (backs.hasOwnProperty(back)) {
        backs[back].forEach((b) => {
          if (b.name === name) {
            b.rollback = true;
          }
        });
      }
    }
    this._writeBackupJsonFile(JSON.stringify(backs, null, 4));
  }

  _getBackupInfo() {
    const userInfo = os.userInfo();
    return {
      // 创建备份时间
      date: dateFormat(this.created, 'yyyy-mm-dd HH:MM:ss'),
      // 输入路径
      from: this.deploy.remotePath,
      // 输出路径
      to: this.outPath,
      // 备份包地址
      path: this.zipPath,
      // 名称
      name: this.zipName,
      // 当前执行备份的本地系统用户名
      user: userInfo.username,
      // 备份类型，远程 or 本地
      mode: this.mode,
      // 此备份是否已回滚
      rollback: false,
      // 远程server
      server: {
        user: this.deploy.username,
        host: this.deploy.host
      },
      remark: this.remark || ''
    };
  }

  _startText() {
    return `→ [${this.deploy.host}] Backup start ......`;
  }
  _stopText() {
    return `√ [${this.deploy.host}] Backup done =^_^= (^_^) =^_^= !!! \n`;
  }
}

module.exports = Backup;
