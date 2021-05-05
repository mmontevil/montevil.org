const {Builder, By, Key, until} = require('selenium-webdriver');
const moment= require('moment');
const { promises: fs } = require("fs");
const syncFs = require('fs')
require('dotenv').config()
var search = require('approx-string-match').default;
const slugifyString = require('@sindresorhus/slugify');

const RG_MDP = process.env.RG_MDP;
const RG_LOGIN = process.env.RG_LOGIN;


function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
} 
async function login(driver){
  const documentInitialised = () =>  
   driver.executeScript("return 'initialised'");
  await driver.get('https://www.researchgate.net/login');
  await driver.wait(() => documentInitialised(), 10000);
  await sleep(1000);
  await driver.findElement(By.xpath("//button[@mode='primary']")).click();
  await driver.findElement(By.name("login")).sendKeys(RG_LOGIN);
  await driver.findElement(By.name("password")).sendKeys(RG_MDP);
  await sleep(1000);
  await driver.findElement(By.xpath("//button[@data-testid='loginCta']")).click();
} 
async function scrolldown(driver){
  var reachedEnd = false;
oldCount = await driver.findElements(By.css(".nova-o-stack__item")).length;

while (!reachedEnd)
{
    await driver.findElement(By.css("body")).sendKeys(Key.END);
    await sleep(1500);
    newCount = await driver.findElements(By.css(".nova-o-stack__item"));
    newCount=newCount.length

    if (newCount == oldCount)
    {
        reachedEnd = true;
    }
    else
    {
        oldCount = newCount;
    }
}
}
  let path = require("path")
 let appPath = require.main.filename
 let pos = appPath.indexOf("node_modules")
    let appRoot = appPath.substr(0, pos)
    let cachePath = path.join(appRoot, "_cache", "rgLikeMentions.json")
    let cachePath2 = path.join(appRoot, "src/_data/", "bibM.json")

      
    
let res={};


(async function example() {
let driver = await new Builder().forBrowser('firefox').build();  
const documentInitialised = () =>  
   driver.executeScript("return 'initialised'");
try {
   if (syncFs.existsSync(cachePath)){
      let fileres = await fs.readFile(cachePath, "utf8")
      res=JSON.parse(fileres) || {}
   }
   
   
   let file = await fs.readFile(cachePath2, "utf8")
        bib = Object.values(JSON.parse(file)) || []
  
  await login(driver);
  
    await driver.get('https://www.researchgate.net/profile/Mael-Montevil/research'),
    await driver.wait(() => documentInitialised(), 10000);
  await sleep(1000);
  await scrolldown(driver);
  await sleep(5000);
  listpub= await driver.findElements(By.xpath("//div[@class='nova-v-publication-item__stack-item']/div/a"));
  titles=[]
  urls=[]
  for ( pub in listpub){
   let resu=await listpub[pub].getAttribute("href");
    let rest=await listpub[pub].getText();
    titles.push(rest)
    urls.push(resu.split('?')[0])
  }
  
  for (iter in titles){
  try {
  let url0= urls[iter]
   let title= titles[iter]
   let urltargetlike= url0+"/stats"
 await driver.get(urltargetlike);
    await driver.wait(() => documentInitialised(), 10000);
      await sleep(2000);
    let checkrec= await driver.findElement(By.xpath("//div[@class='content-layout']/div[3]/div[1]/div[1]"));
     checkrec= await checkrec.getText();
    checkrec= checkrec=="Researchers who recommended this work"
  
    
    
    
    //await driver.findElement(By.css("body")).sendKeys(Key.PAGE_DOWN);
await sleep(1000);
     for (var i = 0; i < 100; i++){
       
           let button= await driver.findElement(By.xpath("//div[@class='content-layout']/div[3]/div/div[2]/div/div/div/button[2]"))
           let test=await button.getAttribute("class")
           test=test.includes("disabled");
           if(!test){
              button.click();
              await sleep(2000);
       }
     }
      
          // name= await driver.findElements(By.xpath("//div[@class='content-layout']/div[3]/div/div[2]/div/div/div/div/div/div/div/div/div/div/div/div[2]/div"));
            link= await driver.findElements(By.xpath("//div[@class='content-layout']/div[3]/div/div[2]/div/div/div/div/div/div/div/div/div/div/div/div[1]/a"));
            pic= await driver.findElements(By.xpath("//div[@class='content-layout']/div[3]/div/div[2]/div/div/div/div/div/div/div/div/div/div/div/div[1]/a/img"));
            
             for ( entry in link){
                  name=await pic[entry].getAttribute("alt");
                  link0= await link[entry].getAttribute("href")
                  photo= await pic[entry].getAttribute("src")

                     title0 = slugifyString(title.toLowerCase());
let size = 0;
let idd=""
let typepub=""
    for (const entry in bib) {
      if (
        search(
          slugifyString(bib[entry].title.toLowerCase()),
          title0,
          4
        ).length > 0
      ) {
     //  if (data.scholar[entry][1].length > size) {
          idd = bib[entry].id;
          typepub = bib[entry].type;
      //    size = data.scholar[entry][1].length;
      ///  }
      }
    }
  
    let id_str=url0.split('/')[4]+"_"+link0.split('/')[4];
    let mentioned=  "https://montevil.org/publications/varia/" +idd+"/"
    if(typepub=="article-journal")
           mentioned= "https://montevil.org/publications/articles/"  +idd+"/"
     if(typepub=="chapter")
            mentioned= "https://montevil.org/publications/chapters/"  +idd+"/"
     if(typepub=="book")
            mentioned= "https://montevil.org/publications/books/"  +idd+"/"
            
      let type= "card";
    let url= link0;
    let author = {type, name, photo,url }
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
    if(res[id_str]){}else{
    res[id_str]=tweetViewModel;
    }
 }
   /**/
     /*
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

}*/
}catch{}
    
  }
  
}
finally {    

    let likeJSON = JSON.stringify(res, 2, 2);
    syncFs.writeFileSync(cachePath, likeJSON)
  }
})();

