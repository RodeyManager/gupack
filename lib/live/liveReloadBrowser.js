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
            var id = '_build-loading-live-reload',
                buildElm = document.querySelector('#' + id);
            if(buildElm)    return buildElm;

            buildElm = document.createElement('div');
            buildElm.id = id;
            buildElm.className = id;
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
            var buildElm = document.querySelector('#_build-loading-live-reload');
            buildElm && buildElm.classList.add('_build-loading-slide-down');
        }

    };

}).call(this);
