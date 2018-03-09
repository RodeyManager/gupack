const T = require('../lib/tools'),
    downloader = require('download-github-repo'),
    userHome = require('user-home'),
    LoadProgress = require('../lib/loadProgress').LoadProgress;

function downloadTemplateRepo(template) {
    let url = template.url;
    let tempPath = T.Path.resolve(userHome, '.gupack-templates/', url);
    if (!url) throw Error(T.msg.red('Not found template as github'));
    loadPrg = new LoadProgress('Downloading you selected template, Please wait a moment......', '\t');
    loadPrg.start();

    return new Promise((resove, reject) => {
        downloader(url, tempPath, err => {
            err ? reject({ message: '× Download failed' }) : resove({ message: '√ Download Successfully', tempPath });
            loadPrg.stop();
        });
    });
}

module.exports = downloadTemplateRepo;
