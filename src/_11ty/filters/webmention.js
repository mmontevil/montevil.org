const { readFromCache } = require('../../_utils/cache');
const rootUrl = require('../../../package.json').homepage;

const WEBMENTION_CACHE = '_cache/webmentions.json';
let allMemoizedWebmentions = [];
let memoizedWebmentionsPerContent = {};
let memoizedUrls = {};

const getWebmentions = () => {
  if (allMemoizedWebmentions.length == 0) {
    const cached = readFromCache(WEBMENTION_CACHE);
    allMemoizedWebmentions = cached.webmentions;
  }
  return allMemoizedWebmentions;
};

function isSelf(entry) {
  return (
    entry.url.match(/^https:\/\/twitter.com\/MMontevil\//) 
  );
}

function getUrlsHistory(url) {
  if (memoizedUrls[url] === undefined) {
    url = encodeURI(url);
    let urlsList = [`${rootUrl}${url}`];
    let httpRootUrl = rootUrl.replace(/^https:/, 'http:');
    if (
      (parts = url.match(
        /^\/articles\/([0-9]{4})\/([0-9]{2})\/([0-9]{2})\/(.*)\/$/
      ))
    ) {
      // Current permalink: /articles/2018/06/15/users-do-change-font-size/
      // /articles/2018/06/users-do-change-font-size/
      urlsList.push(`${rootUrl}/articles/${parts[1]}/${parts[2]}/${parts[4]}/`);
      urlsList.push(
        `${httpRootUrl}/articles/${parts[1]}/${parts[2]}/${parts[4]}/`
      );
      // /2018/06/users-do-change-font-size/
      urlsList.push(`${rootUrl}/${parts[1]}/${parts[2]}/${parts[4]}/`);
      urlsList.push(`${httpRootUrl}/${parts[1]}/${parts[2]}/${parts[4]}/`);
      // /2018/06/users-do-change-font-size.html
      urlsList.push(`${rootUrl}/${parts[1]}/${parts[2]}/${parts[4]}.html`);
      urlsList.push(`${httpRootUrl}/${parts[1]}/${parts[2]}/${parts[4]}.html`);
    }
    if (
      (parts = url.match(
        /^\/links\/([0-9]{4})\/([0-9]{2})\/([0-9]{2})\/(.*)\/$/
      ))
    ) {
      // Current permalink: /links/2019/12/10/good-enough/
      // /links/2019/12/good-enough/
      urlsList.push(`${rootUrl}/links/${parts[1]}/${parts[2]}/${parts[4]}/`);
      urlsList.push(
        `${httpRootUrl}/links/${parts[1]}/${parts[2]}/${parts[4]}/`
      );
      // /links/2019/12/good-enough.html
      urlsList.push(
        `${rootUrl}/links/${parts[1]}/${parts[2]}/${parts[4]}.html`
      );
      urlsList.push(
        `${httpRootUrl}/links/${parts[1]}/${parts[2]}/${parts[4]}.html`
      );
    }
    memoizedUrls[url] = urlsList;
  }

  return memoizedUrls[url];
}

module.exports = {
  getLatestWebmentions: () => getWebmentions().slice(-50),
  getWebmentionsForUrl: (url) => {
    // TODO: for each URL, we loop through all webmentions, should be optimized
    if (url === undefined) {
      console.log('No URL for webmention matching');
      return [];
    }
    if (memoizedWebmentionsPerContent[url] === undefined) {
      let urlsList = getUrlsHistory(url);
      memoizedWebmentionsPerContent[url] = getWebmentions()
        .filter((entry) => {
          return urlsList.includes(entry['wm-target']);
        })
        .filter((entry) => !isSelf(entry));
    }
    return memoizedWebmentionsPerContent[url];
  },
  webmentionsByType: (mentions, mentionType) => {
    return mentions.filter((entry) => entry['wm-property'] === mentionType);
  },
};
