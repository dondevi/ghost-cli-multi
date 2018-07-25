/**
 * =============================================================================
 *  Data transfer
 * =============================================================================
 *
 * @author dondevi
 * @create 2018-04-17
 *
 * @update 2018-05-15 dondevi
 */

const utils = require("./utils.js");


function set (json) {
  utils.writeData("navs.json", getNavsData(json));
  utils.writeData("tags.json", getTagsData(json));
  utils.writeData("posts.json", getPostsData(json));
  console.log("[Success]", "(transferSet)");
}

function get () {
  const navs = utils.readData("navs.json");
  const tags = utils.readData("tags.json");
  const posts = utils.readData("posts.json");
  console.log("[Success]", "(transferGet)");
  return { navs, tags, posts };
}


function getNavsData (exportData) {
  return utils.flatify(exportData, node => {
    let { label, url, isTag } = node;
    url = url.replace(/[_\+]/g, "-");
    if (isTag) { url = "/tag" + url; }
    return {
      "url": url,
      "label": label
    };
  }, true);
}

function getTagsData (exportData) {
  return utils.flatify(exportData, node => {
    let { label, url, date, isTag } = node;
    if (!isTag) { return null; }
    let slug = url.replace(/[_\+]/g, "-").replace(/\//g, "");
    return {
      "slug": slug,
      "name": label,
      "parent": null,
      "visibility": "public",
      "created_by": null,
      "updated_by": null,
      "meta_title": null,
      "description": null,
      "feature_image": null,
      "meta_description": null
    };
  }, true);
}

const style = utils.readData("style.json");
function getPostsData (exportData) {
  let defaultDate = new Date();
  return utils.flatify(exportData, (node, parent) => {
    let { label, url, content, date, imgs } = node;
    if (!content) { return; }
    let page = !date;
    let slug = null;
    let tags = null;
    let status = "published";
    let published_at = null;
    let feature_image = null;
    if (page) {
      url = url.replace(/[_\+]/g, "-");
      slug = url.replace(/\//g, "");
    } else {
      let match = content.match(/\/content\/images\/[^\\"]+/);
      feature_image = match && match[0];
      tags = parent.url.replace(/[_\+]/g, "-").replace(/\//g, "");
    }
    if (date) {
      published_at = date + "T" + new Date().toISOString().split("T")[1];
    } else {
      published_at = defaultDate.toISOString();
      defaultDate.setMinutes(defaultDate.getMinutes() + 10);
    }
    return {
      "slug": slug,
      "tags": tags,
      "page": page,
      "title": label,
      "status": status,
      "authors": null,
      "published_at": published_at,
      "feature_image": feature_image,
      "mobiledoc": "{" +
        "\"version\":\"0.3.1\",\"markups\":[],\"atoms\":[]," +
        "\"cards\":[[\"card-markdown\",{" +
          "\"cardName\":\"card-markdown\"," +
          "\"markdown\":\"" + content.replace(/"/g, "\\\"") + "\"" +
        "}]]," +
        "\"sections\":[[10,0]]" +
      "}",
      "codeinjection_head": style[slug] || "",
      "codeinjection_foot": "",
      "locale": null,
      "featured": false,
      "plaintext": "",
      "createdBy": null,
      "updated_by": null,
      "publishedBy": null,
      "meta_title": null,
      "meta_description": null,
      "og_image": null,
      "og_title": null,
      "og_description": null,
      "custom_excerpt": null,
      "custom_template": null,
      "twitter_title": null,
      "twitter_image": null,
      "twitter_description": null,
    };
  });
}


module.exports = { set, get };
