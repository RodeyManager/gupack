/**
 * Created by Rodey on 2017/8/14.
 * 模块生成器
 */

'use strict';

const
    T = require('../lib/tools');

const
    args = T.argv._.slice(1);

let type = args[0],
    name = args[1];
if(!type){
    T.log.red('× 请指定需要生成的模块类型');
    process.exit(1);
}
if(!name){
    T.log.red('× 请指定需要生成的模块名称');
    process.exit(1);
}

let instance;

class Generator {

    constructor(){
        this.strictDef = '\'use strict\';\n';
        this.nameDef   = Generator.toFirstUpper(name) + Generator.toFirstUpper(type);
        this.moduleDef = `${ this.strictDef }\n\nexport default class ${ this.nameDef }{\n\tconstructor(){}\n\n}`
    }

    generate(){
        switch(type){
            case 'view':
                this.createView();
                break;
            case 'service':
                this.createService();
                break;
            case 'component':
                this.createComponent();
                break;
            default:
                T.log.red('× 请指定需要生成的模块类型（ view、service、component ）');
                process.exit(1);
        }
    }

    generateView(){
        this.createView();
    }

    generateService(){
        this.createService();
    }

    generateComponent(){
        switch(type){
            case 'default':
                this.createComponent(); break;
            case 'vue':
                this.createVueComponent();
                break;
            case 'react':
                this.createReactComponent();
                break;
            case 'angular' || 'ng':
                this.createAngularComponent();
                break;
            default:
                T.log.red('× 请指定需要生成的组件类型（ vue、react、angular ）');
                process.exit(1);
        }
    }

    createView(){
        let isNg = type === 'angular' || type === 'ng';
        let mp  = T.Path.resolve(process.cwd(), `src/modules/${ Generator.getNamePath(name) }`),
            fn = Generator.getName(name),
            mpf = T.Path.join(mp, `${ fn }View.${ isNg ? 'ts' : 'js'}`);
        T.fsa.mkdirpSync(mp);
        T.fsa.writeFileSync(mpf, isNg ? this.getAngularViewCode() : this.moduleDef, 'utf8');
        T.log.green(`\n√ mkdir '${mp}' successfully \n√ create file '${mp}' successfully `);
        process.exit(1);
    }

    getAngularViewCode(){
        let str = '';
        str += `
import {NgModule, enableProdMode} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import {App} from "../../config/app-config";\n\n
@NgModule({
    imports: [ BrowserModule],
    declarations: [  ],
    providers: [  ],
    bootstrap: [  ]
})
export class ${name}Module{}\n
if(App.env === 'prd'){
    enableProdMode();
}
platformBrowserDynamic().bootstrapModule(${name}Module);
                `;
        return str;
    }

    createService(){
        let isNg = type === 'angular' || type === 'ng';
        let mp  = T.Path.resolve(process.cwd(), `src/services`),
            mpf = T.Path.join(mp, `${name}.service.${ isNg ? 'ts' : 'js'}`);
        let str = this.strictDef;
        str += `\nconst\n\tAppService = require('./app.service');\n`;
        str += `\nexport default class ${ this.nameDef }{\n\tconstructor(){}\n\n}`;
        T.fsa.writeFileSync(mpf, isNg ? this.getAngularServiceCode() : str, 'utf8');
        T.log.green(`\n√ create file '${mp}' successfully `);
        process.exit(1);
    }

    getAngularServiceCode(){
        let str = '';
        str += `
import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import 'rxjs/add/operator/toPromise';
import {App} from '../config/app-config';\n
@Injectable()
export class ${ Generator.toFirstUpper(name) }Service{\n
    url: string = App.getWebServiceUrl('${ name }');
    constructor(private http: Http){}\n
    getData(){
        return this.http.post(this.url, {  })
            .toPromise()
            .then(res => res.json())
            .catch(this.handlerError);
    }\n
    handlerError(err){
        console.log(err);
    }\n
}`;
        return str;
    }

    createComponent(){
        let mp     = T.Path.resolve(process.cwd(), `src/components/${name}`),
            mphtml = T.Path.join(mp, `${name}.html`),
            mpjs   = T.Path.join(mp, `${name}.js`),
            mpcss  = T.Path.join(mp, `${name}.css`);
        T.fsa.mkdirpSync(mp);
        T.log.green(`\n√ mkdir '${mp}' successfully`);
        T.fsa.writeFileSync(mphtml, `<incluede src="./${name}.css"></incluede><div class="${name}-component"></div>`, 'utf8');
        T.log.green(`√ create file '${mphtml}' successfully `);
        T.fsa.writeFileSync(mpjs, `${this.strictDef}\nexport default class ${name}Component{\nconstructor(){}\n}`, 'utf8');
        T.log.green(`√ create file '${mpjs}' successfully `);
        T.fsa.writeFileSync(mpcss, '', 'utf8');
        T.log.green(`√ create file '${mpcss}' successfully `);
        process.exit(1);
    }

    createVueComponent(){
        let mp    = T.Path.resolve(process.cwd(), `src/components/${ Generator.getNamePath(name) }`),
            fn    = Generator.getName(name),
            mpvue = T.Path.join(mp, `${fn}.vue`),
            mpcss = T.Path.join(mp, `${fn}.css`);
        let str   = `<style src="./${fn}.css" scoped></style>\n<template>\n\n</template>\n\n<script>\n\texport default {\n\t\tname: '${fn}',\n\t\tdata () {\n\t\t\treturn {}\n\t\t},\n\t\tcomponents: {}\n\t}\n</script>`;
        T.fsa.mkdirpSync(mp);
        T.log.green(`\n√ mkdir '${mp}' successfully`);
        T.fsa.writeFileSync(mpvue, str, 'utf8');
        T.log.green(`√ create file '${mpvue}' successfully `);
        T.fsa.writeFileSync(mpcss, '', 'utf8');
        T.log.green(`√ create file '${mpcss}' successfully `);
        process.exit(1);
    }

    createReactComponent(){
        let mp      = T.Path.resolve(process.cwd(), `src/components/${ Generator.getNamePath(name) }`),
            fn      = Generator.getName(name),
            mpreact = T.Path.join(mp, `${fn}.jsx`),
            mpcss   = T.Path.join(mp, `${fn}.css`);
        let str     = `\n\nclass ${ Generator.toFirstUpper(fn) } extends React.Component {\n\trender() {}\n}\n\nmodule.exports = ${ Generator.toFirstUpper(fn) };`;
        T.fsa.mkdirpSync(mp);
        T.log.green(`\n√ mkdir '${mp}' successfully`);
        T.fsa.writeFileSync(mpreact, str, 'utf8');
        T.log.green(`√ create file '${mpreact}' successfully `);
        T.fsa.writeFileSync(mpcss, '', 'utf8');
        T.log.green(`√ create file '${mpcss}' successfully `);
        process.exit(1);
    }

    createAngularComponent(){
        let mp     = T.Path.resolve(process.cwd(), `src/components/${ name }`),
            fn     = Generator.getName(name),
            fnc    = fn + '.component',
            mpts   = T.Path.join(mp, `${fnc}.ts`),
            mphtml = T.Path.join(mp, `${fnc}.html`),
            mpcss  = T.Path.join(mp, `${fnc}.css`);

        let str = `import { Component } from '@angular/core';\n\n@Component({\n\tselector: '${fn}',\n\ttemplateUrl: './${fnc}.html',\n\tentryComponents: [  ]\n})\nexport class ${ Generator.toFirstUpper(fn) }Component{\n\n\tconstructor(){}\n\n}`;

        T.fsa.mkdirpSync(mp);
        T.log.green(`\n√ mkdir '${mp}' successfully`);
        T.fsa.writeFileSync(mpts, str, 'utf8');
        T.log.green(`√ create file '${mpts}' successfully `);
        T.fsa.writeFileSync(mphtml, '', 'utf8');
        T.log.green(`√ create file '${mphtml}' successfully `);
        T.fsa.writeFileSync(mpcss, '', 'utf8');
        T.log.green(`√ create file '${mpcss}' successfully `);
        process.exit(1);
    }

    static toFirstUpper(str){
        return str.replace(/^([a-z]{1}?)/i, (m, $1) =>{
            return $1.toLocaleUpperCase();
        });
    }

    static getName(name){
        let ns = name.split(/[\/\.]/i);
        return ns[ns.length - 1];
    }

    static getNamePath(name){
        let ns = name.split(/[\/\.]/i);
        ns.splice(-1, 1);
        return ns.join('/');
    }

    static getInstance(){
        if(!instance || (!instance instanceof Generator)){
            instance = new Generator();
        }
        return instance;
    }

}

module.exports = Generator.getInstance();




