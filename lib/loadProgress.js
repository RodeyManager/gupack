/**
 * Created by Rodey on 2017/10/24
 */

const cliSpinners = require('cli-spinners'),
    inquirer = require('inquirer'),
    ora = require('ora'),
    extend = require('extend'),
    prettyTime = require('pretty-hrtime'),
    T = require('./tools');

class LoadProgress {
    constructor(startText, endText) {
        this.startText = startText;
        this.endText = endText;
        this._type = 'bouncingBar';
        this._frames = cliSpinners[this._type].frames;
        this._interval = cliSpinners[this._type].interval;
        this.loader = this._frames.map(s => T.msg.yellow(`${s} ${this.startText}`));
        this.index = 0;
        this.stin = null;
        this.init();
    }

    init() {
        return this;
    }

    get frames() {
        return this._frames;
    }

    set frames(fams) {
        this._frames = fams;
        this.loader = this._frames.map(s => T.msg.yellow(`${s} ${this.startText}`));
    }

    get interval() {
        return this._interval;
    }
    set interval(val) {
        this._interval = val;
    }

    get type() {
        return this._type;
    }
    set type(type) {
        this._type = type;
        let spinner = cliSpinners[type];
        if (spinner) {
            this.frames = spinner.frames;
            this.interval = spinner.interval;
        }
    }

    setText(text) {
        this.loader = this._frames.map(s => T.msg.yellow(`${s} ${text || ''}`));
    }

    start() {
        this.ui = new inquirer.ui.BottomBar({ bottomBar: this.loader[this.index % this.loader.length] });
        this.stin = setInterval(() => {
            this.ui.updateBottomBar(this.loader[this.index++ % this.loader.length]);
        }, this._interval);
        return this;
    }

    stop() {
        clearInterval(this.stin);
        this.index = 0;
        this.ui.updateBottomBar(T.msg.green(this.endText) + '\n');
        return this;
    }

    close() {
        this.stop();
        this.ui = null;
        delete this.ui;
        process.exit();
    }
}

class LoadingORA {
    constructor(options) {
        this.options = extend(
            true,
            {
                text: T.msg.yellow(' Loading '),
                spinner: cliSpinners.dots12
            },
            options
        );
        this.spinner = ora(this.options);
    }

    set stream(s) {
        this.options.stream = s;
        this.spinner = ora(this.options);
    }

    text(txt) {
        this.spinner.text = T.msg.green(txt);
    }

    success(txt) {
        // this.time = (Date.now() - this.time) * 0.001;
        this.spinner.succeed(T.msg.green(txt.replace(/^√\s*/, '')));
    }

    fail(txt) {
        this.spinner.fail(T.msg.red(txt.replace(/^×\s*/, '')));
    }

    start(txt) {
        this.time = Date.now();
        this.spinner.start(txt);
    }

    stop(txt) {
        // this.time = (Date.now() - this.time) * 0.001;
        this.spinner.stop();
        txt && T.log.yellow(txt);
    }
}

module.exports = {
    LoadProgress,
    LoadingORA,
    cliSpinners
};
