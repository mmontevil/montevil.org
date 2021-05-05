const memoize = require('fast-memoize');

const { readFromCache } = require('../../_utils/cache');
const rootUrl = require('../../../package.json').homepage;

const WEBMENTION_CACHE = '_cache/webmentions.json';
const TWIT_WEBMENTION_CACHE = '_cache/tweetsMentions.json';
const TWITL_WEBMENTION_CACHE = '_cache/tweetLikeMentions.json';
const RG_WEBMENTION_CACHE = '_cache/rgLikeMentions.json';
const WK_WEBMENTION_CACHE = '_cache/wikiMentions.json';

const getWebmentions = memoize(() => {
  const cached = readFromCache(WEBMENTION_CACHE);
  const cached2 =Object.values(readFromCache(TWIT_WEBMENTION_CACHE));
    const cached3 =Object.values(readFromCache(TWITL_WEBMENTION_CACHE));
    const cached4 =Object.values(readFromCache(RG_WEBMENTION_CACHE));
    const cached5 =Object.values(readFromCache(WK_WEBMENTION_CACHE));

  return cached.webmentions.concat(cached2).concat(cached3).concat(cached4).concat(cached5);
});

function isSelf(entry) {
  return entry.url.match(/^https:\/\/twitter.com\/MMontevil\//) && ! entry.url.match(/\#/) || entry.author.screen_name=="MMontevil";
}

const getUrlsHistory = memoize((url) => {
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
    (parts = url.match(/^\/links\/([0-9]{4})\/([0-9]{2})\/([0-9]{2})\/(.*)\/$/))
  ) {
    // Current permalink: /links/2019/12/10/good-enough/
    // /links/2019/12/good-enough/
    urlsList.push(`${rootUrl}/links/${parts[1]}/${parts[2]}/${parts[4]}/`);
    urlsList.push(`${httpRootUrl}/links/${parts[1]}/${parts[2]}/${parts[4]}/`);
    // /links/2019/12/good-enough.html
    urlsList.push(`${rootUrl}/links/${parts[1]}/${parts[2]}/${parts[4]}.html`);
    urlsList.push(
      `${httpRootUrl}/links/${parts[1]}/${parts[2]}/${parts[4]}.html`
    );
  }

  return urlsList;
});

module.exports = {
  getLatestWebmentions: () => getWebmentions().slice(-50),
  getWebmentionsForUrl: memoize((url) => {
    // TODO: for each URL, we loop through all webmentions, should be optimized
    if (url === undefined) {
      console.log('No URL for webmention matching');
      return [];
    }
    let urlsList = getUrlsHistory(url.toLowerCase());
    return getWebmentions()
      .filter((entry) => {
        return urlsList.includes(entry['wm-target'].toLowerCase());
      })
      .filter((entry) => !isSelf(entry));
  }),
  webmentionsByType: (mentions, mentionType) => {
    return mentions.filter((entry) => entry['wm-property'] === mentionType);
  },
};
