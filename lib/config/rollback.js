/**
 * Created by Rodey on 2018/3/15.
 * 回滚操作
 */

'use strict';

const util = require('../utils'),
    extend = require('extend'),
    SSH2 = require('ssh2').Client,
    inquirer = require('inquirer'),
    EventEmitter = require('events').EventEmitter,
    LoadingORA = require('../loadProgress').LoadingORA,
    Uploader = require('./uploader'),
    Backup = require('./backup'),
    T = require('../tools');

const prompt = inquirer.createPromptModule();

class Rollback extends EventEmitter {
    constructor(deploies) {
        super();
        this.deploies = deploies;
        this.backups = null;
        // 回滚时选择需要回滚的版本所在的日期 (命令参数 --backup-date)
        // 然后将显示所选日期下的所有备份版本供选择回滚
        // 如果没有指定备份日期，将显示所有备份日期供选择，接着显示已选择日期下的所有可供回滚版本
        this.selectBackupDate = T.getArg('backup-date');
        this.selectBackup = T.getArg('backup-name');

        this.init();
    }

    init() {
        // 获取当前项目的备份列表
        this.initBackups();
    }

    // 项目根目录必须存在backups.json
    // 回滚操作必须依赖备份
    initBackups() {
        const hasBackupDepoly = this.deploies.filter(deploy => deploy.backup)[0];
        if (!hasBackupDepoly) {
            T.log.red(`× 未找到backup相关配置对象(config.deploy.backup), 多节点时至少需要一个节点配置backup,以供回滚使用`);
        }
        this.hasBackupDepoly = new Backup(hasBackupDepoly);
        this.backups = this.hasBackupDepoly.getBackups();
    }

    initSSH() {
        if (!this.ssh2) {
            this.ssh2 = new SSH2();
        }
        this.ssh2.on('ready', this._onReady.bind(this));
        this.ssh2.on('error', this.deploy.onError.bind(this.deploy));
        this.ssh2.on('end', this.deploy.onSSHEnd.bind(this.deploy));
        this.ssh2.on('close', this.deploy.onClose.bind(this.deploy));
    }

    initDateList() {
        // 如果指定了备份的版本名称
        if (this.selectBackup) {
            const ms = this.selectBackup.match(/(\d{4}-\d{1,2}-\d{1,2})/g);
            if (ms && ms.length > 0) {
                this.selectBackupDate = ms[0];
                this.selectBackup = this._getBackup(this.selectBackupDate, this.selectBackup);
                return this._selectedBackup();
            } else {
                T.log.error(`× 未找到指定的备份`);
            }
        }
        if (this.selectBackupDate || /^\d{4}-\d{1,2}-\d{1,2}$/.test(this.selectBackupDate)) {
            // 如果指定命令参数 (--back-date)
            this.showBackupList(this.selectBackupDate);
        } else {
            // 显示备份日期列表供选择
            this.showDateList();
        }
    }

    showDateList() {
        // 显示备份日期列表供选择
        const backups = this.backups;
        // 过滤空的备份列表
        const dates = Object.keys(backups).filter(date => backups[date].length > 0);

        if (dates.length === 0) {
            T.log.error('× A version of a rollback version is not found');
        }

        prompt([
            {
                type: 'list',
                name: 'date',
                message: `选择需要回滚的备份版本所在的日期 (${dates.length}): `,
                choices: dates
            }
        ]).then(awn => {
            this.selectBackupDate = awn.date;
            this.showBackupList();
        });
    }

    showBackupList(date) {
        const backs = this.backups[date || this.selectBackupDate];
        const names = backs.map(back => `${back.name} (${back.mode})`);
        prompt([
            {
                type: 'list',
                name: 'name',
                message: `选择需要回滚的备份版本(${names.length}): `,
                choices: names
            }
        ]).then(awn => {
            const name = this._trimName(awn.name);
            this.selectBackup = backs.find(back => back.name === name);
            this._selectedBackup();
        });
    }

    // 执行回滚
    start() {
        this.initDateList();
    }

    stop() {
        this.sftp && this.sftp.end();
        this.ssh2 && this.ssh2.end();
    }

    _selectedBackup() {
        const { from, mode } = this.selectBackup;
        this.mode = mode;

        if (!from) {
            T.log.error('× 未指定回滚目标目录');
        }

        this._execute();
    }

    _getBackup(date, name) {
        const backs = this.backups[date || this.selectBackupDate];
        return backs.filter(back => this._trimName(back.name) === name)[0];
    }

    _onDone() {
        this.stop();
        process.exit(0);
    }

    _onReady(deploy, ssh2, recursion) {
        const { from, to, path, name } = this.selectBackup;
        const host = deploy.host,
            auths = deploy._getConnectOptions(),
            { password, privateKey } = auths;
        const command = `unzip -o -q ${path} -d ${deploy.remotePath}`;

        this._startRollbackLog(host);

        if (password) {
            T.log.gray(`→ [${host}] Authenticating with password.`);
        } else if (privateKey) {
            T.log.gray(`→ [${host}] Authenticating with private key.`);
        }

        const loading = new LoadingORA();
        loading.start(`→ [${host}] Rollback start ......`);
        const time = Date.now();

        ssh2.exec(command, (err, stream) => {
            if (err) {
                return T.log.error(`× [${host}] Remote server exec command failed \n\t ${err.message}`);
            }
            stream.on('close', err => {
                if (err) {
                    return T.log.error(`× [${host}] Rollback failed \n\t ${err.message}`);
                }
                stream.end();
                this._updateBackup();
                loading.stop(`√ [${host}] Rollback done =^_^= (^_^) =^_^= !!!, after ${T.msg.yellow(((Date.now() - time) / 1000).toFixed(2) + ' s')} \n`);

                // 完成
                this.deploies.splice(0, 1);
                if (this.deploies.length > 0) {
                    recursion.call(this, this.deploies[0]);
                } else {
                    this.emit('rollback_done', { deploy, rollback: this });
                }
            });
            stream.on('data', data => {});
        });
    }

    // 开始上传 (根据模式)
    _execute() {
        // 监听回滚完成
        this.on('rollback_done', this._onDone.bind(this));
        // 如果有多节点，应该递归处理
        this._recursion.call(this, this.deploies[0]);
    }

    // 远程备份回滚(采用远程unzip命令)
    _executeUNZIP(deploy) {
        this._initSSH(deploy);
    }

    // 本地备份回滚(采用sftp上传覆盖)
    _executeSFTP(deploy) {
        this._initUploader(deploy, this._recursion);
    }

    // 如果有多节点，应该递归处理
    _recursion(deploy) {
        const host = deploy.host,
            auths = deploy._getConnectOptions();

        if (!host && !util.isString(host)) {
            return T.log.error(`× server host is undefined`);
        }

        // 根据备份模式进行回滚
        if (this.mode === 'local') {
            this._executeSFTP(deploy);
        } else if (this.mode === 'remote') {
            this._executeUNZIP(deploy);
        }
    }

    _initSSH(deploy) {
        const auths = deploy._getConnectOptions();
        const ssh2 = new SSH2();
        ssh2.on('ready', this._onReady.bind(this, deploy, ssh2, this._recursion));
        ssh2.on('error', err => T.log.error(err.message));
        ssh2.connect(auths);
    }

    _initUploader(deploy, recursion) {
        const { from, to, path, name } = this.selectBackup;
        const host = deploy.host,
            auths = deploy._getConnectOptions(),
            localPath = [T.Path.join(path, '/**/*')];

        const uploader = new Uploader(localPath, deploy.remotePath, auths);
        uploader.on('start', () => {
            this._startRollbackLog(host);
        });
        uploader.on('uploaded', ({ realPath, size }) => {
            T.log.green(`√ [${T.getTime()}] uploaded '${realPath}', ${T.msg.yellow(size / 1000 + ' kb')}`);
        });
        uploader.on('done', ({ fileCount, modCount, status, duration }) => {
            this._finishRollbackLog(host);

            this.deploies.splice(0, 1);
            if (this.deploies.length > 0) {
                recursion.call(this, this.deploies[0]);
            } else {
                this.emit('rollback_done', { deploy, rollback: this });
            }
        });
        uploader.setType('full');
        uploader.start();
    }

    _startRollbackLog(host) {
        T.log.yellow(`→ [${host}] Rollback start ......`);
    }
    _finishRollbackLog(host) {
        T.log.yellow(`√ [${host}] Rollback done =^_^= (^_^) =^_^= !!! \n`);
    }
    _updateBackup() {
        this.hasBackupDepoly.updateBackup(this.selectBackup.name);
    }
    _trimName(name) {
        return name.replace(/^([\s\S]+?)\s*\([\s\S]*?\)$/g, '$1').replace(/^\s*|\s*$/g, '');
    }
}

module.exports = Rollback;
