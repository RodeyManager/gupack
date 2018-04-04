const T = require('../lib/tools'),
    downloader = require('download-github-repo'),
    userHome = require('user-home'),
    LoadingORA = require('../lib/loadProgress').LoadingORA;

function downloadTemplateRepo(template) {
    let url = template.url;
    let tempPath = T.Path.resolve(userHome, '.gupack-templates/', url);
    if (!url) throw Error(T.msg.red('Not found template as github'));
    const loading = new LoadingORA();
    loading.start('→ Downloading you selected template, Please wait a moment......');

    return new Promise((resove, reject) => {
        downloader(url, tempPath, err => {
            err ? reject({ message: '× Download failed' }) : resove({ message: '√ Download Successfully', tempPath });
            loading.stop();
        });
    });
}

module.exports = downloadTemplateRepo;
