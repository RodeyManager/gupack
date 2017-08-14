/**
 * Created by Rodey on 2017/7/7.
 */

'use strict';

const
    util         = require('../utils'),
    extend       = require('extend'),
    SSH2         = require('ssh2'),
    vfs          = require('vinyl-fs'),
    mps          = require('map-stream'),
    parents      = require('parents'),
    EventEmitter = require('events').EventEmitter,
    T            = require('../tools');

class Deploy extends EventEmitter{

    constructor(config){
        super();
        this.host = null;
        this.port = 22;
        this.username = 'anonymous';
        this.password = null;
        this.timeout = 20000;
        // 本地目录
        this.localPath = '';
        this.filters = [];
        // 远程目录
        this.remotePath = null;
        this.platform = 'unix';
        this.fileCount = 0;
        this.onUploadedComplete = null;
        this.onUploadedFileSuccess = null;
        this.onUploadedFileError = null;
        this.isDone = false;
        // 是否执行上传
        this.isExecute = true;
        // 上传方式   increment: 增量; full: 全量
        this.type = 'full';

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

        this.mkDirCache = {};
        this.finished = false;
        this.sftp = null;
        this.ssh2 = null;

        this.options = config;

        if(util.isObject(config)){
            extend(true, this, config);
        }

        this.init();
    }

    init(){

        // localpath
        this.initPath();

        // remotepath
        this.initRemotePath();

        // localpath filters
        this.initFilters();

        // host
        this.initHost();

        // auto
        this.initAuth();

        // present key info
        this.initPresentKey();

    }

    start(){
        // connent host as fstp
        this.isExecute ? this.connectSFTP() : this.close();
        return this;
    }

    stop(){
        this.sftp && this.sftp.end();
        this.ssh2 && this.ssh2.end();
    }

    close(){
        this.sftp && this.sftp.close();
        this.ssh2 && this.ssh2.close();
    }

    // path
    initPath(){

        if(util.isString(this.localPath) && this.localPath.length > 0){
                // this.localPath = [T.Path.resolve(process.cwd(), this.localPath)];
                // this.localPath = !T.isAbsolutePath(this.localPath)
                //                     ? [ T.Path.resolve(process.cwd(), this.localPath) ]
                //                     : [ this.localPath ];
                this.localPath = !T.isAbsolutePath(this.localPath) && [T.Path.resolve(process.cwd(), this.localPath)] || [this.localPath];
        }
        else if(util.isArray(this.localPath)){
            this.localPath = this.localPath.filter(p => {
                return p && util.isString(p);
            }).map(p => {
                if(p && p.length > 0){
                    return !T.isAbsolutePath(p) ? T.Path.resolve(process.cwd(), p) : p;
                }
            });
        }
        else{
            T.log.red('× LocalPath Error: localPath is not found ( localPath can be String or Array => vinyl-fs module )');
            process.exit(1);
        }

    }
    initRemotePath(){
        if(!this.remotePath){
            T.log.red('× RemotePath Error: remotePath is not found ( remotePath can be String )');
            process.exit(1);
        }
    }

    // path filters
    initFilters(){

        if(this.filters && this.filters.length > 0){
            this.filters = this.filters.map(f => {
                f = `!${ f }`;
                this.localPath.push(f);
                return f;
            });
        }
    }

    // hosts
    initHost(){

    }

    // auto
    initAuth(){

        if(util.isObject(this.auth)){
            this.auth['key'] && (this.authFile = this.auth['key']);
            this.auth['file'] && (this.authFile = this.auth['file']);
        }
        let authFile = T.Path.join(__dirname, this.authFile);
        if(this.authKey && T.fs.existsSync(authFile)){
            let auth = JSON.parse(T.fs.readFileSync(authFile,'utf8'))[this.authKey];
            if(!auth)
                this.emit('error', new Error('Could not find authkey in .ftppass'));
            if(typeof auth === 'string' && auth.indexOf(':') !== -1){
                let authparts = auth.split(":");
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
    initPresentKey(){

        let key = this.key || this.keyLocation || null;
        if(key && typeof key === 'string')
            key = { location: key };

        //check for other options that imply a key or if there is no password
        if(!key && (this.passphrase || this.keyContents || !this.password)){
            key = {};
        }

        if(key){

            //aliases
            key.contents = key.contents || this.keyContents;
            key.passphrase = key.passphrase || this.passphrase;

            //defaults
            key.location = key.location || ["~/.ssh/id_rsa","/.ssh/id_rsa","~/.ssh/id_dsa","/.ssh/id_dsa"];

            //type normalization
            if(!util.isArray(key.location))
                key.location = [ key.location ];

            //resolve all home paths
            if(key.location){
                let home = process.env.HOME||process.env.USERPROFILE;
                for(let i = 0; i < key.location.length; ++i)
                    if (key.location[i].substr(0,2) === '~/')
                        key.location[i] = T.Path.resolve(home, key.location[i].replace(/^~\//,''));


                for(let i = 0, keyPath; keyPath = key.location[i++];){
                    if(T.fs.existsSync(keyPath)){
                        key.contents = T.fs.readFileSync(keyPath);
                        break;
                    }
                }
            }else if(!key.contents){
                this.emit('error', new Error(`Cannot find RSA key, searched: ${ key.location.join(', ') } `));
            }
        }
        this.key = key;
        if(this.key && this.key.contents){
            this.keyContents = this.key.contents;
            this.privateKey = this.keyContents;
            this.passphrase = this.key.passphrase || this.passphrase;
        }
    }

    // connect
    connectSFTP(){

        if(this.sftp)
            return this.startUpload(this.sftp);

        if(this.password){
            T.log.yellow(`  [${ this.host }]  Authenticating with password.`);
        }else if(this.key){
            T.log.yellow(`  [${ this.key }]  Authenticating with private key.`);
        }

        if(!this.ssh2){
            this.ssh2 = new SSH2();
        }
        this.ssh2.on('ready', this.onReady.bind(this));
        this.ssh2.on('error', this.onError.bind(this));
        this.ssh2.on('end', this.onSSHEnd.bind(this));
        this.ssh2.on('close', this.onClose.bind(this));

        let options = {
            host : this.host,
            port : this.port,
            username : this.username
        };

        if(this.password){
            options.password = this.password;
        }else if(this.agent) {
            options.agent = this.agent;
            options.agentForward = this.agentForward || false;
        }else if(this.privateKey && this.passphrase){
            options.privateKey = this.privateKey;
            options.passphrase = this.passphrase;
        }
        options.readyTimeout = this.timeout;
        options.platform = this.platform;
        options.keepaliveCountMax = this.keepaliveCountMax;

        this.ssh2.connect(options);

    }

    startUpload(){

        // 读取路径
        let stream = vfs.src(this.localPath)
        // 1 获取所有目录，并判断远程服务器是否存在，不存在则创建
        .pipe(mps( this.checkDir.bind(this) ));

        stream.on('close', () => {
            vfs.src(this.localPath)
                // 2 开始上传文件
                .pipe(mps( this.onUpload.bind(this) ))
                .on('close', () => {
                    this.isDone = true;
                    this.emit('done', 'uploaded done');
                    util.isFunction(this.onUploadedComplete)
                        ? this.onUploadedComplete.call(this)
                        : T.log.yellow(`√ [${ this.host || '' }] ${ this.fileCount } files uploaded OK =^_^= (^_^) =^_^= !!!`);
            });
        });

    }

    // 检查路径
    checkDir(file, next){

        let stat = T.fs.statSync(file.path);
        if(!stat.isDirectory()){
            return next(null, file);
        }

        let remotePath = this._getRemotePath(file);
        let dirname = Deploy._normalizePath(T.Path.join(remotePath, ''));

        let directories = parents(dirname)
            .map(d => {
                return d.replace(/^\/~/,"~");
            })
            .map(Deploy._normalizePath);

        if(dirname.search(/^\//) === 0){
            directories = directories.map( d => {
                if(d.search(/^\//) === 0){
                    return d;
                }
                return '/' + d;
            });
        }

        directories = directories.filter( d => {
            return d.length >= this.remotePath.length && !this.mkDirCache[d];
        });

        while(directories.length >= 0){
            if(directories.length === 0)
                return next(null, file);
            let dir = directories.pop();
            if(dir){
                this.mkDirCache[dir] = true;
                this.hasExists(dir);
            }
        }

    }

    hasExists(dir){
        this.sftp.exists(dir, isExists => {
            !isExists && this.mkdirectory(dir);
        });
    }

    mkdirectory(dir){
        this.sftp.mkdir(dir, { mode: '0755' }, err => {
            if(err){
                T.log.red(`× [${ T.getTime() }] '${ dir }' mkdir Failed`);
            }else{
                T.log.green(`√ [${ T.getTime() }] '${ dir }' mkdir Successfully`);
            }
        });
    }

    onUpload(file, next){
        let stat = T.fs.statSync(file.path);
        if(stat.isDirectory()){
            return next(null, file);
        }

        let remotePath = this._getRemotePath(file);
        this._uploader(file, next, remotePath);

        // 增量上传 & 全量上传
        // console.log(remotePath);
        // this.sftp.exists(remotePath, isExists => {
        //     console.log(isExists);
        //     if(!isExists){
        //         this._uploader(file, next, remotePath);
        //     }else{
        //         this._downloader(file, next, remotePath);
        //     }
        // });

    }

    _downloader(file, next, realPath){

        let stat = T.fs.statSync(file.path);
        let fileContent = T.getFileContent(file.path);

        // this.sftp.stat(realPath, (err, remoteStat) => {
        //     if(err){
        //         return T.log.red(err.message);
        //     }
        //     console.log(stat.mtime.getTime(), remoteStat.mtime);
        //     console.log(stat);
        //     console.log(remoteStat);
        //     if(stat.mtime !== remoteStat.mtime){
        //         this._uploader(file, next, realPath);
        //     }else{
        //         T.log.green(`▶ [${ T.getTime() }] 当前文件未被修改，跳过-----`);
        //     }
        // });

        console.log(file.path);
        console.log(realPath);
        let stream = this.sftp.createReadStream(realPath,{
            flags: 'r',
            encoding: null,
            mode: '0666',
            autoClose: true
        });

        let downloadBytes = '';

        stream.on('data', (chunk) => {
            downloadBytes += chunk;
            // console.log(chunk);
        });

        stream.on('close', (err) => {
            console.log(downloadBytes === fileContent);
            console.log('downloadBytes: \n', downloadBytes);
            console.log('\n\n\nfileContent: \n', fileContent);
        });

    }

    _uploader(file, next, realPath){

        let stream = this.sftp.createWriteStream(realPath,{
            flags: 'w',
            encoding: null,
            mode: '0666',
            autoClose: true
        });

        let uploadedBytes = 0;
        let highWaterMark = stream.highWaterMark || (16 * 1000);
        let size = file.stat.size;

        file.pipe(stream);

        // T.log.green(`→ [${ T.getTime() }] uploading '${ realPath }' ...`);

        stream.on('drain', () => {
            uploadedBytes += highWaterMark;
            this.emit('upload_progress', { file, realPath, total: size, uploaded: uploadedBytes });
            // T.log.yellow(`${ realPath } uploaded ${ uploadedBytes / 1000 } kb`);
        });

        stream.on('error', err => {
            T.log.red(`× '${ realPath }' upload error: ${ err.message }`);
        });

        stream.on('close', (err) => {
            if(err){
                util.isFunction(this.onUploadedFileError) && this.onUploadedFileError(realPath, size);
                this.emit('error', new Error(`${ realPath } is upload fail`, err));
            }else{
                this.fileCount++;
                this.emit('uploaded', { file, realPath, total: size, uploaded: size });
                util.isFunction(this.onUploadedFileSuccess)
                    ? this.onUploadedFileSuccess.call(this, realPath, size)
                    : T.log.green(`√ [${ T.getTime() }] uploaded '${ realPath }', after ${ T.msg.yellow(size / 1000 + ' kb') }`);
            }
            next(null, file);
        });

    }

    onReady(){
        this.ssh2.sftp((err, sftp) => {
            if (err)    throw err;
            T.log.yellow(`  [${ this.host }]  SFTP Ready Successfully`);

            sftp.on('end', this.onEnd.bind(this));

            this.sftp = sftp;
            this.startUpload(this.sftp);
        });
    }

    onEnd(){
        T.log.yellow('[${ this.host }] - SFTP session closed');
        this.sftp = null;
        if(!this.finished)
            this.emit('error', new Error("SFTP abrupt closure"));
    }

    onSSHEnd(){
        T.log.yellow('Connection :: end');
        this.emit('Connection :: end');
    }

    onError(err){
        this.emit('error', new Error(err));
    }

    onClose(err){
        if(!this.finished){
            T.log.yellow("SFTP abrupt closure");
            this.emit('error', new Error("SFTP abrupt closure"));
        }
        if (err) {
            T.log.yellow('Connection :: close, ', T.msg.red('Error: ' + err));
        } else {
            T.log.yellow('Connection :: closed');
        }
    }

    _getRemotePath(file){
        let remotePath = T.Path.join(this.remotePath, file.relative);
        if(this.platform.toLowerCase() === 'win'){
            remotePath = remotePath.replace(/\//gi, '\\');
        }else{
            remotePath = remotePath.replace(/(\\{1,2}|\/)/gi, '/');
        }
        return remotePath;
    }

    static _normalizePath(path){
        return path.replace(/\\/g, '/');
    };

}

module.exports = Deploy;
