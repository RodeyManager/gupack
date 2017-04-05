/**
 * Created by Rodey on 2016/12/5.
 */

var events = require('events');
var EventEmitter = events.EventEmitter;
var util = require('util');

var GPEmitter = function() {
    EventEmitter.call(this);
};

util.inherits(GPEmitter, EventEmitter);

GPEmitter.prototype.say = function(message){
    this.emit('message', message);
    return this;
};
GPEmitter.prototype.removeSay = function() {
    this.removeListener('message');
    return this;
};

GPEmitter.prototype.listen = function(cb) {
    this.on('message', (message) => {
        cb && cb(message);
    });
    return this;
};

var gpEmitter = new GPEmitter();
module.exports = gpEmitter;