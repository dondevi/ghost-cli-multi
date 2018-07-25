/**
 * =============================================================================
 *  Initial Environment
 * =============================================================================
 *
 * @author dondevi
 * @create 2018-07-24
 *
 */

const path = require("path");
const shell = require("shelljs");
const Tasker = require("../.lib/tasker.js");
const { execPromise } = require("../.lib/util.js");

const path_root = path.resolve(__dirname, "../");
const path_bin = path.resolve(path_root, ".bin");
const path_lib = path.resolve(path_root, ".lib");
const path_ghost = path.resolve(path_root, ".ghost");

shell.config.silent = true;
shell.config.fatal = true;

/**
 * Initial Environment for Ghost
 */
new Tasker("Initial Ghost Environment", [
  { label: "Symlink nvm", exec: linkNVM },
  { label: "Install ghost-cli", exec: installGhostCli },
  { label: "Install ghost", exec: installGhost },
  { label: "Override files", exec: override },
  { label: "Npm install", exec: initNpm },
]);

/**
 * Symlink nvm if need
 */
function linkNVM () {
  if (process.platform !== "win32") { return process.platform; }
  const source = shell.env["NVM_SYMLINK"];
  if (!source) { return "nvm not exists"; }
  const target = `${shell.env["APPDATA"]}/npm`;
  const exists = shell.test("-L", target);
  if (exists) { return "already link before"; }
  shell.ln("-sf", source, target);
}

/**
 * Install ghost-cli & nodemon globally
 */
function installGhostCli () {
  return Promise.all([
    Promise.resolve().then(() => {
      if (shell.which("ghost")) { return "already install ghost-cli"; }
      return execPromise("npm install -g ghost-cli");
    }),
    Promise.resolve().then(() => {
      if (shell.which("nodemon")) { return "already install nodemon"; }
      return execPromise("npm install -g nodemon");
    }),
  ]);
}

/**
 * Install ghost locally
 */
function installGhost (version = "1.22.1") {
  const exists = shell.test("-d", path.resolve(path_ghost, "versions"));
  if (exists) { return "already install ghost"; }
  return execPromise(`ghost install ${version} --local --dir=${path_ghost} --db=sqlite3`).then(() => {
    shell.cd(path_ghost).exec("ghost stop");
  });
}

/**
 * Override files to ghost server
 */
function override () {
  shell.cd(path_lib);
  // For Custom Helper - e.g. `apps/navigation`
  shell.cp("override/spec.js", `${path_ghost}/current/node_modules/gscan/lib/`);
  // For Chinese Language
  shell.cp("override/zh.json", `${path_ghost}/current/core/server/translations/`);
  shell.cp("override/i18n.js", `${path_ghost}/current/core/server/lib/common/`);
}

/**
 * Run npm install
 */
function initNpm () {
  return Promise.all([
    Promise.resolve().then(() => {
      shell.cd(`${path_lib}/apps/navigation`);
      const exists = shell.test("-d", "node_modules");
      return !exists && execPromise("npm install");
    }),
    Promise.resolve().then(() => {
      shell.cd(`${path_lib}/poster`);
      const exists = shell.test("-d", "node_modules");
      return !exists && execPromise("npm install");
    }),
  ]);
}
