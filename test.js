#!/usr/bin/env node

var prompt = require('prompt');
var program = require('commander');
var argv = require('minimist')(process.argv.slice(2));
console.log(argv);

/*prompt.start();

prompt.get(['name'], function(err, result){
    console.log(result.name);
});*/

program
    .version('1.0.0')
    .option('-v, --version', 'see version')
    .option('-p, --project', 'assign a project')
    .option('-l, --list', 'list all projects')
    .option('-d, --buildpath', 'cheese build path')
    .option('-f, --projectFile', 'cheese 项目列表文件')
    .parse(process.argv);

console.log(process.cwd());