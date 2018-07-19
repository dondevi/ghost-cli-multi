/**
 * =============================================================================
 *  Post json data to Ghost admin
 * =============================================================================
 *
 * @author dondevi
 * @create 2018-05-15
 */

const path = require("path");
const utils = require("./utils.js");
const transfer = require("./transfer.js");

/**
 * @param  {String} project - Project name
 * @param  {Object} json    - Project data
 */
async function main (project, json) {
  const datas = transfer(json);
  utils.launchBrowser(async browser => {
    const page = await browser.newPage();
    utils.catchLog(page);
    utils.catchError(page);
    await login(page, project);
    await post(page, datas);
  });
}

async function login (page, project) {
  const { port } = project;
  const host = `http://localhost:${port}/ghost`;
  await page.goto(`${host}/#/signin`);
  await page.waitFor("#login");
  await page.type("#login input[name=identification]", "${your_username}");
  await page.type("#login input[name=password]", "${your_password}");
  await page.click("#login button[type=submit]");
  await page.waitFor(".gh-nav");
  console.log("[Success]", "(login)", host);
}

async function post (page, datas) {
  const script = path.resolve(__dirname, "script.js");
  await page.addScriptTag({ path: script });
  await page.evaluate(async datas => {
    const { navs, tags, posts } = datas;
    await window.deleteAllContent();
    await navs && window.setNavs(navs);
    await tags && window.setTags(tags);
    await posts && window.setPosts(posts);
  }, datas);
}


module.exports = { main };
