const { Builder, By, Key, until } = require('selenium-webdriver');
const moment = require('moment');
const { promises: fs } = require('fs');
const syncFs = require('fs');
require('dotenv').config();
var search = require('approx-string-match').default;
const slugifyString = require('@sindresorhus/slugify');

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

let path = require('path');
let appPath = require.main.filename;
let pos = appPath.indexOf('node_modules');
let appRoot = appPath.substr(0, pos);
let cachePath = path.join(appRoot, '_cache', 'plumMention.json');
let cachePath2 = path.join(appRoot, 'src/_data/', 'bibM.json');

let res = {};

(async function example() {
  let driver = await new Builder().forBrowser('firefox').build();
  const documentInitialised = () =>
    driver.executeScript("return 'initialised'");
  try {
    if (syncFs.existsSync(cachePath)) {
      let fileres = await fs.readFile(cachePath, 'utf8');
      res = JSON.parse(fileres) || {};
    }

    let file = await fs.readFile(cachePath2, 'utf8');
    bib = JSON.parse(file) || [];

    for (entry of bib) {
      let doi = entry.DOI;
      //  console.log(entry)
      if (doi) {
        await driver.get('https://plu.mx/plum/a/twitter?doi=' + doi),
          await driver.wait(() => documentInitialised(), 10000);
        await sleep(5000);
        let tweets = await driver.findElements(By.xpath('//iframe'));
        res[doi] = [];
        for (tweet of tweets) {
          let tweetid = await tweet.getAttribute('data-tweet-id');
          if (tweetid) res[doi].push(tweetid);
        }
        console.log(res);
      }
    }
  } finally {
    await driver.quit();

    let likeJSON = JSON.stringify(res, 2, 2);
    syncFs.writeFileSync(cachePath, likeJSON);
  }
})();
