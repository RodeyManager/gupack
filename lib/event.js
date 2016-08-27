/**
 * Created by r9luox on 2016/8/23.
 */

const EventEmitter = require('events').EventEmitter;

const BuildEvent = (function(){

    'use strict';

    var instance = null;

    var BuildEvent = function(){
        this.event = new EventEmitter();
        this.types = {};
    };

    BuildEvent.prototype = {
        emit: function(eventType, data){
            this.types[eventType] = data || '00';
            this.event.emit(eventType, data);
        },
        once: function(eventType, cb){
            if(!this.types[eventType]){
                console.log('no match event: ' + eventType);
            }else{
                this.event.once(eventType, cb);
                this.types[eventType] = cb;
            }
        },
        remove: function(eventType){
            if(eventType in this.types){
                this.event.removeListener(eventType, this.types[eventType]);
            }
        }
    };

    return {
        getInstance: () => {
            if(!instance){
                instance = new BuildEvent();
            }
            return instance;
        }
    };

}).call(this);

module.exports = BuildEvent;


