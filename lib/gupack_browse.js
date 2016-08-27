/**
 * Created by Rodey on 2016/8/18.
 * 此文件用于浏览器实时刷新
 * 采用 Websocket 进行实时通信
 */

;(function(){
    'use strict';
    //监听server
    this.onload = function(){
        var wsServer = 'ws://127.0.0.1:{{@port}}';
        var websocket;

        function init(){
            websocket = new WebSocket(wsServer);
            websocket.onopen = onOpen;
            websocket.onclose = onClose;
            websocket.onmessage = onMessage;
            websocket.onerror = onError;
        }

        init();

        function onOpen(evt) {
            console.log("Connected to WebSocket server.");
            websocket.send('client connected');
        }
        function onClose(evt) {
            console.log("Disconnected");
        }
        function onMessage(evt) {
            console.log(evt.data);
            var message = evt.data;
            if(/server reload/gi.test(message)){
                location.reload(true);
            }
        }
        function onError(evt) {
            console.log('Error occured: ' + evt.data);
        }

    };

}).call(this);
