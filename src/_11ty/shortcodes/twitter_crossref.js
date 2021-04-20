require('dotenv').config()
const request = require('request-promise')
const { promises: fs } = require("fs");
const syncFs = require('fs')

//const { writeToCache, readFromCache } = require('../src/_utils/cache');

let cachedTweets =  getCachedTweets( {
    cacheDirectory: '_cache'
  });

async function getTweet(tweetId, options,target) {

    // if we using cache and not cache busting, check there first
    if (options.cacheDirectory && !process.env.CACHE_BUST) {
        
        let cachedTweet = cachedTweets[tweetId]

        // if we have a cached tweet, use that
        if (cachedTweet) {
            return null;
        }
        // else continue on
    }


    // if we have env variables, go get tweet
    if (hasAuth()) {
        let liveTweet = await fetchTweet(tweetId)

        let tweetViewModel = processTweet(liveTweet,target)
 //console.log(tweetViewModel);
      /*  tweetViewModel.html = renderTweet(tweetViewModel)
*/
        // cache tweet
        if (options.cacheDirectory) {
            await addTweetToCache(tweetViewModel, options)
        }

        // build
        return null;
    } else {
        console.warn("Remeber to add your twitter credentials as environement variables")
        console.warn("Read More at https://github.com/KyleMit/eleventy-plugin-embed-tweet#setting-env-variables")
            // else continue on
    }

    // finally fallback to client-side injection
    var htmlTweet =
        `<blockquote class="twitter-tweet"><a href="https://twitter.com/user/status/${tweetId}"></a></blockquote>` +
        `<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>`

    return null
}

/* Twitter API Call */
function hasAuth() {
    return process.env.TOKEN &&
        process.env.TOKEN_SECRET &&
        process.env.CONSUMER_KEY &&
        process.env.CONSUMER_SECRET
}

function getAuth() {
    let oAuth = {
        token: process.env.TOKEN,
        token_secret: process.env.TOKEN_SECRET,
        consumer_key: process.env.CONSUMER_KEY,
        consumer_secret: process.env.CONSUMER_SECRET,
    }
    return oAuth;
}

async function fetchTweet(tweetId) {
    // fetch tweet
    let apiURI = `https://api.twitter.com/1.1/statuses/show/${tweetId}.json?tweet_mode=extended`
    let auth = getAuth()
    
    try {
        let response = await request.get(apiURI, { oauth: auth });
        let tweet = JSON.parse(response);
         //console.log(tweet)
        return tweet;

    } catch (error) {
        // unhappy path - continue to other fallbacks
        console.log(error)
        return {}
    }
}

/* transform tweets */
function processTweet(tweet,target) {

    // parse complicated stuff
    let images = getTweetImages(tweet)
    let created_at = getTweetDates2(tweet)
    let htmlText = getTweetTextHtml(tweet)

    // destructure only properties we care about
    let { id_str, favorite_count, full_text,retweeted_status} = tweet
    let { name, screen_name, profile_image_url_https, url } = tweet.user
    let type= "card"
    let photo=profile_image_url_https
    let author = {type, name, screen_name, photo,url }
    let text=full_text
    let value=htmlText
    let html=htmlText
    let content = {"content-type": "text/html", value, html, text}
         type= "entry"
        url="https://twitter.com/"+screen_name+"/status/"+id_str
        published=created_at
        wmreceived=published 
        wmid=id_str
        name=full_text
        wmproperty= "mention-of"
        if(retweeted_status)
          wmproperty= "repost-of"
          
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
      "wm-source": "https://www.crossref.org/",
      "wm-target": target ,
      "mention-of": target,
      "repost-of": target,
      "wm-property": wmproperty,
      "wm-private": false,
      images,
      favorite_count,
    }
//
    return tweetViewModel
}

function getTweetImages(tweet) {
    let images = []
    for (media of tweet.entities.media || []) {
        images.push(media.media_url_https)
    }
    return images
}

function getTweetDates(tweet) {
    let moment = require("moment");

    // parse
    let dateMoment = moment(tweet.created_at, "ddd MMM D hh:mm:ss Z YYYY");

    // format
    let display = dateMoment.format("hh:mm A · MMM D, YYYY")
    let meta = dateMoment.utc().format("MMM D, YYYY hh:mm:ss (z)")

    return { display, meta }
}


function getTweetDates2(tweet) {
    let moment = require("moment");

    // parse
    let dateMoment = moment(tweet.created_at, "ddd MMM D hh:mm:ss Z YYYY");

    // format
    let meta = dateMoment.utc().format("YYYY-MM-DDThh:mm:ssZ")

    return  meta
}

function getTweetTextHtml(tweet) {
    let replacements = []

    // hashtags
    for (hashtag of tweet.entities.hashtags || []) {
        let oldText = getOldText(tweet.full_text, hashtag.indices)
        let newText = `<a href="https://twitter.com/hashtag/${oldText.substr(1)}">${oldText}</a>`
        replacements.push({ oldText, newText })
    }

    // users
    for (user of tweet.entities.user_mentions || []) {
        let oldText = getOldText(tweet.full_text, user.indices)
        let newText = `<a href="https://twitter.com/${oldText.substr(1)}">${oldText}</a>`
        replacements.push({ oldText, newText })
    }

    // urls
    for (url of tweet.entities.urls || []) {
        let oldText = getOldText(tweet.full_text, url.indices)
        let newText = `<a href="${url.expanded_url}">${url.expanded_url.replace(/https?:\/\//,"")}</a>`
        replacements.push({ oldText, newText })
    }

    // media
    for (media of tweet.entities.media || []) {
        let oldText = getOldText(tweet.full_text, media.indices)
        let newText = `` // get rid of img url in tweet text
        replacements.push({ oldText, newText })
    }

    // make updates at the end
    let htmlText = tweet.full_text
    for (rep of replacements) {
        htmlText = htmlText.replace(rep.oldText, rep.newText)
    }

    // preserve line breaks to survive minification
    htmlText = htmlText.replace(/(?:\r\n|\r|\n)/g, '<br/>');

    return htmlText
}

function getOldText(text, indices) {
    let startPos = indices[0];
    let endPos = indices[1];
    let len = endPos - startPos

    let oldText = text.substr(startPos, len)

    return oldText
}


/* caching / file access */
async function getCachedTweets(options) {
    let cachePath = getCachedTweetPath(options)

    try {
        let file = await fs.readFile(cachePath, "utf8")
        cachedTweets = JSON.parse(file) || {}

        return cachedTweets

    } catch (error) {
        // otherwise, empty array is fine
        console.log(error)
        return {}
    }
}

async function addTweetToCache(tweet, options) {
    try {
        // get cache
     //  let cachedTweets = await getCachedTweets(options)

        // add new tweet
        cachedTweets[tweet.id_str] = tweet

        // build new cache string
        let tweetsJSON = JSON.stringify(cachedTweets, 2, 2)

        let cachePath = getCachedTweetPath(options)
        let cacheDir = require("path").dirname(cachePath)

        // makre sure directory exists
        await fs.mkdir(cacheDir, { recursive: true })

        syncFs.writeFileSync(cachePath, tweetsJSON)

        console.log(`Writing ${cachePath}`)
    } catch (error) {
        console.log(error)
    }
}

function getCachedTweetPath(options) {
    let path = require("path")

    // get directory for main thread
    let appPath = require.main.filename // C:\user\github\app\node_modules\@11ty\eleventy\cmd.js
    let pos = appPath.indexOf("node_modules")
    let appRoot = appPath.substr(0, pos) // C:\user\github\app\

    // build cache file path
    let cachePath = path.join(appRoot, options.cacheDirectory, "tweetsMentions.json")

    return cachePath
}

module.exports = {
  tweettomention: (tweetId, options,target) => {
     let aa=getTweet(tweetId, options,target);
    return undefined;
  }
}
//let liveTweet = getTweet('1273201272485810176',{},"test");

//let liveTweet = getTweet('1273196572122255360',{});
//console.log(liveTweet) 
