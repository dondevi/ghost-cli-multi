/**
 * =============================================================================
 *  Initial Projects
 * =============================================================================
 *
 * @author dondevi
 * @create 2018-07-23
 *
 */

const fs = require("fs");
const path = require("path");
const shell = require("shelljs");

const path_root = path.resolve(__dirname, "../");
const path_bin = path.resolve(path_root, ".bin");
const path_lib = path.resolve(path_root, ".lib");
const path_ghost = path.resolve(path_root, ".ghost");
const path_project = path.resolve(path_root, "projects");

shell.config.silent = true;
shell.config.fatal = true;

// async function initProjects () {
//   const projects = getProjects();
//   await Promise.all(projects.map(async project => {
//     await initProject(project);
//   }));
// }

// async function initProject (project) {
//   await initProjectConfig(project);
//   await initProjectPackage(project.name);
//   await linkProjectApps(project.name);
// }

/**
 * Initial config for project
 */
function initProjectConfig (config) {
  const { name, port } = config;
  const source = path.resolve(path_ghost, `config.development.json`);
  if (!shell.test("-e", source)) { throw "Ghost not found! Please run `npm run env`."; }
  const target = path.resolve(path_ghost, `config.${name}.json`);
  if (shell.test("-e", target)) { return "already exists"; }
  const json = require(source);
  json.url = `http://localhost:${port}`;
  json.server.port = port.toString();
  json.database.connection.filename = path.resolve(path_project, name, "data/ghost-dev.db");
  json.paths.contentPath = path.resolve(path_project, name);
  fs.writeFileSync(target, JSON.stringify(json, null, 2));
}

/**
 * Initial package.json for project
 */
function initProjectPackage (name) {
  const target = path.resolve(path_project, `${name}/package.json`);
  if (shell.test("-d", target)) { return "already exists"; }
  const package = {
    "name": name,
    "scripts": {
      "dev": `node ../../.bin/dev.js ${name}`
    }
  };
  fs.writeFileSync(target, JSON.stringify(package, null, 2));
}

/**
 * Initial apps for project
 */
function linkProjectApps (name) {
  const source = path.resolve(path_lib, `apps/navigation`);
  if (!shell.test("-d", source)) { throw "Not found: .bin/apps/navigation"; }
  const target = path.resolve(path_project, `${name}/apps/navigation`);
  if (shell.test("-L", target)) { return "already link before"; }
  shell.ln("-sf", source, target);
}


module.exports = { initProjectConfig, initProjectPackage, linkProjectApps };
