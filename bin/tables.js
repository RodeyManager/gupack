// const Table = require('cli-table');
// const fs = require('fs');

// const chars = {
//   right: ''
// };

// const optionTable = new Table({
//   head: ['Option', 'Description'],
//   colWidths: [25, 60],
//   chars
// });
// optionTable.push(['-c, --clear-dest', '清空编译目录']);
// optionTable.push(['-d, --dest', '指定编译后的输出路径']);
// optionTable.push(['-e, --env', '设置环境']);
// optionTable.push([
//   '-o, --open-browser',
//   '启动内置静态服务器是否打开默认浏览器'
// ]);
// optionTable.push(['-s, --server', '是否启动内置静态服务器']);
// optionTable.push(['-t, --task', '指定编译任务']);
// optionTable.push(['-w, --watch', '编译时监听文件变化']);
// optionTable.push(['-w, --watch', '编译时监听文件变化']);

// optionTable.push(['-C, --clear-templates', '清除项目模板']);
// optionTable.push(['-D, --download-template', '下载项目模板']);
// optionTable.push(['-T, --template', '新建项目时指定模板']);

// optionTable.push(['--skip-backup', '部署时跳过备份']);
// optionTable.push([
//   '--backup-date',
//   '指定备份版本所在的日期(*项目根目录必须存在backup.json)'
// ]);
// optionTable.push([
//   '--backup-name',
//   '直接指定备份名称(*项目根目录必须存在backup.json)'
// ]);
// optionTable.push(['-r, --remove-backup', '指定清除备份']);
// optionTable.push(['-m, --message', '备注信息']);
// optionTable.push(['--out-path', '指定备份输出路径']);
// optionTable.push(['--mode', '指定备份模式(local:本地; remote:远程)']);
// optionTable.push(['--log', '指定备份打印方式(all | progress)']);
// optionTable.push(['-f, --gupackfile', '指定配置文件']);
// optionTable.push(['--host', '服务器主机']);
// optionTable.push(['--port', '服务器端口']);
// optionTable.push(['--liveDelay', '热更新延迟时间，单位ms']);

// const commandTable = new Table({
//   head: ['Command', 'description'],
//   colWidths: [10, 10],
//   chars
// });

// commandTable.push(['create', '<name> create new project\n-T, --Template']);
// commandTable.push(['build', '<name?> build project\n-e, --env']);
// commandTable.push(['task', '<taskName?> excute task']);
// commandTable.push([
//   'start',
//   'setup simple built-in http server\n-o, --open-browser'
// ]);
// commandTable.push(['deploy', 'deploy project to service\n--skip-backup']);

// commandTable.push([
//   'backup',
//   'backup from service\n--out-path \n--name \n--log \n--mode \n-r, --remove-backup'
// ]);
// commandTable.push([
//   'rollback',
//   'rollback from backup\n--backup-date \n--backup-name'
// ]);
// commandTable.push(['test', '<testName[fileName]>用例测试']);

// module.exports = {
//   optionTable: optionTable.toString().replace(/[\s\n]*$/g, ''),
//   commandTable: commandTable.toString().replace(/[\s\n]*$/g, '')
// };
