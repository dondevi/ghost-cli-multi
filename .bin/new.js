const shell = require("shelljs");
const inquirer = require("inquirer");

module.exports = async function () {
  const projects = await getProjects();
  const project = await inquirer.prompt([
    { name: "name", type: "input" },
    { name: "port", type: "input", default: 2368 + projects.length },
  ]);
  return newProject(project);
};

/**
 * Generate new project
 * @param {Object} config
 */
async function newProject (config) {
  await shell.cp("-R", "../.ghost/content", `../../${config.name}`);
  await initProject(config);
}

async function initProject (config) {
  await initConfig(config);
  await initPackage(config.name);
  await initApp(config.name);
  // const initDatabase = require('../database/index.js').main;
  // await initDatabase(config.name);
}

async function getProjects () {
  const dirs = await fs.readdir(root);
  return dirs.filter(name => {
    if (/^\./.test(name)) { return false; }
    let source = path.join(root, name);
    return fs.lstatSync(source).isDirectory();
  }).map((name, index) => {
    return { name, port: 2368 + index };
  });
}
