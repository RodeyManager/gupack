
var util = require('util');

var T  = require('../lib/tools');

module.exports = function(){

    var projectList = require('../_projects.json')['projectList'];
    if(util.isObject(projectList) && Object.keys(projectList).length !== 0){
        T.log.green('\n\r' + JSON.stringify(projectList, null, 2));
    }else{
        T.log.red('\n\r  \u6682\u65e0\u9879\u76ee');
    }

};
