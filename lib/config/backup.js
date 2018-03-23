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
    Downloader = require('./downloader'),
    os = require('os'),
    T = require('../tools');

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
        this.backupFile = T.Path.resolve(this.deploy.basePath, 'backup.json');
        // 打印方式:
        // all (默认，打印详细信息)
        // progress (进度条方式)
        this.log = 'all';
        // 进度条
        this.loadingORA = null;

        this.options = extend(true, this.deploy.backup);
        // 默认不执行备份
        this.isExecute = false;
        // 初始化是否执行
        this.initExecute();
        // 如果设置不执行，则不进行系列初始化
        this.options && this.isExecute && this.init();
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
            T.log.red(`× [${T.getTime()}] backup name field not has special characters or spaces can be included`);
            process.exit(1);
        }

        this.outPath = outPath;
        this.zipName = name + (this.mode === 'remote' ? '.zip' : '');
        this.zipPath = T.Path.join(this.outPath || this.deploy.remotePath, this.zipName);
    }

    initMode() {
        this._isRemoteMode = this.mode === 'remote';
        this._isLocalMode = this.mode === 'local';
    }

    initLog() {
        this._isLogAll = this.log === 'all';
        this.loadingORA = new LoadingORA();
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
            T.log.red(`× Mode is Local, the outPath is not found`);
            process.exit(1);
        }
        if (!T.fs.existsSync(this.zipPath)) {
            T.fsa.mkdirsSync(this.zipPath);
        }

        const downloader = new Downloader(this.deploy.remotePath, this.zipPath, this.deploy._getConnectOptions());
        downloader.on('start', () => {
            T.log.yellow(this._startText());
            this._isLogAll && this.loadingORA.start(this._startText());
        });
        downloader.on('file_downloaded', ({ outPath, size, message }) => {
            // const text = `√ [${T.getTime()}] download to '${output}', after ${T.msg.yellow(size / 1000 + ' kb')}`;
            this._isLogAll ? T.log.green(message) : this.loadingORA.text(T.msg.green(message));
        });
        downloader.on('done', this._onDone.bind(this));
        downloader.start();
    }

    _mkdirectory(dir, cb) {
        this.sftp.mkdir(dir, { mode: '0755' }, err => {
            if (err) {
                T.log.red(`× [${T.getTime()}] '${dir}' mkdir Failed`);
            } else {
                T.log.green(`√ [${T.getTime()}] '${dir}' mkdir Successfully`);
                cb && util.isFunction(cb) && cb.call(this, dir);
            }
        });
    }

    _hasExists(dir, cb) {
        this.sftp.exists(dir, isExists => {
            !isExists && this.mkdirectory(dir);
            cb && util.isFunction(cb) && cb.call(this, isExists, dir);
        });
    }

    _onReady() {
        this.ssh2.sftp((err, sftp) => {
            if (err) T.log.error(err.message);
            this.sftp = sftp;
            this._preBackup.call(this);
        });
    }

    _preBackup() {
        // 检查备份输入路径
        this._hasExists(this.deploy.remotePath, isExists => {
            if (isExists) {
                // 检查备份输出路径
                this._hasExists(this.outPath, isExistsZipPath => {
                    if (isExistsZipPath) {
                        this._backup.call(this);
                    } else {
                        this._mkdirectory(this.outPath, () => {
                            this._backup.call(this);
                        });
                    }
                });
            }
        });
    }

    // 远程服务器上备份
    _startRemoteBackup() {
        if (!this.ssh2) {
            this.ssh2 = new SSH2();
        }
        const auths = this.deploy._getConnectOptions();

        this.ssh2.on('ready', this._onReady.bind(this));
        this.ssh2.connect(auths);
    }

    _backup() {
        const host = this.deploy.host;
        const auths = this.deploy._getConnectOptions();
        this.zipPath = this.zipPath.replace(/\\\\?/g, '/');
        const command = `cd ${this.deploy.remotePath} && zip -q -r ${this.zipPath} *`;

        let message = this._startText();
        T.log.yellow(message);

        if (auths.password) {
            T.log.gray(`→ [${host}] Authenticating with password.`);
        } else if (auths.privateKey) {
            T.log.gray(`→ [${host}] Authenticating with private key.`);
        }

        this.loadingORA.start(message);

        this.ssh2.exec(command, (err, stream) => {
            if (err) {
                T.log.red(`× [${host}] Remote server exec command failed \n\t ${err.message}`);
            }
            stream.on('close', err => {
                if (err) {
                    this.loadingORA.fail(`× [${host}] Backup failed`);
                }
                this.loadingORA.stop();
                this._onDone();
            });

            stream.on('data', data => {});
        });
    }

    _onDone() {
        this._isLogAll && this.loadingORA.stop();
        T.log.yellow(this._stopText());
        this.setBackup();
        this.emit('backup_done', { deploy: this.deploy, backup: this });
    }

    // 写入备份列表文件
    _writeBackupJsonFile(jsonData) {
        T.fsa.writeFileSync(this.backupFile, jsonData || '{}', 'utf8');
    }

    // 将备份信息写入文件
    setBackup(backupObj) {
        const today = dateFormat(Date.now(), 'yyyy-mm-dd');
        const userInfo = os.userInfo();
        let backs = this.getBackups();
        let back = backs[today] || [];

        !util.isArray(back) && (back = []);
        back.push(
            backupObj || {
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
                }
            }
        );

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
            T.log.red(`× [${T.getTime()}] '${this.backupFile}' is not found \n ${e.message}`);
        }
        return backs || {};
    }

    // 更新备份（回滚操作之后）
    updateBackup(name) {
        let backs = this.getBackups();
        for (let back in backs) {
            if (backs.hasOwnProperty(back)) {
                backs[back].forEach(b => {
                    if (b.name === name) {
                        b.rollback = true;
                    }
                });
            }
        }
        this._writeBackupJsonFile(JSON.stringify(backs, null, 4));
    }

    _startText() {
        return `→ [${this.deploy.host}] Backup start ......`;
    }
    _stopText() {
        return `√ [${this.deploy.host}] Backup done =^_^= (^_^) =^_^= !!! \n`;
    }
}

module.exports = Backup;
