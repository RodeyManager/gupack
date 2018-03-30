/**
 * Created by Rodey on 2016/12/5.
 */

'use strict';
const T = require('./tools'),
    PluginError = require('plugin-error');

function verifyTaskSets(gulp, taskSets, skipArrays) {
    if (taskSets.length === 0) {
        throw new Error('No tasks were provided to run-sequence');
    }
    let foundTasks = {};
    taskSets.forEach(function(t) {
        let isTask = typeof t === 'string',
            isArray = !skipArrays && Array.isArray(t);
        if (!isTask && !isArray) {
            throw new Error('Task ' + t + ' is not a valid task string.');
        }
        if (isTask && !gulp.hasTask(t)) {
            throw new Error('Task ' + t + " is not configured as a task on gulp.  If this is a submodule, you may need to use require('run-sequence').use(gulp).");
        }
        if (skipArrays && isTask) {
            if (foundTasks[t]) {
                throw new Error('Task ' + t + ' is listed more than once. This is probably a typo.');
            }
            foundTasks[t] = true;
        }
        if (isArray) {
            if (t.length === 0) {
                throw new Error('An empty array was provided as a task set');
            }
            verifyTaskSets(gulp, t, true, foundTasks);
        }
    });
}

function runSequence(gulp) {
    if (gulp === undefined) {
        gulp = require('gulp') || require(T.Path.resolve(__dirname, '../node_modules/gulp/index.js'));
    }

    // Slice and dice the input to prevent modification of parallel arrays.
    let taskSets = Array.prototype.slice.call(arguments, 1).map(function(task) {
            return Array.isArray(task) ? task.slice() : task;
        }),
        callBack = typeof taskSets[taskSets.length - 1] === 'function' ? taskSets.pop() : false,
        currentTaskSet,
        finish = function(e) {
            gulp.removeListener('task_stop', onTaskEnd);
            gulp.removeListener('task_err', onError);

            let error;
            if (e && e.err) {
                error = new PluginError('run-sequence(' + e.task + ')', e.err, { showStack: true });
            }

            if (callBack) {
                callBack(error);
            } else if (error) {
                T.log.red(error.toString());
            }
        },
        onError = function(err) {
            finish(err);
        },
        onTaskEnd = function(event) {
            let idx = currentTaskSet.indexOf(event.task);
            if (idx > -1) {
                currentTaskSet.splice(idx, 1);
            }
            if (currentTaskSet.length === 0) {
                runNextSet();
            }
        },
        runNextSet = function() {
            if (taskSets.length) {
                let command = taskSets.shift();
                if (!Array.isArray(command)) {
                    command = [command];
                }
                currentTaskSet = command;
                gulp.start.apply(gulp, command);
            } else {
                finish();
            }
        };

    verifyTaskSets(gulp, taskSets);

    gulp.on('task_stop', onTaskEnd);
    gulp.on('task_err', onError);

    runNextSet();
}

module.exports = runSequence.bind(null, undefined);
module.exports.use = function(gulp) {
    return runSequence.bind(null, gulp);
};
