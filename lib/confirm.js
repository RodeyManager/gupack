/**
 * Created by r9luox on 2016/5/25.
 */

var readline = require('readline');

function confirm(msg, callback) {
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question(msg, function (input) {
        rl.close();
        callback(/^y|yes|ok|true$/i.test(input));
    });
}

module.exports = confirm;