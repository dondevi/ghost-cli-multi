/**
 * Task excutor
 *
 * @author dondevi
 * @create 2018-07-24
 */

const Logger = require("../.lib/logger.js");
const { execSequence } = require("../.lib/util.js");

class tasker {
  /**
   * @param  {String} title
   * @param  {Array}  tasks
   */
  constructor (title, tasks) {
    const start = Date.now();
    const logger = new Logger(title, tasks);
    logger.start();
    return execSequence(tasks, task => {
      task.status = 1;
      return Promise.resolve(task.exec()).then(message => {
        task.message = [].concat(message).filter(m => m).join(", ");
        task.status = 2;
        task.time = Date.now() - start;
      }).catch(error => {
        task.status = 3;
        return Promise.reject(error);
      });
    }).catch(error => error).then(error => {
      logger.stop();
      error && console.log(error);
    });
  }
}

module.exports = tasker;
