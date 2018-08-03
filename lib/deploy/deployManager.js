/**
 * Created by Rodey on 2018/3/27.
 */

'use strict';

const extend = require('extend'),
    util = require('../utils'),
    T = require('../tools'),
    Deploy = require('./deploy'),
    Backup = require('./backup'),
    Rollback = require('./rollback');

class DeployManager {
    constructor(deploies, isWatch) {
        this.deploies = deploies;
        this.isWatch = isWatch;
        this.init();
    }

    init() {
        this.deploies && (this.deploies = this.deploies.map(deploy => new Deploy(deploy)));
    }

    setDeploy(deploies) {
        if (!util.isArray(deploies)) return this;
        this.deploies = extend(true, [], deploies);
        this.init();
    }

    startDeploy(isSkipBackup) {
        // 支持多节点部署
        if (this.deploies.length > 0) {
            // 过滤设置不执行的
            const backupAsDeploy = this.deploies.filter(deploy => deploy.backup)[0];
            // 部署前是否执行备份
            // --skip-bakup 跳过备份
            if (!isSkipBackup && !this._isBackupDone && backupAsDeploy) {
                return this.startBackup(true);
            }

            // 递归部署
            this._recursionDeploy.apply(this, [this.deploies]);
        }
    }

    startBackup(isBeforeDeploy) {
        let isRemove = T.hasArg(['r', 'remove-backup']);
        if (isRemove) {
            new Backup(null).removeBackup();
        } else {
            if (this.deploies.length === 0) T.log.error('× Not found deploy config');
            // if (this._isBackupDone) this.startDeploy();
            const deploy = this.deploies.filter(deploy => deploy.backup)[0];
            const index = this.deploies.indexOf(deploy);

            const backup = new Backup(deploy);
            if (T.hasArg('out-path')) {
                backup.outPath = T.getArg('out-path');
            } else {
                backup.outPath = deploy.backup.outPath;
            }

            _getArg('name');
            _getArg('mode');
            _getArg('log');

            function _getArg(name) {
                if (T.hasArg(name)) {
                    backup.options[name] = T.getArg(name);
                }
            }

            // 如果设置部署前进行备份
            backup.isExecute = true;
            backup.init();
            // 是否为清除备份

            backup.start();
            backup.on('backup_done', () => {
                if (isBeforeDeploy) {
                    this._isBackupDone = true;
                    // 备份完成后删除备份配置，保证继续部署
                    delete this.deploies[index]['backup'];
                    this.startDeploy();
                } else {
                    T.log.end();
                }
            });
        }
    }

    startRollback() {
        const deploies = this.deploies.filter(deploy => deploy.isRollback);
        // 支持多节点回滚
        if (deploies.length > 0) {
            const rollback = new Rollback(deploies);
            rollback.start();
        }
    }

    _recursionDeploy(deploies, deploy) {
        deploy = deploy || deploies[0];
        if (deploy) {
            deploy.start();
            deploy.on('deploy_done', message => {
                _vc.apply(this);
            });
        } else {
            _vc.apply(this);
        }

        function _vc() {
            deploies.splice(0, 1);
            if (deploies.length > 0) {
                this._recursionDeploy.apply(this, [deploies, deploies[0]]);
            } else {
                !this.isWatch && T.log.end();
            }
        }
    }
}

module.exports = DeployManager;