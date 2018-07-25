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

const path_root = path.resolve(__dirname, '../../');
const path_bin = `${path_root}/.bin`;
const path_ghost = `${path_bin}/.ghost`;


async function initProjects () {
  const projects = getProjects();
  await Promise.all(projects.map(async project => {
    await initProject(project);
  }));
}

async function initProject (project) {
  await initProjectConfig(project);
  await initProjectApp(project);
}

/**
 * Initial config for project
 */
async function initProjectConfig (project) {
  shell.cd(path_ghost);
  const { name, port } = project;
  const config = require(`config.development.json`);
  config.url = `http://localhost:${port}`;
  config.server.port = port.toString();
  config.database.connection.filename = path.resolve(path_root, name, "data/ghost-local.db");
  config.paths.contentPath = path.resolve(path_root, name);
  await fs.writeFile(`config.${name}.json`, JSON.stringify(config, null, 2));
}

/**
 * Initial package.json for project
 */
async function initProjectPackage (name) {
  const package = JSON.stringify({
    "name": name,
    "scripts": {
      "dev": `node ${path_bin}/command/dev.js ${name}`
    }
  }, null, 2);
  await fs.writeFile(`${path_root}/${name}/package.json`, package);
}

/**
 * Initial apps for project
 */
function initProjectApp (name) {
  shell.ln("-sf", `${path_root}/.bin/apps/navigation`, `${path_root}/${name}/apps/navigation`);
}
