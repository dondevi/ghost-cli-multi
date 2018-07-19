/**
 * =============================================================================
 *  Utils
 * =============================================================================
 *
 * @author dondevi
 * @create 2018-04-16
 */

const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

/**
 * =============================================================================
 *  Puppeteer
 * =============================================================================
 */

async function launchBrowser (main, headless = true) {
  console.log("========== [Puppeteer Sart] ==========");
  const browser = await puppeteer.launch({ headless });
  try {
    await main(browser);
  } catch (exception) {
    console.error(exception);
  } finally {
    headless && await browser.close();
    console.log("========== [Puppeteer Stop] ==========");
  }
};

async function clearPages (browser) {
  const pages = await browser.pages();
  await Promise.all(pages.map(async page => await page.close()));
}

async function intercept (page, type) {
  await page.setRequestInterception(true);
  page.on("request", request => {
    request.resourceType() === type ? request.continue() : request.abort();
  });
}

function timeout (page, time, url) {
  page.waitFor(time).then(() => {
    console.log("!", "[Timeout]", url);
    page.reload();
  });
}

function catchLog (page) {
  page.on("console", message => {
    console.log(message.text());
  });
}

function catchError (page) {
  page.on("pageerror", error => {
    console.error(error);
  });
}

/**
 * =============================================================================
 *  File
 * =============================================================================
 */

function dataExist (datadir, filename) {
  const filepath = path.join(datadir, filename);
  return fs.existsSync(filepath);
}

function readData (datadir, filename) {
  const filepath = path.join(datadir, filename);
  if (fs.existsSync(filepath)) {
    try {
      const file = fs.readFileSync(filepath);
      return JSON.parse(file);
    } catch (exception) {
      console.error(exception);
      return null;
    }
  }
}

function writeData (datadir, filename, data) {
  const filepath = path.join(datadir, filename);
  ensureDirExist(filepath);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

function imageExist (imgdir, imgpath) {
  const filepath = path.join(imgdir, imgpath);
  return fs.existsSync(filepath);
}

function saveImage (imgdir, imgpath, buffer) {
  const filepath = path.join(imgdir, imgpath);
  ensureDirExist(filepath);
  fs.writeFileSync(filepath, buffer);
}

function ensureDirExist (filepath) {
  const dirname = path.dirname(filepath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirExist(dirname);
  fs.mkdirSync(dirname);
}

/**
 * =============================================================================
 *  Util
 * =============================================================================
 */

async function traverseLeaf (nodes, handler, maxLevel = 6, parent = {}) {
  await Promise.all(nodes.map(async node => {
    if (node.children && --maxLevel > 0) {
      await traverseLeaf(node.children, handler, maxLevel, node);
    } else {
      await handler(node, parent);
    }
  }));
}

function flatify (array, handler, ignoreTag, parent = {}) {
  return array.reduce((data, node) => {
    let item = handler(node, parent);
    item && data.push(item);
    let { children, isTag } = node;
    if (ignoreTag ? (children && !isTag) : children) {
      data.push(...flatify(children, handler, ignoreTag, node));
    }
    return data;
  }, []);
}



module.exports = {
  launchBrowser,
  clearPages,
  intercept,
  timeout,
  catchLog,
  catchError,
  dataExist,
  readData,
  writeData,
  imageExist,
  saveImage,
  ensureDirExist,
  traverseLeaf,
  flatify,
};
