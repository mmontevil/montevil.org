const {Builder, By, Key, until} = require('selenium-webdriver');
const moment= require('moment');
const { promises: fs } = require("fs");
const syncFs = require('fs')
require('dotenv').config()
var search = require('approx-string-match').default;
const slugifyString = require('../src/_utils/slugify');


function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
} 



  let path = require("path")
 let appPath = require.main.filename
 let pos = appPath.indexOf("node_modules")
    let appRoot = appPath.substr(0, pos)
    let cachePath = path.join(appRoot, "_cache", "people.json");

      

let res={};

(async function example() {
let driver = await new Builder().forBrowser('firefox').build();  
const documentInitialised = () =>  
   driver.executeScript("return 'initialised'");
try {
     let file = await fs.readFile(cachePath, "utf8")
        res = (JSON.parse(file)) || {}
    let authors = Object.values(JSON.parse(file)) || []
  
  for (entry of authors){
    
    let gsid=entry.gsid;
    if (gsid){
    await driver.get("https://scholar.google.fr/citations?user="+gsid),
    await driver.wait(() => documentInitialised(), 10000);
  await sleep(2110);
let urls= await driver.findElements(By.xpath("//div[@id='gsc_prf_ivh']/a"));

for (url of urls){
  let urlRes=await url.getAttribute("href");
  res[slugifyString(entry.shortname)].url=urlRes;
}
let nameel= await driver.findElement(By.xpath("//div[@id='gsc_prf_in']"));
res[slugifyString(entry.shortname)].fullName=await nameel.getText().replaceAll('"','');
let affiliationel= await driver.findElement(By.xpath("//div[@id='gsc_prf_i']/div[@class='gsc_prf_il']"));
res[slugifyString(entry.shortname)].affiliation=await affiliationel.getText().replaceAll('"','');
//console.log(res[entry.shortname].affiliation)
}
}
  
}
finally {    

    let likeJSON = JSON.stringify(res, 2, 2);
    syncFs.writeFileSync(cachePath, likeJSON)
  }
})();

