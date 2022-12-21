require('dotenv').config();
const request = require('request-promise');
const bent = require('bent');
const getstring = bent('string');
const { promises: fs } = require('fs');
const syncFs = require('fs');
const moment = require('moment');
let day = moment().format('YYYY-MM-DD');
import { DOMParser, parseHTML } from 'linkedom';
function JSDOM(html) {
  return parseHTML(html);
}
//const { writeToCache, readFromCache } = require('../src/_utils/cache');

async function getTweet(tweetId, target, source) {
  // if we using cache and not cache busting, check there first

  // if we have env variables, go get tweet
  if (hasAuth()) {
    let changed = false;
    let cachedTweet = cachedTweets[tweetId];
    let tweetViewModel = {};
    if (cachedTweet) {
      tweetViewModel = cachedTweet;
    } else {
      let liveTweet = await fetchTweet(tweetId);
      tweetViewModel = processTweet(liveTweet, target, source);
      changed = true;
      cachedTweets[tweetViewModel['id_str']] = tweetViewModel;
    }
    const deletedTweets=['1257446833674125315',
'1274042713973940224',
 '1274390945623085057',
'903698254621274112',
'903700965777428481',
'1533431697546661890',
'173871051674103808',
                         '1366912406887096320',
                         '1457470327655649286'
                        ]; 
    if (tweetViewModel['wm-property'] == 'mention-of') {
      if (tweetViewModel['retweetUpdated'] !== day && !deletedTweets.includes(tweetId)) {
        let livereTweet = await fetchreTweet(tweetId);

        if (livereTweet) {
          tweetViewModel['retweetUpdated'] = day;
        } else {
          tweetViewModel['retweetUpdated'] = '2019-01-01';
        }

        //console.log(tweetViewModel)
        changed = true;
        cachedTweets[tweetViewModel['id_str']] = tweetViewModel;
        if (livereTweet) {
          for (let i in livereTweet) {
            let tweetViewModel2 = processTweet(livereTweet[i], target, source);
            cachedTweet = cachedTweets[tweetViewModel2['id_str']];
            if (!cachedTweet) {
              changed = true;
              cachedTweets[tweetViewModel2['id_str']] = tweetViewModel2;
            }
          }
        }
      }
    }
    if (changed) {
      //   await saveCache( options)
      console.log('save tweet ' + tweetId);
    }
    return null;
  } else {
    console.warn(
      'Remember to add your twitter credentials as environement variables'
    );
    console.warn(
      'Read More at https://github.com/KyleMit/eleventy-plugin-embed-tweet#setting-env-variables'
    );
    // else continue on
  }

  return null;
}

/* Twitter API Call */
function hasAuth() {
  return (
    process.env.TOKEN &&
    process.env.TOKEN_SECRET &&
    process.env.CONSUMER_KEY &&
    process.env.CONSUMER_SECRET
  );
}

function getAuth() {
  let oAuth = {
    token: process.env.TOKEN,
    token_secret: process.env.TOKEN_SECRET,
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
  };
  return oAuth;
}

async function fetchTweet(tweetId) {
  // fetch tweet
  let apiURI = `https://api.twitter.com/1.1/statuses/show/${tweetId}.json?tweet_mode=extended`;
  let auth = getAuth();

  try {
    let response = await request.get(apiURI, { oauth: auth });
    let tweet = JSON.parse(response);
    //console.log(tweet)
    return tweet;
  } catch (error) {
    // unhappy path - continue to other fallbacks
    if (error.statusCode==429 ){
      console.log("Twitter Rate limit");
    }else{
    console.log(error);
    }
    return {};
  }
}

async function fetchreTweet(tweetId) {
  // fetch tweet
  let apiURI = `https://api.twitter.com/1.1/statuses/retweets/${tweetId}.json?tweet_mode=extended`;
  let auth = getAuth();

  try {
    let response = await request.get(apiURI, { oauth: auth });
    let tweets = JSON.parse(response);
    //console.log(tweet)
    return tweets;
  } catch (error) {
    if (error.statusCode==429 ){
      console.log("Twitter Rate limit");
    }else{
    console.log(error);
    }
 //   console.log(error);
    return false;
  }
}

/* transform tweets */
function processTweet(tweet, target, source) {
  // parse complicated stuff
  let images = getTweetImages(tweet);
  let created_at = getTweetDates2(tweet);
  let htmlText = getTweetTextHtml(tweet);

  // destructure only properties we care about
  let { id_str, favorite_count, full_text, retweeted_status } = tweet;
  let { name, screen_name, profile_image_url_https, url } = tweet.user;
  let type = 'card';
  let photo = profile_image_url_https;
  if (!url) {
    url = 'https://twitter.com/' + screen_name;
  }
  let author = { type, name, screen_name, photo, url };
  let text = full_text;
  let value = htmlText;
  let html = htmlText;
  let content = { 'content-type': 'text/html', value, html, text };
  type = 'entry';
  url = 'https://twitter.com/' + screen_name + '/status/' + id_str;
  let published = created_at;
  let wmreceived = published;
  let wmid = id_str;
  name = full_text;
  let wmproperty = 'mention-of';
  if (retweeted_status) wmproperty = 'repost-of';

  // build tweet with properties we want
  let tweetViewModel = {
    id_str,
    type,
    author,
    url,
    published,
    'wm-received': wmreceived,
    'wm-id': wmid,
    name,
    content,
    'wm-source': source,
    'wm-target': target,
    'mention-of': target,
    'repost-of': target,
    'wm-property': wmproperty,
    'wm-private': false,
    images,
    favorite_count,
  };

  return tweetViewModel;
}

function getTweetImages(tweet) {
  let images = [];
  for (let media of tweet.entities.media || []) {
    images.push(media.media_url_https);
  }
  return images;
}

function getTweetDates(tweet) {
  let moment = require('moment');

  // parse
  let dateMoment = moment(tweet.created_at, 'ddd MMM D hh:mm:ss Z YYYY');

  // format
  let display = dateMoment.format('hh:mm A · MMM D, YYYY');
  let meta = dateMoment.utc().format('MMM D, YYYY hh:mm:ss (z)');

  return { display, meta };
}

function getTweetDates2(tweet) {
  let moment = require('moment');

  // parse
  let dateMoment = moment(tweet.created_at, 'ddd MMM D hh:mm:ss Z YYYY');

  // format
  let meta = dateMoment.utc().format('YYYY-MM-DDThh:mm:ssZ');

  return meta;
}

function getTweetTextHtml(tweet) {
  let replacements = [];

  // hashtags
  for (let hashtag of tweet.entities.hashtags || []) {
    let oldText = getOldText(tweet.full_text, hashtag.indices);
    let newText = `<a href="https://twitter.com/hashtag/${oldText.substr(
      1
    )}">${oldText}</a>`;
    replacements.push({ oldText, newText });
  }

  // users
  for (let user of tweet.entities.user_mentions || []) {
    let oldText = getOldText(tweet.full_text, user.indices);
    let newText = `<a href="https://twitter.com/${oldText.substr(
      1
    )}">${oldText}</a>`;
    replacements.push({ oldText, newText });
  }

  // urls
  for (let url of tweet.entities.urls || []) {
    let oldText = getOldText(tweet.full_text, url.indices);
    let newText = `<a href="${url.expanded_url}">${url.expanded_url.replace(
      /https?:\/\//,
      ''
    )}</a>`;
    replacements.push({ oldText, newText });
  }

  // media
  for (let media of tweet.entities.media || []) {
    let oldText = getOldText(tweet.full_text, media.indices);
    let newText = ``; // get rid of img url in tweet text
    replacements.push({ oldText, newText });
  }

  // make updates at the end
  let htmlText = tweet.full_text;
  for (let rep of replacements) {
    htmlText = htmlText.replace(rep.oldText, rep.newText);
  }

  // preserve line breaks to survive minification
  htmlText = htmlText.replace(/(?:\r\n|\r|\n)/g, '<br/>');

  return htmlText;
}

function getOldText(text, indices) {
  let startPos = indices[0];
  let endPos = indices[1];
  let len = endPos - startPos;

  let oldText = text.substr(startPos, len);

  return oldText;
}

async function findParagraph(data) {
  let res = '';
  let url = data.subj['api-url'];
  let doi = data.obj.pid.split('.org/')[1];
  try {
    let page = await getstring(url);
    //console.log(page)
    const { document, window } = new JSDOM(page);
    let temp = doi.split('/')[1];
    let els = document.querySelectorAll(
      "a[href$='" + encodeURIComponent(temp) + "']"
    );
    let elem = els[0];
    while (elem.tagName !== 'LI' && elem !== null) {
      elem = elem.parentNode;
    }
    let liId = elem.id;
    let els2 = document.querySelectorAll("a[href$='#" + liId + "']");
    let els3 = new Set();
    for (let elem0 of els2) {
      let wrapper = document.createElement('span');
      wrapper.classList.add('highlightCited');
      elem0.parentNode.insertBefore(wrapper, elem0);
      wrapper.appendChild(elem0);
      let elemt = elem0;
      while (
        elemt !== null &&
        elemt.tagName !== 'P' &&
        elemt.tagName !== 'LI'
      ) {
        elemt = elemt.parentNode;
      }
      if (elemt !== null) {
        els3.add(elemt);
      }
    }
    for (let elem0 of els3) {
      res = res + '<p>[...] ' + elem0.innerHTML + '</p>';
    }

    temp = data.subj.url.split('/');
    let urlroot = temp[0] + '/' + temp[1] + '/' + temp[2] + '/wiki/';
    res = res.replaceAll('href="./', 'href="' + urlroot);
    return res;
  } catch (error) {
    console.log(error);
    return false;
  }

  return undefined;
}

async function wikiMention(data, target, source) {
  if (cachedWiki[data.id]) {
    return null;
  } else {
    for (const [key, value] of Object.entries(cachedWiki)) {
      if (value['wm-target'] == target && value.url == data.subj.url)
        delete cachedWiki[key];
    }
    let images = [];
    let created_at = data.occurred_at;
    let id_str = data.id;
    // destructure only properties we care about

    let name = 'Wikipedia  — ' + data.subj.title;
    let title = name;
    let photo =
      'https://montevil.org/assets/avatars/mentions/wikipedia-logo.png';
    let temp = data.subj.url.split('/');
    let url = temp[0] + '/' + temp[1] + '/' + temp[2];
    url = data.subj.url;
    let type = 'card';
    let author = { type, name, photo, url };

    let html = await findParagraph(data);
    if (!html) {
      html = '';
    }

    let value = html;
    let text = html;
    let content = { 'content-type': 'text/html', value, html, text };
    type = 'entry';
    url = data.subj.url;
    let published = created_at;
    let wmreceived = published;
    let wmid = id_str;
    name = text;
    let wmproperty = 'mention-of';
    //  let  source=data.subj.url
    // build tweet with properties we want
    let tweetViewModel = {
      id_str,
      type,
      author,
      url,
      published,
      'wm-received': wmreceived,
      'wm-id': wmid,
      name,
      content,
      'wm-source': source,
      'wm-target': target,
      'mention-of': target,
      'repost-of': target,
      'wm-property': wmproperty,
      'wm-private': html == false,
      images,
    };
    // if(html){
    cachedWiki[tweetViewModel['id_str']] = tweetViewModel;
    //  saveCacheWiki(options)
    console.log('Added wikipedia mention:' + title);
    // }
    return undefined;
  }
}

//const asyncReplace = require('string-replace-async')
module.exports = {
  tweettomention: (tweetId, target, source) => {
    let aa = getTweet(tweetId, target, source);
    return undefined;
  },
  wikiMention: (data, target, source) => {
    let aa = wikiMention(data, target, source);
    return undefined;
  },
};
//let liveTweet = getTweet('1273201272485810176',{},"test");

//let liveTweet = getTweet('1273196572122255360',{});
//console.log(liveTweet)
