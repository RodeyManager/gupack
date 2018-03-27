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
    constructor(deploies) {
        this.deploies = deploies;
        this.init();
    }

    init() {
        this.deploies = this.deploies.map(deploy => new Deploy(deploy));
    }

    startDeploy() {
        // 过滤设置不执行的
        const deploies = this.deploies.filter(deploy => deploy.isExecute);
        // 支持多节点部署
        if (this.deploies.length > 0) {
            const deploy = this.deploies.filter(deploy => deploy.backup)[0];
            if (!this._isBackupDone && deploy.isExecute && deploy.backup['isExecute']) {
                return this.startBackup(true);
            }

            // 递归部署
            _recursion.call(this, deploies[0]);

            function _recursion(deploy) {
                deploy.start();
                deploy.on('deploy_done', message => {
                    _vc.call(this);
                });
            }

            function _vc() {
                deploies.splice(0, 1);
                if (deploies.length > 0) {
                    _recursion.call(this, deploies[0]);
                }
            }
        }
    }

    startBackup(isBeforeDeploy) {
        if (this._isBackupDone) this.runDeploy();
        if (this.deploies.length > 0) {
            const deploy = this.deploies.filter(deploy => deploy.backup)[0];

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
            backup.start();
            backup.on('backup_done', () => {
                if (isBeforeDeploy) {
                    this._isBackupDone = true;
                    this.startDeploy();
                } else {
                    process.exit(0);
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
}

module.exports = DeployManager;
