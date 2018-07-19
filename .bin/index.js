/**
 * =============================================================================
 *  Initial Projects
 * =============================================================================
 *
 * @author dondevi
 * @create 2018-05-10
 *
 * @update 2018-05-15 dondevi
 *   1.Add: add(), install(), initConfig(), initApps(), getProjects()
 *   2.Rename: main() to init()
 *   3.Remove: configure()
 * @update 2018-07-10 dondevi
 *   1.Add: dev(), initPackage()
 */

const fs = require("fs");
const path = require("path");
const exec = require("child_process").exec;
const root = path.resolve(__dirname, '../');

/**
 * =============================================================================
 *  API
 * =============================================================================
 */

/**
 * Initial Projects
 */
async function init () {
  const projects = getProjects();
  await override();
  await install();
  await Promise.all(projects.map(async project => {
    await initConfig(project);
    await initApp(project);
  }));
}

/**
 * Add a new project
 * @param {String} project - project name
 */
async function add () {
  const projects = getProjects();
  const project = process.env.NODE_ENV || "new-project";
  await shell(`Add Project: ${project}`,
    `xcopy .bin\\template\\* ${root}\\${project}\\ /E /I`
  );
  await initConfig({ name: project, port: 2368 + projects.length });
  await initPackage(project);
  await initApp(project);

  // const initDatabase = require('./database/index.js').main;
  // await initDatabase(project);
}


/**
 * Develop a project
 * @param {String} project - project name
 */
async function dev (project) {
  process.env.NODE_ENV = project;
  await shell(`Dev Project: ${project}`,
    `cd .ghost && nodemon current/index.js`
    // + ` --watch ${root}/${project}/themes/default --ext hbs,js,css`
  );
}

/**
 * =============================================================================
 *  Business
 * =============================================================================
 */

/**
 * Override files to ghost server
 */
async function override () {
  await shell("Override Files",
    // For Custom Helper
    `copy /Y override\\spec.js .ghost\\current\\node_modules\\gscan\\lib\\ & ` +
    // For Chinese Language
    `copy /Y override\\zh.json .ghost\\current\\core\\server\\translations\\ & ` +
    `copy /Y override\\i18n.js .ghost\\current\\core\\server\\lib\\common\\`
  );
}

/**
 * Run npm install
 */
async function install () {
  await shell(`Init navigation`, `cd apps/navigation && npm install`);
  await shell(`Init poster`, `cd poster && npm install`);
}

/**
 * Initial config for project
 */
async function initConfig (project) {
  let { name, port } = project;
  await shell(`Generate Config: ${name}`,
    `copy /Y .ghost\\config.development.json .ghost\\config.${name}.json`
  );
  let config = require(`.ghost/config.${name}.json`);
  config.url = `http://localhost:${port}`;
  config.server.port = port.toString();
  config.database.connection.filename = path.resolve(root, name, "data/ghost-local.db");
  config.paths.contentPath = path.resolve(root, name);
  fs.writeFileSync(`.ghost/config.${name}.json`, JSON.stringify(config, null, 2));
}

/**
 * Initial package.json for project
 */
async function initPackage (project) {
  const package = JSON.stringify({
    "name": `${project}`,
    "scripts": {
      "dev": `node -e require('../.bin/index.js').dev('${project}')`
    }
  }, null, 2);
  fs.writeFileSync(`${root}/${project}/package.json`, package);
}

/**
 * Initial apps for project
 */
async function initApp (project) {
  await shell(`Symlink Apps`,
    `mklink /D ${root}\\${project}\\apps\\navigation ${root}\\.bin\\apps\\navigation`
  );
}

/**
 * =============================================================================
 *  Util
 * =============================================================================
 */

function getProjects () {
  return fs.readdirSync(root).filter(name => {
    if (/^\./.test(name)) { return false; }
    let source = path.join(root, name);
    return fs.lstatSync(source).isDirectory();
  }).map((name, index) => {
    return { name, port: 2368 + index };
  });
}

/**
 * Excute shell command
 * @param  {String} name    - task name
 * @param  {String} command - shell command
 */
async function shell (name, command) {
  console.error("[Excute]", name);
  return await new Promise((resolve, reject) => {
    const cmd = exec(command, { cwd: __dirname });
    cmd.on("error", error => {
      console.error("[Error]", name, "\n", error);
    });
    cmd.on("exit", error => {
      console.log("[Done]", name);
      resolve();
    });
    cmd.stdout.pipe(process.stdout);
    cmd.stderr.pipe(process.stderr);
  });
}

/**
 * =============================================================================
 *  Export
 * =============================================================================
 */

module.exports = { override, init, add, dev, initPackage, initApp };
