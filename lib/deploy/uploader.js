const { dir } = require('console');

/**
 * Created by Rodey on 2018/3/23.
 */
const util = require('../utils'),
    extend = require('extend'),
    SSH2 = require('ssh2').Client,
    vfs = require('vinyl-fs'),
    mps = require('map-stream'),
    parents = require('parents'),
    crypto = require('crypto'),
    EventEmitter = require('events').EventEmitter,
    T = require('../tools');

class Uploader extends EventEmitter {
    constructor(localPath, remotePath, authentications) {
        super();
        this.localPath = localPath;
        this.remotePath = remotePath;
        this.auths = authentications;
        this.ssh2 = new SSH2();
        this.sftp = null;
        this.mkDirCache = {};
        this.finished = false;
        this.fileCount = 0;
        this.modCount = 0;
        this.platform = 'unix';
        this.host = this.auths.host;
        // 上传方式   increment: 增量; full: 全量
        this.type = 'full';
        this.errCaches = {};
    }

    init() {}

    setType(type) {
        type && (this.type = type);
        // 是否增量
        this._isIncrementType = this.type === 'increment';
        // 是否全量
        this._isFullType = this.type === 'full';
    }

    start() {
        if (!this.host && !util.isString(this.host)) {
            return T.log.error(`× server host is undefined`);
        }
        // if (!this.auths.user) {
        //     return T.log.error(`× server connect username is undefined`);
        // }
        // if (!this.auths.pass) {
        //     return T.log.error(`× server connect password is undefined`);
        // }
        if (this.sftp) return this.startUpload();

        let message;
        if (this.auths.password) {
            message = T.msg.gray(`→ [${this.host}] Authenticating with password.`);
        } else if (this.auths.key) {
            message = T.msg.gray(`→ [${this.host}] Authenticating with private key.`);
        }

        this.emit('start', { message, uploader: this });

        this.ssh2.on('ready', this._onReady.bind(this));
        this.ssh2.on('error', this._onError.bind(this));
        this.ssh2.on('end', this._onEnd.bind(this));
        this.ssh2.on('close', this._onClose.bind(this));
        this.ssh2.connect(this.auths);
    }

    stop() {
        this.sftp && this.sftp.end();
        this.ssh2 && this.ssh2.end();
    }

    startUpload() {
        this.time = Date.now();
        // 读取路径
        let stream = vfs
            .src(this.localPath)
            // 1 获取所有目录，并判断远程服务器是否存在，不存在则创建
            .pipe(mps(this.checkDir.bind(this)));

        stream.on('close', () => {
            vfs
                .src(this.localPath)
                // 2 开始上传文件
                .pipe(mps(this.onUpload.bind(this)))
                .on('close', () => {
                    const duration = Date.now() - this.time;
                    const status = `
                    server info:  host: ${this.host}; user: ${this.auths.username}
                     local path:  ${this.localPath}
                    remote path:  ${this.remotePath}
                    total files:  ${this.fileCount}
                 modified files:  ${this.fileCount - this.modCount}
                 uploaded files:  ${this.fileCount - this.modCount}\n`;
                    this.emit('done', { fileCount: this.fileCount, modCount: this.modCount, status, duration, uploader: this });
                    this.fileCount = 0;
                    this.modCount = 0;
                    this.errCaches = {};
                });
        });
    }

    // 检查路径
    checkDir(file, next) {
        let stat = T.fs.statSync(file.path);
        if (!stat.isDirectory()) {
            return next(null, file);
        }
        let remotePath = this._getRemotePath(file);
        let dirname = Uploader._normalizePath(T.Path.join(remotePath, ''));

        let directories = parents(dirname)
            .map(d => {
                return d.replace(/^\/~/, '~');
            })
            .map(Uploader._normalizePath);

        /^\//.test(dirname) && (directories = this._fixPrefix(directories || []));

        directories = directories.filter(d => d !== this._getRelativePath(this.remotePath));
        directories = directories.filter(d => {
            return d.length >= this.remotePath.length && !this.mkDirCache[d];
        });

        while (directories.length >= 0) {
            if (directories.length === 0) return next(null, file);
            let dir = directories.pop();
            if (dir) {
                this.mkDirCache[dir] = true;
                this.hasExists(dir, isExists => {
                    !isExists && this.mkdirectory(dir);
                });
            }
        }
    }

    hasExists(dir, cb) {
      this.sftp.exists(dir, isExists => {
          cb && util.isFunction(cb) && cb.call(this, isExists, dir);
      });
    }

  mkdirectory(dir, cb) {
      this.sftp.mkdir(dir, { mode: '0777' }, err => {
        let message;
        if (err) {
            message = T.msg.red(`× [${T.getTime()}] '${dir}' mkdir Failed`);
            this.emit('error', new Error(message, err));
            T.log.error(message);
        } else {
            message = T.msg.green(`√ [${T.getTime()}] '${dir}' mkdir Successfully`);
            this.emit('uploaded', { message, directory: dir });
            cb && util.isFunction(cb) && cb.call(this, dir);
        }
      });
    }

    onUpload(file, next) {
        let stat = T.fs.statSync(file.path);
        if (stat.isDirectory()) {
            return next(null, file);
        }

        let remotePath = this._getRemotePath(file);

        // 全量上传
        if (this._isFullType) {
            return this._uploader(file, next, remotePath);
        }

        // 增量上传
        this._isIncrementType &&
            this.sftp.exists(remotePath, isExists => {
                if (!isExists) {
                    this._uploader(file, next, remotePath);
                } else {
                    this._downloader(file, next, remotePath);
                }
            });
    }

    _downloader(file, next, realPath) {
        const stat = T.fs.statSync(file.path);
        const fileContent = T.getFileContent(file.path);
        const filename = T.Path.basename(realPath);
        const localHash = crypto
            .createHash('md5')
            .update(fileContent)
            .digest('hex');

        const stream = this.sftp.createReadStream(realPath, {
            flags: 'r',
            encoding: null,
            mode: '0666',
            autoClose: true
        });

        let downloadBytes = '';

        stream.on('data', chunk => {
            downloadBytes += chunk;
        });

        stream.on('close', err => {
            const remoteHash = crypto
                .createHash('md5')
                .update(downloadBytes)
                .digest('hex');

            let message;

            if (localHash !== remoteHash) {
                message = T.msg.green(`√ [${T.getTime()}] check hashContent ( Modified ), filename: '${filename}' `);
                this.emit('uploaded', { message, file, realPath, size: file.stat.size });
                this._uploader(file, next, realPath);
            } else {
                this.fileCount++;
                this.modCount++;
                message = T.msg.green(`√ [${T.getTime()}] check hashContent ( No Modify ), filename: '${filename}' `);
                this.emit('uploaded', { message, file, realPath, size: file.stat.size });
                next(null, file);
            }
        });
    }

    _uploader(file, next, realPath) {
        let stream = this.sftp.createWriteStream(realPath, {
            flags: 'w',
            encoding: null,
            mode: '0666',
            autoClose: true
        });

        let uploadedBytes = 0;
        let highWaterMark = stream.highWaterMark || 16 * 1000;
        let size = file.stat.size;
        this.errCaches[realPath] = false;

        file.pipe(stream);

        stream.on('drain', () => {
            uploadedBytes += highWaterMark;
            this.emit('upload_progress', { file, realPath, total: size, uploaded: uploadedBytes });
        });

        stream.on('error', err => {
            this.errCaches[realPath] = true;
            const message = T.msg.red(`× '${realPath}' upload error: ${err.message}`);
            this.emit('uploaded', { message, file, realPath, size, error: T.msg.red(`× ${message}: ${err.message}`) });
        });

        stream.on('close', err => {
            if (err || this.errCaches[realPath]) {
                const message = `${realPath} is upload fail`;
                this.emit('error', new Error(message, err));
                this.emit('uploaded', { message, file, realPath, size, error: T.msg.red(`× ${message}: ${err.message}`) });
            } else {
                this.fileCount++;
                this.emit('uploaded', { message: this._uploadedText(realPath, size), file, realPath, size });
            }
            next(null, file);
        });
    }

    _execMkdir(dir, cb) {
        cb = (util.isFunction(cb) && cb) || function() {};

        let dirs = parents(dir)
            .filter(dir => ['.', '..'].indexOf(dir) < 0)
            .filter(dir => !this.mkDirCache[dir])
            .filter(dir => !!dir)
          .map(d => this._getRelativePath(d));

      /^\//.test(dir) && (dirs = this._fixPrefix(dirs || []));

        while (dirs && dirs.length >= 0) {
            if (dirs.length === 0) return cb.call(this);
            const d = dirs.pop();
            this.mkDirCache[d] = true;
            this.hasExists(d, isD => {
                !isD && this.mkdirectory(d);
            });
        }
    }

    _onReady() {
        this.ssh2.sftp((err, sftp) => {
            if (err) T.log.error(err.message);
            // T.log.gray(`√ [${this.host}] SFTP Ready Successfully`);
            sftp.on('end', () => {});

            this.sftp = sftp;
          const remotePath = this._getRelativePath(this.remotePath);
            this._execMkdir(remotePath, this.startUpload);
        });
    }

    _onError(err) {
        T.log.error(err.message);
    }

    _onEnd() {
        // T.log.gray(`^ [${this.host}] Connection end `);
    }

    _onClose() {
        // T.log.gray(`√ [${this.host}] Connection Closed`);
    }

    _uploadedText(realPath, size) {
        return `√ [${T.getTime()}] uploaded '${realPath}', ${T.msg.yellow(size / 1000 + ' kb')}`;
    }

    _getRemotePath(file) {
        let remotePath = T.Path.join(this.remotePath, file.relative);
        return this._getRelativePath(remotePath);
    }

    _getRelativePath(path) {
        if (this.platform.toLowerCase() === 'win') {
            path = path.replace(/\//gi, '\\');
        } else {
            path = path.replace(/(\\{1,2}|\/)/gi, '/');
        }
        return path;
    }

    _fixPrefix(dirs) {
      dirs = dirs.map((d) => /^\//.test(d) ? d : '/' + d);
      return dirs;
    }

    static _normalizePath(path) {
        return path.replace(/\\/g, '/');
    }
}

module.exports = Uploader;
