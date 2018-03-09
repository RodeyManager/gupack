/**
 * Created by rodey on 2016/8/19.
 * 此文件用于服务器端实时监听文件变化
 * 采用 Websocket 进行实时通信
 */
'use strict';

const wsServer = require('ws').Server;
const chokidar = require('chokidar');
const extend = require('extend');

const defaults = {
    debug: false,
    host: '127.0.0.1',
    port: 8523,
    paths: null,
    liveDelay: 2000,
    ignored: [/\\.git\//, /\\.svn\//, /\\.hg\//]
};

module.exports.LiveServer = (function() {
    function LiveServer(options) {
        this.options = extend(true, {}, defaults, options);
        this.init();
    }

    LiveServer.prototype = {
        init: function() {
            this.socket = null;
            this.watcher = null;
            this.server = new wsServer(this.options);
            this.server.on('connection', this.onConnection.bind(this));
            return this.server.on('close', this.onClose.bind(this));
        },

        onConnection: function(socket) {
            this.socket = socket;
            this.socket.on('message', this.onMessage.bind(this));
            return this.socket.on('error', this.onError.bind(this));
        },

        onMessage: function(message) {
            return this.debug('Browser URL: ' + message);
        },

        onError: function(err) {
            return this.debug('Error in client socket: ' + err);
        },

        onClose: function() {
            return this.debug('Browser disconnected.');
        },

        /**
         * 监听
         * @param paths
         * @returns {*}
         */
        watching: function(paths) {
            paths = paths || this.options.paths;
            this.options.paths = paths;
            return (this.watcher = chokidar
                .watch(paths, {
                    ignoreInitial: true,
                    ignored: this.options.ignored,
                    usePolling: this.options.usePolling
                })
                .on('add', this._filterRefresh.bind(this))
                .on('change', this._filterRefresh.bind(this))
                .on('unlink', this._filterRefresh.bind(this)));
        },

        unwatch: function(paths) {
            paths = paths || this.options.paths;
            this.options.paths = paths;
            return this.watcher && this.watcher.unwatch(paths);
        },

        debug: function(str) {
            if (this.options.debug) {
                return console.log(str + '\n');
            }
        },

        send: function(data) {
            this.socket && this.socket.send(data);
        },

        _filterRefresh: function(filepath, event) {
            let delayedRefresh;
            return (delayedRefresh = setTimeout(
                (function(_this) {
                    return function() {
                        clearTimeout(delayedRefresh);
                        return _this._refresh(filepath);
                    };
                })(this),
                this.options.liveDelay
            ));
        },

        _refresh: function(filepath) {
            this.debug('Refresh: ' + filepath);
            this.send('<<<-----server reload----->>>');
        }
    };

    return LiveServer;
})();
