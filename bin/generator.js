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

class Generator{

    constructor(){
        this.strictDef = '\'use strict\';\n';
        this.nameDef = Generator.toFirstUpper(name) + Generator.toFirstUpper(type);
        this.moduleDef = `${ this.strictDef }\n\nexport default class ${ this.nameDef }{\n\tconstructor(){}\n\n}`
    }

    generate(){
        switch(type){
            case 'view':
                this.createModule(); break;
            case 'service':
                this.createService(); break;
            case 'component':
                this.createComponent(); break;
            default:
                T.log.red('× 请指定需要生成的模块类型（ view、service、component ）');
                process.exit(1);
        }
    }

    createModule(){
        let mp = T.Path.resolve(process.cwd(), `src/modules/${name}`),
            mpf = T.Path.join(mp, `${name}View.js`);
        T.fsa.mkdirSync(mp);
        T.fsa.writeFileSync(mpf, this.moduleDef, 'utf8');
        T.log.green(`\n√ mkdir '${mp}' successfully \n√ create file '${mp}' successfully `);
        process.exit(1);
    }

    createService(){
        let mp = T.Path.resolve(process.cwd(), `src/services`),
            mpf = T.Path.join(mp, `${name}.service.js`);
        let str = this.strictDef;
        str += `\nconst\n\tAppService = require('./app.service').getInstance();\n`;
        str += `\nexport default class ${ this.nameDef }{\n\tconstructor(){}\n\n}`;
        T.fsa.writeFileSync(mpf, str, 'utf8');
        T.log.green(`\n√ create file '${mp}' successfully `);
        process.exit(1);
    }

    createComponent(){
        let mp = T.Path.resolve(process.cwd(), `src/components/${name}`),
            mpf = T.Path.join(mp, `${name}Service.js`);
        T.fsa.mkdirSync(mp);
        T.fsa.writeFileSync(mpf, this.moduleDef, 'utf8');
        T.log.green(`\n√ mkdir '${mp}' successfully \n√ create file '${mp}' successfully `);
        process.exit(1);
    }

    static toFirstUpper(str){
        return str.replace(/^([a-z]{1}?)/i, (m, $1) => {
            return $1.toLocaleUpperCase();
        });
    }

    static getInstance(){
        if(!instance || (!instance instanceof Generator)){
            instance = new Generator();
        }
        return instance;
    }

}

module.exports = Generator.getInstance();



