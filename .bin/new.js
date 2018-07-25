/**
 * =============================================================================
 *  Generate New Project
 * =============================================================================
 *
 * @author dondevi
 * @create 2018-07-25
 */

const fs = require("fs");
const path = require("path");
const shell = require("shelljs");
const inquirer = require("inquirer");
const Tasker = require("../.lib/tasker.js");
const {
  initProjectConfig,
  initProjectPackage,
  linkProjectApps,
} = require("./init.js");

const path_root = path.resolve(__dirname, "../");
const path_lib = path.resolve(path_root, ".lib");
const path_project = path.resolve(path_root, "projects");

shell.config.silent = true;
shell.config.fatal = true;

(async () => {
  const config = await getConfig();
  new Tasker(`Generate new project "${config.name}"`, [
    { label: "Copy content files", exec: newProject.bind(null, config.name) },
    { label: "Generate config file", exec: initProjectConfig.bind(null, config) },
    { label: "Generate package.json", exec: initProjectPackage.bind(null, config.name) },
    { label: "Symlink apps", exec: linkProjectApps.bind(null, config.name) },
  ]);
})();

/**
 * Generate new project
 */
async function newProject (name) {
  const source = path.resolve(path_lib, "template");
  if (!shell.test("-d", source)) { throw "Ghost not found! Please run `npm run env`."; }
  const target = path.resolve(path_project, name);
  if (shell.test("-d", target)) { return "already exists"; }
  await shell.cp("-R", source, target);
}

async function getConfig () {
  const projects = getProjects();
  console.log("Config for new project:");
  const config = await inquirer.prompt([
    { name: "name", type: "input", validate: name => name && !projects.includes(name) },
    { name: "port", type: "input", default: 2368 + projects.length },
  ]);
  return config;
}

function getProjects () {
  shell.cd(path_project);
  const dirs = fs.readdirSync(".");
  return dirs && dirs.filter(name => {
    if (/^\./.test(name)) { return false; }
    return fs.lstatSync(name).isDirectory();
  }) || [];
}
