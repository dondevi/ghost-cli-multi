/**
 * CLi Logger
 *
 * @author dondevi
 * @create 2018-07-24
 *
 * @todo rebuild
 */

const chalk = require("chalk");

class Logger {

  /**
   * @param  {String} title
   * @param  {Array}  tasks
   */
  constructor (title, tasks) {
    this.title = chalk.bold.cyan(title);
    this.tasks = tasks.map((task, index) => {
      task.prefix = `[${index + 1}/${tasks.length}]`;
      return task;
    });
    // { 0: "wait", 1: "run", 2: "done", 3: "fail" }
    this.colors = ["gray", "yellow", "green", "red"];
  }

  /**
   * @param  {Number} interval
   */
  start (interval = 100) {
    this.result = "";
    this.play();
    this.timer = setInterval(() => this.play(), interval);
  }

  play () {
    let info = this.tasks.map(task => {
      let { prefix, label, status = 0, message = "", time = "" } = task;
      let color = this.colors[status];
      switch (status) {
        case 0: break;
        case 1: time = " ..."; break;
        case 2: time = ` ${time}ms`; message = message && chalk.gray(` (${message})`); break;
        case 3: this.result = chalk.red(` [failed]`); break;
      }
      return chalk[color](`${prefix} ${label}`) + time + message;
    }).join("\n");
    process.stdout.write("\u001b[0;0H" + this.title + this.result + "\n" + info);
  }

  stop () {
    clearInterval(this.timer);
    this.play();
    this.timer = -1;
    console.log("\n");
  }

}

module.exports = Logger;
