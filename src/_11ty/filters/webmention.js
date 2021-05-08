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
