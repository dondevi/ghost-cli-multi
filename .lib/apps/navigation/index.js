/**
 * =============================================================================
 *  Custom Navigation
 * =============================================================================
 * @see https://github.com/TryGhost/Ghost/wiki/Apps-Getting-Started-for-Ghost-Devs
 * @warn Must code ES5 for node-6-slim !!
 *
 * @author dondevi
 * @create 2018-04-01
 *
 * @todo 2018-04-19 dondevi
 *   1.Rebuild
 *
 * @update 2018-04-05 dondevi
 *   1.Update: Impletement
 * @update 2018-04-09 dondevi
 *   1.Update: `curSlug` for `tag` & `post`
 * @update 2018-04-19 dondevi
 *   1.Fixed: `treefy()`
 * @update 2018-04-20 dondevi
 *   1.Update: Change es6/7 to es5 for node:6-slim
 */

var app = require("ghost-app");

module.exports = app.extend({
  activate: function (ghost) {
    ghost.helpers.register("primary_slug", this.HELPER_primary_slug);
    ghost.helpers.register("nav_tree", this.HELPER_nav_tree);
  },
  HELPER_primary_slug: function (options) {
    var root = options.data.root;
    var any = options.hash.any;
    var curUrl = root.relativeUrl;
    var curTag = root.tag || root.post && root.post.primary_tag;
    var curSlug = curTag ? curTag.slug : slugify(curUrl);
    if (!curSlug) { return ""; }
    var primary_slug = curSlug.split("-")[0];
    if (any) {
      return any.split(",").includes(primary_slug) ? options.fn() : "";
    }
    return primary_slug;
  },
  HELPER_nav_tree: function (options) {
    var blog = options.data.blog;
    var root = options.data.root;
    var limit = options.hash.limit;
    var navs = blog.navigation;
    if (navs.length === 0) { return ""; }
    var curUrl = root.relativeUrl;
    var curTag = root.tag || root.post && root.post.primary_tag;
    var curSlug = curTag ? curTag.slug : slugify(curUrl);
    navs = JSON.parse(JSON.stringify(navs));
    navs.forEach(function (nav) {
      nav.slug = slugify(nav.url);
      nav.active = curSlug.includes(nav.slug);
      nav.current = isCurrent(nav.url, curUrl);
      nav.level = nav.slug.split(/[-#]/).length;
    });
    if (limit !== "all") {
      navs = navs.filter(function (nav) {
        return nav.slug.split(/[-#]/)[0] === curSlug.split(/[-#]/)[0];
      });
    }
    return options.fn({ data: treefy(navs) });
  },
});


function treefy (navs, tree = {}, level = 1) {
  for (var i = 0, nav = null; nav = navs[i]; i++) {
    if (nav.level !== level) { continue; }
    attachTree(tree, navs.splice(i--, 1)[0]);
  }
  if (navs.length) {
    return treefy(navs, tree, level + 1);
  }
  return arrayfy(tree);
}

function attachTree (tree, nav) {
  var { slug } = nav;
  for (var key in tree) {
    if (slug === key) {
      return console.warn("[Warn]", "Duplicate nav:", slug);
    }
    if (0 !== slug.indexOf(key)) { continue; }
    var children = tree[key].children;
    if (children) {
      attachTree(children, nav);
    } else {
      children = tree[key].children = {};
      children[slug] = nav;
    }
    return;
  }
  tree[slug] = nav;
}

function isCurrent (navUrl, currentUrl) {
  if (!currentUrl) { return false; }
  var strippedHref = navUrl.replace(/\/+$/, "");
  var strippedCurrentUrl = currentUrl.replace(/\/+$/, "");
  return strippedHref === strippedCurrentUrl;
}

function arrayfy (tree) {
  return Object.keys(tree).map(key => {
    var item = tree[key];
    if (item && item.children) {
      item.children = arrayfy(item.children);
    }
    return item;
  }).filter(function (el) { return el; });
}

function slugify (url) {
  return url.replace(/^\/|\/$/g, "").split("/").pop()
            .toLowerCase().replace(/\//g, "-");
}
