/**
 * Created by Rodey on 2017/5/15.
 */
const
    T = require('../lib/tools'),
    util = require('util'),
    Add = require('./add'),
    prompt = require('prompt'),
    loadTemplates = require('../_templates.js'),
    cwd = process.cwd();

prompt.message = '\u63d0\u793a';

const projectName = String(T.argv._[1] || T.Path.parse(cwd)['name']);
const to = T.Path.resolve(cwd, String(T.argv._[1]) ? projectName : '');
const from = T.Path.join(__dirname, '..', 'example');

var
    name, ppath, version, dist, user, result = {};

function jeseResult(o){
    console.log(util._extend(result, o));
}






// module.exports = function(){
//
//     prompt.start();
//     prompt.get([{
//         name: 'name',
//         message: '输入项目名称'
//     }], (err, result) => {
//         if(result.name){
//             console.log(result);
//             name = result.name;
//             jeseResult(result);
//             prompt.get([{
//                 name: 'dist',
//                 message: '输入项目简介'
//             }], (err, result) => {
//                 dist = result.dist;
//                 jeseResult(result);
//                 prompt.get([{
//                     name: 'user',
//                     message: '作者'
//                 }], (err, result) => {
//                     user = result.user;
//                     jeseResult(result);
//                 });
//
//             });
//
//         }
//
//     });
//
//
// };