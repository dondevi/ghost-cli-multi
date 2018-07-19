/**
 * =============================================================================
 *  Scripts will be injected to Ghost admin
 * =============================================================================
 *
 * @author dondevi
 * @create 2018-04-16
 */

const headers = getHeaders();


/**
 * =============================================================================
 *  Clear
 * =============================================================================
 */

async function deleteAllContent (navs) {
  let url = "/ghost/api/v0.1/db/";
  await ajaxDelete(url);
  console.log("[Success]", "(deleteAllContent)");
}

/**
 * =============================================================================
 *  Set
 * =============================================================================
 */

async function setNavs (navs) {
  let url = "/ghost/api/v0.1/settings/";
  let data = await getSettings();
  let navSetting = data.find(item => item.key === "navigation");
  if (JSON.stringify(navSetting.value) !== JSON.stringify(navs)) {
    navSetting.value = JSON.stringify(navs);
    await ajaxPut(url, { settings: data });
    console.log("[Success]", "(setNavs)");
  }
}

async function setTags (tags) {
  let url = "/ghost/api/v0.1/tags/";
  let existTags = await getTags();
  // tags = tags.filter(tag => {
  //   return !existTags.find(existTag => existTag.slug === tag.slug);
  // });
  // if (tags[0]) {
    await Promise.all(tags.map(async tag => {
      await ajaxPost(url, { tags: [tag] });
      console.log("[Success]", "(setTag)", tag.name, tag.slug);
    }));
    console.log("[Success]", "(setTags)");
  // }
}

async function setPosts (posts) {
  let url = "/ghost/api/v0.1/posts/?include=authors,tags,authors.roles";
  let users = await getUsers();
  let tags = await getTags();
  await Promise.all(posts.map(async post => {
    if (post.page) {
      post.authors = users.filter(user => /admin|editor/.test(user.name));
    } else {
      post.authors = users.filter(user => /editor|author/.test(user.name));
      post.slug = await getSlug(post.title);
      post.tags = tags.filter(tag => tag.slug === post.tags);
    }
    await ajaxPost(url, { "posts": [post] });
    console.log("[Success]", "(setPost)", post.title);
  }));
  console.log("[Success]", "(setPosts)");
}

/**
 * =============================================================================
 *  Get
 * =============================================================================
 */

async function getSettings () {
  let url = "/ghost/api/v0.1/settings/";
  let json = await ajaxGet(url);
  let settings = json.settings.map(item => {
    if (!/active_theme|active_apps|installed_apps/.test(item.key)) {
      return { key: item.key, value: item.value };
    }
  }).filter(item => item);
  console.log("[Success]", "(getSettings)");
  return settings;
}

async function getUsers () {
  let url = "/ghost/api/v0.1/users/?limit=all&include=roles";
  let json = await ajaxGet(url);
  console.log("[Success]", "(getUsers)");
  return json.users;
}

async function getTags () {
  let url = "/ghost/api/v0.1/tags/?limit=all";
  let json = await ajaxGet(url);
  console.log("[Success]", "(getTags)");
  return json.tags;
}

async function getSlug (title) {
  let url = "/ghost/api/v0.1/slugs/post/";
  let json = await ajaxGet(url + title + "/");
  console.log("[Success]", "(getSlug)", title);
  return json.slugs[0].slug;
}


/**
 * =============================================================================
 *  Ajax
 * =============================================================================
 */

function ajaxGet (url) {
  let headers = getHeaders();
  return new Promise((resolve, reject) => {
    $.ajax({ method: "GET", headers, url })
      .done(resolve).fail(reject);
  });
}

function ajaxDelete (url) {
  let headers = getHeaders();
  return new Promise((resolve, reject) => {
    $.ajax({ method: "DELETE", headers, url })
      .done(resolve).fail(reject);
  });
}

function ajaxPost (url, data) {
  return new Promise((resolve, reject) => {
    $.ajax({ method: "POST", headers, url, data: window.JSON.stringify(data) })
      .done(resolve).fail(reject);
  });
}

function ajaxPut (url, data) {
  return new Promise((resolve, reject) => {
    $.ajax({ method: "PUT", headers, url, data: window.JSON.stringify(data) })
      .done(resolve).fail(reject);
  });
}

function getHeaders () {
  return {
    "App-Pragma": "no-cache",
    "Authorization": getAuth(),
    "Content-Type": "application/json; charset=UTF-8",
    "X-Ghost-Version": "1.22",
  };
}

function getAuth () {
  try {
    let session = window.localStorage.getItem("ghost:session");
    let { token_type, access_token } = window.JSON.parse(session).authenticated;
    return [token_type, access_token].join(" ");
  } catch (exception) {
    console.error(exception);
  }
}
