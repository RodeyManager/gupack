/**
 * Created by Rodey on 2017/7/7.
 */

'use strict';

const util = require('../utils'),
    extend = require('extend'),
    SSH2 = require('ssh2'),
    EventEmitter = require('events').EventEmitter,
    LoadingORA = require('../loadProgress').LoadingORA,
    dateFormat = require('dateformat'),
    Uploader = require('./uploader'),
    Backup = require('./backup'),
    T = require('../tools');

class Deploy extends EventEmitter {
    constructor(config) {
        super();
        this.basePath = T.getArg('cwdir') || process.cwd();

        this.host = null;
        this.port = 22;
        this.username = 'anonymous';
        this.password = null;
        this.timeout = 50000;

        // 本地目录
        this.localPath = '';
        this.filters = [];

        // 远程目录
        this.remotePath = null;
        this.platform = 'unix';
        this.onUploadedComplete = null;
        this.onUploadedFileSuccess = null;
        this.onUploadedFileError = null;
        // 是否执行上传
        this.isExecute = true;
        // 是否编译之后进行部署
        // 有时候我们希望编译生产环境后不进行部署，而是单独执行部署命令
        this.isBuildAfter = true;
        // 上传方式     increment: 增量; full: 全量
        this.type = 'full';
        // 提示方式     all: 显示详细信息; progress: 显示进度 + 详细信息
        this.log = 'progress';
        // 将日志输出到文件
        this.logFile = null;
        // 链接方式 sftp or ftp
        this.connectType = 'sftp';

        this.agent = null;
        this.agentForward = false;

        this.privateKey = null;
        this.passphrase = null;

        this.keepaliveCountMax = 3;

        this.authKey = '';
        this.auth = null;
        this.authFile = '.ftppass';

        this.key = {};
        this.keyLocation = null;
        this.keyContents = null;

        this.uploader = null;
        this.isRollback = true;

        this.sftp = null;
        this.ssh2 = null;

        this.options = config;

        if (util.isObject(config)) {
            extend(true, this, config);
        }

        this.init();
        this.loading = new LoadingORA();
        this.uploader = new Uploader(this.localPath, this.remotePath, this._getConnectOptions());
    }

    init() {
        // init type
        this.initType();

        // localpath
        this.initPath();

        // remotepath
        this.initRemotePath();

        // localpath filters
        this.initFilters();

        // auto
        this.initAuth();

        // present key info
        this.initPresentKey();

        // init log type
        this.initLog();

        // init timeout
        this.initTimeout();
    }

    start() {
        // connent host as fstp
        this.isExecute ? this._initUploader() : this.stop();
        return this;
    }

    stop() {
        this.uploader && this.uploader.stop();
        // this._onDone();
    }

    initType() {
        // 是否增量
        this._isIncrementType = this.type === 'increment';
        // 是否全量
        this._isFullType = this.type === 'full';
    }

    initLog() {
        this._isProgressLog = this.log === 'progress';
    }

    initTimeout() {
        // ftp timeout options
        if (this.connectType === 'ftp') {
            this.connTimeout = this.pasvTimeout = this.keepalive = this.timeout;
        }
    }

    // path
    initPath() {
        if (util.isString(this.localPath) && this.localPath.length > 0) {
            this.localPath = (!T.isAbsolutePath(this.localPath) && [T.Path.resolve(process.cwd(), this.localPath)]) || [this.localPath];
        } else if (util.isArray(this.localPath)) {
            this.localPath = this.localPath
                .filter(p => {
                    return p && util.isString(p);
                })
                .map(p => {
                    if (p && p.length > 0) {
                        return !T.isAbsolutePath(p) ? T.Path.resolve(process.cwd(), p) : p;
                    }
                });
        } else {
            T.log.error('× LocalPath Error: localPath is not found ( localPath can be String or Array => vinyl-fs module )');
        }
    }

    initRemotePath() {
        if (!this.remotePath) {
            T.log.error('× RemotePath Error: remotePath is not found ( remotePath can be String )');
        }
    }

    // path filters
    initFilters() {
        if (this.filters && this.filters.length > 0) {
            this.filters = this.filters.map(f => {
                f = `!${f}`;
                this.localPath.push(f);
                return f;
            });
        }
    }

    // auto
    initAuth() {
        if (util.isObject(this.auth)) {
            this.auth['key'] && (this.authFile = this.auth['key']);
            this.auth['file'] && (this.authFile = this.auth['file']);
        }
        let authFile = T.Path.join(__dirname, this.authFile);
        if (this.authKey && T.fs.existsSync(authFile)) {
            let auth = JSON.parse(T.fs.readFileSync(authFile, 'utf8'))[this.authKey];
            if (!auth) this.emit('error', new Error('Could not find authkey in .ftppass'));
            if (typeof auth === 'string' && auth.indexOf(':') !== -1) {
                let authparts = auth.split(':');
                auth = { user: authparts[0], pass: authparts[1] };
            }
            this.user = auth.user;
            this.pass = auth.pass;
        }
        // aliases
        this.password = this.pass;
        this.username = this.user;
    }

    // present key info
    initPresentKey() {
        let key = this.key || this.keyLocation || null;
        if (key && typeof key === 'string') key = { location: key };

        //check for other options that imply a key or if there is no password
        if (!key && (this.passphrase || this.keyContents || !this.password)) {
            key = {};
        }

        if (key) {
            //aliases
            key.contents = key.contents || this.keyContents;
            key.passphrase = key.passphrase || this.passphrase;

            //defaults
            key.location = key.location || ['~/.ssh/id_rsa', '/.ssh/id_rsa', '~/.ssh/id_dsa', '/.ssh/id_dsa'];

            //type normalization
            if (!util.isArray(key.location)) key.location = [key.location];

            //resolve all home paths
            if (key.location) {
                let home = process.env.HOME || process.env.USERPROFILE;
                for (let i = 0; i < key.location.length; ++i) if (key.location[i].substr(0, 2) === '~/') key.location[i] = T.Path.resolve(home, key.location[i].replace(/^~\//, ''));

                for (let i = 0, keyPath; (keyPath = key.location[i++]); ) {
                    if (T.fs.existsSync(keyPath)) {
                        key.contents = T.fs.readFileSync(keyPath);
                        break;
                    }
                }
            } else if (!key.contents) {
                this.emit('error', new Error(`Cannot find RSA key, searched: ${key.location.join(', ')} `));
            }
        }
        this.key = key;
        if (this.key && this.key.contents) {
            this.keyContents = this.key.contents;
            this.privateKey = this.keyContents;
            this.passphrase = this.key.passphrase || this.passphrase;
        }
    }

    // new Uploader
    _initUploader() {
        this.uploader.on('start', this._onStart.bind(this));
        this.uploader.on('uploaded', this._onUploaded.bind(this));
        this.uploader.on('done', this._onDone.bind(this));
        this.uploader.setType(this.type);
        this.uploader.start();
    }

    _onStart({ message }) {
        this._writeLogFile(`\n-------------Start Log [${dateFormat(Date.now(), 'yyyy-mm-dd')}]-------------\n`);
        T.log.yellow(this._startText());
        this._writeLogFile(this._startText());
        message && T.log.gray(message);
        message && this._writeLogFile(message);
        this._isProgressLog && this.loading.start(T.msg.green(this._startText()));
    }

    _onUploaded(payload) {
        const { file, realPath, size, error, message } = payload;
        if (error) {
            this._writeLogFile(message);
            return this._isProgressLog ? this.loading.text(message) : T.log.green(T.msg.red(message));
        }
        this._writeLogFile(message);
        util.isFunction(this.onUploadedFileSuccess) ? this.onUploadedFileSuccess.call(this, { file, realPath, size }) : this._isProgressLog ? this.loading.text(message) : T.log.green(message);
    }

    _onDone(payload) {
        this._isProgressLog && this.loading.stop();
        const { fileCount, modCount, status, duration, uploader } = payload;
        let iText = this._isIncrementType ? `√ [${this.host}] Deploy Status: ` + T.msg.cyan(status) : '';
        let dText = iText + T.msg.green(`√ [${this.host}] ${this._isFullType ? fileCount + ' ' : ''}files uploaded OK =^_^= (^_^) =^_^= !!!`);
        util.isFunction(this.onUploadedComplete) ? this.onUploadedComplete.call(this) : T.log.green(dText);
        this._writeLogFile(dText);
        this.uploader.stop();
        T.log.yellow(this._stopText(duration));
        this._writeLogFile(this._stopText(duration));
        this._writeLogFile(`-------------End Log-------------\n`);
        this.emit('deploy_done', { deploy: this });
    }

    // SSH链接配置项
    _getConnectOptions() {
        let options = {
            host: this.host,
            port: this.port,
            username: this.username
        };

        if (this.password) {
            options.password = this.password;
        } else if (this.agent) {
            options.agent = this.agent;
            options.agentForward = this.agentForward || false;
        } else if (this.privateKey && this.passphrase) {
            options.privateKey = this.privateKey;
            options.passphrase = this.passphrase;
        }
        options.readyTimeout = this.timeout;
        options.platform = this.platform;
        options.keepaliveCountMax = this.keepaliveCountMax;
        return options;
    }

    _startText() {
        return `→ [${this.host}] Deploy start ...... `;
    }
    _stopText(duration) {
        return `√ [${this.host}] Deploy done =^_^= (^_^) =^_^= !!!, after ${T.msg.yellow((duration / 1000).toFixed(2) + ' s')} \n`;
    }
    _uploadedText(realPath, size) {
        return `√ [${T.getTime()}] uploaded '${realPath}', ${T.msg.yellow(size / 1000 + ' kb')}`;
    }
    _writeLogFile(txt) {
        txt = txt.replace(/(()?\[\d{2}m)/g, '') + '\n';
        if (!this.logFile || !util.isString(this.logFile)) return false;
        if (!T.fs.existsSync(this.logFile)) {
            T.fs.writeFileSync(this.logFile, txt, 'utf8');
        } else {
            T.fs.appendFileSync(this.logFile, txt, 'utf8');
        }
    }
}

module.exports = Deploy;
