/**
 * Develop a project
 * @param {String} name - project name
 */
async function dev (name) {
  shell.env["NODE_ENV"] = name;
  shell.cd(path_ghost);
  shell.exec("nodemon current/index.js");
  //" --watch ${path_root}/${name}/themes/default --ext hbs,js,css"
}

module.exports = dev;
