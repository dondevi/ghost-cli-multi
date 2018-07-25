/**
 * =============================================================================
 *  Initial Database
 * =============================================================================
 *
 * @author dondevi
 * @create 2018-05-14
 *
 */

const path = require("path");
const cwd = path.resolve(__dirname, "../../");
const ghost = path.resolve(cwd, ".ghost");
const models = require(`${ghost}/current/core/server/models`);

/**
 * @param {String} project - project name
 */
async function main (project) {
  initModels(project);
  await initSettings();
  await initUsers(project, {
    "owner": "Owner",
    "admin": "Administrator",
    "editor": "Editor",
    "author": "Author"
  });
  process.exit(0);
}


function initModels (project) {
  // For `cwd` & `env` in `current/core/server/config/index.js`
  process.chdir(ghost);
  process.env.NODE_ENV = project || process.env.NODE_ENV;
  // For `promisify` in `current/core/server/lib/security/password.js`
  Promise = require(`${ghost}/current/node_modules/bluebird`);
  models.init();
  console.log("[Success]", "(Initial models)")
}

async function initSettings () {
  await models.Settings.edit([
    { key: "active_apps", value: "[\"navigation\"]" },
    { key: "active_theme", value: "default" },
  ]);
  console.log("[Success]", "(DB:setSettings)", "active_apps, active_theme");
}

async function initUsers (project, roles) {
  Object.keys(roles).map(async role => {
    let userData = await models.User.findOne({ email: `${role}@${project}.com` });
    if (userData) { return; }
    let roleData = await models.Role.findOne({ name: roles[role] });
    let options = { context: { internal: true } };
    await models.User.add({
      "name": role,
      "slug": role,
      "email": `${role}@${project}.com`,
      "password": "${your_password_rule}",
      "roles": [roleData.get("id")],
    }, options);
    console.log("[Success]", "(DB:addUser)", role);
  });
}

/**
 * @see current/core/server/api/db.js:113
 */
async function deleteContent () {
  let queryOpts = { columns: "id", context: { internal: true } };
  let collections = [
    models.Post.findAll(queryOpts),
    models.Tag.findAll(queryOpts),
  ];
  console.log("[Doing...]", "(destroy)");
  await Promise.each(collections, Collection => {
    console.log("[Success]", "(DB:clearData)");
    return Collection.invokeThen("destroy", queryOpts);
  });
}

/**
 * @see current/core/server/api/db.js:84
 */
async function importContent (options) {
  let importer = require(`${ghost}/current/core/server/data/importer`);
  let response = await importer.importFromFile(options);
  let problems = response.length === 2 ? response[1].problems : response[0].problems;
  console.log("[Success]", "(DB:importData)");
  return { db: [], problems: problems };
}


module.exports = main;
