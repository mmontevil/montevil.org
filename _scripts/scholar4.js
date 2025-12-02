//const chrome = require('selenium-webdriver/chrome');
//const chromeDriverPath = "/home/kamome/.local/share/undetected_chromedriver/undetected_chromedriver"
//const {Builder,By,    Key,    until} = require('selenium-webdriver');
//const firefox = require('selenium-webdriver/firefox');
const {Builder,By,Key,until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome')

let options = new chrome.Options();

options.addArguments(
    '--disable-blink-features=AutomationControlled',
    '--disable-infobars',
    '--disable-dev-shm-usage',
    '--no-sandbox',
    '--disable-gpu',
    '--window-size=1280,800',
    '--start-maximized'
);

// Supprime le flag WebDriver détectable
options.excludeSwitches(['enable-automation']);
options.setUserPreferences({ 'credentials_enable_service': false });

const moment = require('moment');
const {promises: fs} = require('fs');
const syncFs = require('fs');
require('dotenv').config();
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
let cachePath = path.join(appRoot, 'src/_data/', 'scholar2.json');
let cachePath2 = path.join(appRoot, 'src/_data/', 'scholar2.json');

let res = [];
let count = 1;

async function  adsleep(min = 800, max = 2500) {
  return new Promise(res => setTimeout(res, min + Math.random() * (max - min)));
}

(async function example() {
        //initialize

      
        let driver = new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build()    
         await driver.executeScript(`
            Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
        `);   
        let res = [];

        if (syncFs.existsSync(cachePath)) {
            let fileres = await fs.readFile(cachePath, 'utf8');
            res = JSON.parse(fileres) || [];
        }

        const documentInitialised = () => driver.executeScript("return 'initialised'");

        await driver.get('https://scholar.google.fr/citations?user=5eOo9hQAAAAJ&hl=en&oi=ao');
        await driver.wait(() => documentInitialised(), 10000);
        await sleep(10000);

        await driver.findElement(By.id('gs_hdr_mnu')).click();
        await driver.get('https://scholar.google.fr/scholar_settings?hl=en');
        await driver.wait(() => documentInitialised(), 10000);
        await sleep(60000);       

        await driver.findElement(By.id('gs_num-b')).click();       
        await sleep(1000);       
        await driver.findElement(By.xpath(("//a[@data-v='20']"))).click();       
        await sleep(1000);
        await driver.findElement(By.name('save')).click(); 
        await sleep(1000);
        await driver.get('https://scholar.google.fr/citations?user=5eOo9hQAAAAJ&hl=en&oi=ao');
        await driver.wait(() => documentInitialised(), 10000);        
        // get publications
        let temp = true;
        while (temp) {
            let belows = await driver.findElements(By.id("gsc_bpf_more"));
            if (belows.length > 0) {
                temp = await belows[0].isEnabled();
                await belows[0].click();
                await sleep(5000);
            } else {
                temp = false;
            }
        }

        let updatedList = [];
        listmypub = await driver.findElements(By.xpath(("//tr[@class='gsc_a_tr']")));
        for (originePub in listmypub) {
            let title0 = await listmypub[originePub].findElement(By.xpath((".//a[@class='gsc_a_at']")));
            let title1 = await title0.getText();

            let numberCite0 = await listmypub[originePub].findElements(By.xpath((".//td[@class='gsc_a_c']/a[not(@data-eid)]")));
            if (numberCite0.length > 0) {
                let numberCite = numberCite0[0];
                let numberCite1 = await numberCite.getText();
                if (numberCite1.length > 0) {
                    let linkciting = await numberCite.getAttribute('href');
                    let publi = {
                        'title': title1,
                        'citingLink': linkciting,
                        'citenumber': numberCite1
                    }
                    updatedList.push(publi);
                } else {
                    //console.log(title1);
                    let publi = {
                        'title': title1,
                        'citingLink': "",
                        'citenumber': 0
                    }
                    updatedList.push(publi);
                }
            }

        }
        await driver.get("https://scholar.google.fr/scholar?oi=bibs&hl=fr&cites=5715512211526556221,3900630348746021571,14845969391047998323"),
        await driver.wait(() => documentInitialised(), 10000);
        await adsleep(); 
        //console.log(updatedList);
        // update citations number 

        
        
        
        // browse publications
        for (pubIt in updatedList) {
            let targetNb = -1;
            for (ii in res) {
                if (res[ii].title == updatedList[pubIt].title) {
                    targetNb = ii
                    res[ii].citenumber = res[ii].citing.length;
                }
            }

            if ((targetNb > -1) && (res[targetNb].citenumber == updatedList[pubIt].citenumber)) {} else {
                if (targetNb == -1) {
                    res.push([]);
                    targetNb = res.length - 1;
                }
                let publi = {};
                if (updatedList[pubIt].citenumber > 0) {

                    await driver.get(updatedList[pubIt].citingLink),
                    await driver.wait(() => documentInitialised(), 10000);
                    await adsleep();
                    
                    headdd = await driver.findElement(By.xpath(("//div[@id='gs_ab_md']")));
                    let auth0 = await headdd.getText();
                    let numberava1 = parseInt(auth0.split(" ")[0]);
                    let numberava = parseInt(auth0.split(" ")[1]);
                    if (isNaN(numberava)){
                      numberava =numberava1;
                    }
                    updatedList[pubIt].citenumber=numberava;
                    console.log(numberava);
                }
            }
            if ((targetNb > -1) && (res[targetNb].citenumber == updatedList[pubIt].citenumber)) {} else {
                if ((updatedList[pubIt].citenumber > 0))  {
                    let res0 = []
                    let whiletest = true;
                    while (whiletest) {

                        listpub = await driver.findElements(By.xpath(("//div[@data-cid and @class='gs_r gs_or gs_scl']")));

                        for (pub in listpub) {
                            let gid = await listpub[pub].getAttribute('data-cid');

                            let pub2 = await listpub[pub].findElements(By.xpath((".//div[@class='gs_or_ggsm']/a")));
                            let pdflink = "";
                            if (pub2.length > 0) {
                                pdflink = await pub2[0].getAttribute('href');
                            }

                            let pub3 = await listpub[pub].findElement(By.xpath((".//h3")));
                            let title = await pub3.getText();

                            let pub4 = await pub3.findElements(By.xpath((".//a")));
                            let mainlink = "";
                            if (pub4.length > 0) {
                                mainlink = await pub4[0].getAttribute('href');
                            }

                            let pub5 = await listpub[pub].findElement(By.xpath((".//div[@class='gs_a']")));
                            let auth0 = await pub5.getText();
                            let auth1 = auth0.split(" - ")[0];
                            let auths = auth1.split(", ");
                            auths[auths.length - 1] = auths[auths.length - 1].replace(/…/g, '');

                            let pub6 = await listpub[pub].findElements(By.xpath((".//div[@class='gs_a']/a")));
                            let authlink = [];
                            let counter = 0;
                            for (pubb in auths) {
                                let authlink0 = "";
                                if (pub6.length > counter) {
                                    let textt = await pub6[counter].getText();

                                    if (textt == auths[pubb]) {
                                        authlink0 = await pub6[counter].getAttribute('href');
                                        authlink0 = authlink0.substring(authlink0.indexOf("=") + 1, authlink0.indexOf("&"));
                                        counter = counter + 1;
                                    }

                                }
                                authlink.push(authlink0);
                            }
                            let venue = "";
                            let year = "";
                            let publi = auth0.split(" - ")[1];
                            if (publi) {
                                let publi2 = publi.split(", ");
                                year = publi2[publi2.length - 1];
                                if (publi2.length > 1) {
                                    venue = publi2[0];
                                }
                            }

                            let citing = {
                                'title': title,
                                'authors': auths,
                                'authorsid': authlink,
                                'year': year,
                                'journal': venue,
                                'gid': gid,
                                'pdflink': pdflink,
                                'mainlink': mainlink
                            };
                            // console.log(citing);
                            res0.push(citing);
                        }

                        whiletest = false;
                        let temp = await driver.findElements(By.xpath("//td[@align='left']/a"));

                        if (temp.length != 0) {
                            let checkrec = await driver.findElement(By.xpath("//td[@align='left']/a"));

                            let link = await checkrec.getAttribute('href');
                            //console.log(link);
                            await driver.get(link);
                            await sleep(10000 + Math.floor(Math.random() * 20000)); whiletest = true;
                            await adsleep();
                            }
                        }

                        publi = {
                            'title': updatedList[pubIt].title,
                            'citingLink': updatedList[pubIt].citingLink,
                            'citenumber': updatedList[pubIt].citenumber,
                            'citing': res0
                        };
                    } else {
                        publi = {
                            'title': updatedList[pubIt].title,
                            'citingLink': '',
                            'citenumber': 0,
                            'citing': []
                        };
                    }
                    
                    testz=true;
                    if (res[targetNb].citing){
                   /*   if (res[targetNb].citing.length!=publi.citing.length){
                        testz=false;
                      console.log("****failed!*** ");

                      }*/
                      console.log(updatedList[pubIt].title);
                      console.log("orglist"+res[targetNb].citing.length+", newlist "+publi.citing.length+", targetnbr "+updatedList[pubIt].citenumber);
                    }
                    if(testz){
                      res[targetNb] = publi;
                      let likeJSON = JSON.stringify(res, 2, 2);
                      syncFs.writeFileSync(cachePath, likeJSON);
                    }
                }
            }
        await driver.quit();
        })();
