/**
 * Created by Rodey on 2016/8/18.
 * Live Reload
 */
;(function(){
    'use strict';

    this.onload = function(){
        var wsServer = 'ws://127.0.0.1:{{@port}}';
        var websocket;

        function init(){

            _addBuildLoadingElment();

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
            if(/start\sbuilding/gi.test(message)){
                _showBuildLoading();
            }
            else if(/server\sreload/gi.test(message)){
                location.reload(true);
            }
        }
        function onError(evt) {
            console.log('Error occured: ' + evt.data);
        }

        function _addBuildLoadingElment(){
            var buildElm = document.createElement('div');
            buildElm.className = '_build-loading-live-reload';
            var spiner = document.createElement('div');
            spiner.className = '_build-loading-spiner _build-rounding';
            var text = document.createElement('span');
            text.className = '_build-loading-text';
            text.textContent = 'building......';

            buildElm.appendChild(spiner);
            buildElm.appendChild(text);
            document.body.appendChild(buildElm);

        }
        function _showBuildLoading(){
            document.querySelector('._build-loading-live-reload').classList.add('_build-loading-slide-down');
        }

    };

}).call(this);
