const { Builder, By, Key, until } = require('selenium-webdriver');
const moment = require('moment');
const { promises: fs } = require('fs');
const syncFs = require('fs');
require('dotenv').config();
//const slugifyString = require('../src/_utils/slugify');

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

let path = require('path');
let appPath = require.main.filename;
let pos = appPath.indexOf('node_modules');
let appRoot = appPath.substr(0, pos);
let cachePath = path.join(appRoot, '_cache', 'people.json');

let res = {};

(async function example() {
  let driver = await new Builder().forBrowser('firefox').build();
  const documentInitialised = () =>
    driver.executeScript("return 'initialised'");
  try {
    let file = await fs.readFile(cachePath, 'utf8');
    res = JSON.parse(file) || {};
    let authors = Object.values(JSON.parse(file)) || [];
    let outdated=["91n7gC0AAAAJ","NaC6mSsAAAAJ","r0hRIEwAAAAJ","us2IQTMAAAAJ"];
    for (entry of authors) {
      let gsid = entry.gsid;
      if (gsid && gsid!= "" && !outdated.includes(gsid)) {
        console.log('https://scholar.google.fr/citations?user=' + gsid);
        await driver.get('https://scholar.google.fr/citations?user=' + gsid),
          await driver.wait(() => documentInitialised(), 12000);
        await sleep(3110);
        let titre = await driver.getTitle();
        if (titre != "Error 404 (Not Found)!!1") {
        let urls = await driver.findElements(
          By.xpath("//div[@id='gsc_prf_ivh']/a")
        );

        for (url of urls) {
          let urlRes = await url.getAttribute('href');
          res[slugifyString(entry.shortname)].url = urlRes;
        }
        let nameel = await driver.findElement(
          By.xpath("//div[@id='gsc_prf_in']")
        );
        res[slugifyString(entry.shortname)].fullName = await nameel.getText();
        res[slugifyString(entry.shortname)].fullName = res[
          slugifyString(entry.shortname)
        ].fullName.replaceAll('"', '');
        let affiliationel = await driver.findElement(
          By.xpath("//div[@id='gsc_prf_i']/div[@class='gsc_prf_il']")
        );
        res[slugifyString(entry.shortname)].affiliation =
          await affiliationel.getText();
        res[slugifyString(entry.shortname)].affiliation = res[
          slugifyString(entry.shortname)
        ].affiliation.replaceAll('"', '');
        //console.log(res[entry.shortname].affiliation)
      }
      }
    }
  } finally {
    await driver.quit();
    let likeJSON = JSON.stringify(res, 2, 2);
    syncFs.writeFileSync(cachePath, likeJSON);
  }
})();
