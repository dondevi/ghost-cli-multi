/**
 * =============================================================================
 *  Run Rroject
 * =============================================================================
 *
 * @author dondevi
 * @create 2018-07-25
 */

const path = require("path");
const shell = require("shelljs");

const path_root = path.resolve(__dirname, "../");
const path_ghost = path.resolve(path_root, ".ghost");

dev(process.argv[2])

function dev (name) {
  shell.env["NODE_ENV"] = name;
  shell.cd(path_ghost);
  shell.exec("nodemon current/index.js");
  //" --watch ${path_root}/projects/${name}/themes/default --ext hbs,js,css"
}
