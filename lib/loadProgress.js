/**
 * Created by Rodey on 2017/10/24
 */

const cliSpinners = require('cli-spinners'),
      inquirer    = require('inquirer'),
      T           = require('./tools');

class LoadProgress {
    constructor(startText, endText){
        this.startText = startText;
        this.endText   = endText;
        this._type = 'bouncingBar';
        this._frames   = cliSpinners[this._type].frames;
        this._interval = cliSpinners[this._type].interval;
        this.loader    = this._frames.map(s => T.msg.yellow(`${s} ${this.startText}`));
        this.index     = 0;
        this.stin      = null;
        this.init();
    }

    init(){
        return this;
    }

    get frames(){
        return this._frames;
    }

    set frames(fams){
        this._frames = fams;
        this.loader  = this._frames.map(s => T.msg.yellow(`${s} ${this.startText}`));
    }

    get interval(){
        return this._interval;
    }
    set interval(val){
        this._interval = val;
    }

    get type(){
        return this._type;
    }
    set type(type){
        this._type = type;
        let spinner = cliSpinners[type];
        if(spinner){
            this.frames = spinner.frames;
            this.interval = spinner.interval;
        }
    }

    start(){
        this.ui   = new inquirer.ui.BottomBar({bottomBar: this.loader[this.index % this.loader.length]});
        this.stin = setInterval(() =>{
            this.ui.updateBottomBar(this.loader[this.index++ % this.loader.length]);
        }, this._interval);
        return this;
    }

    stop(){
        clearInterval(this.stin);
        this.index = 0;
        this.ui.updateBottomBar(T.msg.green(this.endText) + '\n');
        return this;
    }

    close(){
        this.stop();
        this.ui = null;
        delete this.ui;
        process.exit();
    }

}

module.exports = {
    LoadProgress,
    cliSpinners
};