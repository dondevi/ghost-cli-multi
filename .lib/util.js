/**
 * @author dondevi
 * @create 2018-07-25
 */

const shell = require("shelljs");

/**
 * Promisify exec() of shelljs
 * @param  {String} command
 * @return {Promise}
 */
function execPromise (command) {
  return new Promise((resolve, reject) => {
    shell.exec(command, (code, stdout, stderr) => {
      code === 0 ? resolve() : reject(stderr);
    });
  });
}

/**
 * Execute tasks in sequence
 * @param  {Array}    tasks
 * @param  {Function} handler
 * @return {Promise}
 */
function execSequence (tasks, handler) {
  return tasks.reduce((promise, task) => {
    return promise.then(() => handler(task));
  }, Promise.resolve());
}

module.exports = { execPromise, execSequence };
