const chrome = require('selenium-webdriver/chrome');
const chromeDriverPath = "/home/kamome/.local/share/undetected_chromedriver/undetected_chromedriver"
const {
    Builder,
    By,
    Key,
    until
} = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const SeleniumStealth = require("selenium-stealth/selenium_stealth");
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
async function adsleep() {
   count=count+1;
   if (count>15){
     count=0;
     await sleep(60000);
   }
}


(async function example() {
        //initialize
        let driver = new Builder()
            .withCapabilities({
                'goog:chromeOptions': {
                    excludeSwitches: [
                        'enable-automation',
                        'useAutomationExtension',
                    ],
                },
            })
            .forBrowser('chrome')
            .build();
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
        //console.log(updatedList);
        
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
                    await sleep(15000 + Math.floor(Math.random() * 30000));
                    await adsleep();
                    
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
                      if (res[targetNb].citing.length>publi.citing.length){
                        testz=false;
                        console.log("****failed!***");
                      }
                    }
                    if(testz){
                      res[targetNb] = publi;
                      let likeJSON = JSON.stringify(res, 2, 2);
                      syncFs.writeFileSync(cachePath, likeJSON);
                    }
                }
            }
        })();
