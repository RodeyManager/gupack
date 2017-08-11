/**
 * Created by Rodey on 2017/7/27.
 */

'use strict';

const
    extend = require('extend'),
    T      = require('../tools'),
    util   = require('../utils');

class Statics{

    constructor(config){
        this.config = extend(true, {
            testExt: /^\.(html|tpl|jade|md|css|scss|less|styl|vue|jsx)[^\.]*$/i
        }, config || {});
        this._if = true;
        this.hostname = this.config.hostname;
        this.testExt = this.config.testExt;
        this.nodes = this.config.nodes;

        this.init();
    }

    init(){
        this.initProps();
        this.initNodes();
    }

    initProps(){
        for(let key in this.config){
            if(this.config.hasOwnProperty(key)){
                this[key] = this.config[key];
            }
        }
        this.hostname && (this.hostname = Statics.removeLastSlash(this.hostname));
    }

    initNodes(){
        if(util.isArray(this.nodes)){
            this.nodes.forEach(node => {
                if(util.isObject(node)){
                    node.extname = Statics.setTest(node.extname);
                    !!node.hostname && (node.hostname = Statics.removeLastSlash(node.hostname));
                    !!node.pathname && (node.pathname = Statics.removeLastSlash(node.pathname));
                }
            });
        }
    }

    exectureNodes(content){

        this.nodes.forEach(node => {
            let hostname = node.hostname || this.hostname;
            let pathname = node.pathname || '';
            T.pathRegxs.forEach(regx => {
                content = content.replace(regx, (match, $1) =>{
                    if(/^(https?:|\/\/|data:|about:|javascript:|\?|\<|\{|[@#&])/i.test($1)){
                        return match;
                    }
                    let srcExt = T.Path.extname($1.split('?')[0]);
                    if(node.extname.test(srcExt)){
                        return match.replace($1, `${hostname}/${pathname}/${T.getStaticPath($1)}`);
                    }else{
                        return match;
                    }
                });
            });
        });

        content = this.exectureContent(content);

        return content;
    }

    execture(file){
        let extname = T.Path.extname(file.path);
        if(!this._if || !this.testExt.test(extname) || !this.hostname)    return file.contents;

        let content = file.contents.toString('utf8') || T.getFileContent(file.path);

        if(util.isArray(this.nodes)){
            return this.exectureNodes(content);
        }else{
            return this.exectureContent(content);
        }
    }

    exectureContent(content){

        T.pathRegxs.forEach(regx => {
            content = content.replace(regx, (match, $1) => {
                if(/^(https?:|\/\/|data:|about:|javascript:|\?|\<|\{|[@#&])/i.test($1)){
                    return match;
                }
                return match.replace($1, `${this.hostname}/${T.getStaticPath($1)}`);
            });
        });
        return content;
    }

    static setTest(test){
        return util.isRegExp(test) ? test : util.isString(test) ? new RegExp(test, 'gi') : null;
    }
    static removeLastSlash(path){
        return path.replace(/\/+$/i, '');
    }

}

module.exports = Statics;