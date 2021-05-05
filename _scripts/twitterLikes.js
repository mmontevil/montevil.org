const {Builder, By, Key, until} = require('selenium-webdriver');
const moment= require('moment');
const { promises: fs } = require("fs");
const syncFs = require('fs')
require('dotenv').config()

const TWITTER_MDP = process.env.TWITTER_MDP;
const TWITTER_LOGIN = process.env.TWITTER_LOGIN;


function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
} 
async function login(driver){
  const documentInitialised = () =>  
   driver.executeScript("return 'initialised'");
  await driver.get('https://twitter.com/login');
  await driver.wait(() => documentInitialised(), 10000);
  await sleep(1000);
  await driver.findElement(By.xpath("//input[@name='session[username_or_email]']")).sendKeys(TWITTER_LOGIN);
  await driver.findElement(By.xpath("//input[@name='session[password]']")).sendKeys(TWITTER_MDP);
  await sleep(1000);
  await driver.findElement(By.xpath("//div[@data-testid='LoginForm_Login_Button']")).click();
} 

  let path = require("path")
 let appPath = require.main.filename
 let pos = appPath.indexOf("node_modules")
    let appRoot = appPath.substr(0, pos)
    let cachePath = path.join(appRoot, "_cache", "tweetLikeMentions.json")
    let cachePath2 = path.join(appRoot, "_cache", "tweetsMentions.json")

    
    
let res={};


(async function example() {
let driver = await new Builder().forBrowser('firefox').build();  
const documentInitialised = () =>  
   driver.executeScript("return 'initialised'");
try {
   let file = await fs.readFile(cachePath2, "utf8")
        maintweets = Object.values(JSON.parse(file)) || []
  
  await login(driver);
   
for ( tid in maintweets){
  
  let ortweet=maintweets[tid]['id_str'];
let urltarget=maintweets[tid].url;
let urltargetlike=urltarget+"/likes";
let mentioned=maintweets[tid]['wm-target'];
  
  
  await driver.get(urltargetlike);
  await driver.wait(() => documentInitialised(), 10000);
  await sleep(2000);

l= await driver.findElements(By.xpath("//div[@aria-label='Timeline: Liked by']/div/div/div/div[@data-testid='UserCell']/div/div/div/a"));
m= await driver.findElements(By.xpath("//div[@aria-label='Timeline: Liked by']/div/div/div/div[@data-testid='UserCell']/div/div/div/a/div/div/div/img"));
xx=0;
for ( x in l){
  let link=await l[x].getAttribute("href");
  if(link.substring(0, 20)==="https://twitter.com/"){
    console.log(link.substring(20));
    let photo=await m[xx].getAttribute("src");; 
    let type= "card";
    let screen_name=link.substring(20);
  let temp= await driver.findElements(By.xpath("//div[@aria-label='Timeline: Liked by']/div/div/div/div[@data-testid='UserCell']/div/div[2]/div/div/a[@href='/"+screen_name +"']/div[1]/div[1]"));
         let name=await temp[0].getText(); 

    let id_str=ortweet+screen_name;
    let url=  "https://twitter.com/"+screen_name;
    let author = {type, name, screen_name, photo,url }
         type= "entry"
        url=urltargetlike
      let  published=moment().format('YYYY-MM-DD');
     let   wmreceived=published 
      let  wmid=id_str
         let wmproperty= "like-of"
           let source= urltargetlike;
           let target= mentioned;
    // build tweet with properties we want
    let tweetViewModel = {
      id_str,
      type,
      author,
      url,
      published,
      'wm-received': wmreceived,
      'wm-id': wmid,
      "wm-source": source,
      "wm-target": target ,
      "like-of": target,
      "wm-property": wmproperty,
      "wm-private": false,
    }
    
    res[id_str]=tweetViewModel;
    xx=xx+1;
  }
}
    await sleep(10000);

}
}finally {    

    let likeJSON = JSON.stringify(res, 2, 2);
    syncFs.writeFileSync(cachePath, likeJSON)
  }
})();

console.log(res);
