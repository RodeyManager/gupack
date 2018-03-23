/**
 * Created by Rodey on 2018/3/23.
 */
const util = require('../utils'),
    extend = require('extend'),
    SSH2 = require('ssh2').Client,
    EventEmitter = require('events').EventEmitter,
    LoadingORA = require('../loadProgress').LoadingORA,
    T = require('../tools');

class Downloader extends EventEmitter {
    constructor(fromPath, toPath, auths) {
        super();

        this.fromPath = fromPath;
        this.toPath = toPath;
        this.auths = auths;
        this.ssh2 = null;
        this.sftp = null;
        this.count = 0;
    }

    start() {
        this.initSSH();
    }

    initSSH() {
        if (!this.ssh2) {
            this.ssh2 = new SSH2();
        }
        this.ssh2.on('ready', this._onReady.bind(this));
        this.ssh2.connect(this.auths);
    }

    download() {
        // 拉取远程文件到本地
        this.ssh2.sftp((err, sftp) => {
            if (err) throw err;
            this.sftp = sftp;
            this.emit('start', { message: '→ Backup start ...... ', backup: this });
            this._readdir(this.fromPath, null, sftp);
        });
    }

    /**
     * 递归读取远程目录
     * @param String dir  远程目录
     * @param String out  本地目录
     */
    _readdir(dir, out) {
        this.count++;
        this.sftp.readdir(dir, (err, list) => {
            if (err) {
                T.log.error(err.message);
            }
            if (list && list.length > 0) {
                list.forEach(item => {
                    const input = T.Path.posix.resolve(dir, item.filename);
                    const output = T.Path.resolve(out || this.toPath, item.filename);
                    const stat = item.attrs;
                    // 目录
                    if (stat.isDirectory()) {
                        // 判断本地是否有此目录
                        !T.fs.existsSync(output) && T.fs.mkdirSync(output);
                        // 循环读取
                        this._readdir(input, output);
                    } else if (stat.isFile(input)) {
                        this._getFile(input, output, stat);
                    }
                });
            } else {
                this._finishEnd(0);
            }
            this.count--;
        });
    }

    /**
     * 拉取文件
     * @param String input  输入路径
     * @param String output 输出路径
     * @param Stat stat     Stat对象 (https://github.com/mscdex/ssh2-streams/blob/master/SFTPStream.md#attrs)
     */
    _getFile(input, output, stat) {
        this.count++;
        let readStream = this.sftp.createReadStream(input, {
            flags: 'r',
            encoding: null,
            handle: null,
            mode: 0o666,
            autoClose: true
        });
        let writeStream = T.fs.createWriteStream(output);
        readStream.pipe(writeStream).on('finish', () => {
            const message = `√ [${T.getTime()}] download to '${output}', after ${T.msg.yellow(stat.size / 1000 + ' kb')}`;
            this.emit('file_downloaded', { output, size: stat.size, message });
            this._finishEnd(--this.count);
        });
    }

    // 备份完成
    _finishEnd(count) {
        count === 0 && this.emit('done', { message: '√ Backup Done', backup: this });
    }

    _onReady() {
        this.download();
    }
}

module.exports = Downloader;
