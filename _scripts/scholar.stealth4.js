const {Builder,By,Key,until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const moment = require('moment');
const {promises: fs} = require('fs');
const syncFs = require('fs');
require('dotenv').config();
const slugifyString = require('@sindresorhus/slugify');
let path = require('path');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function adsleep(min = 800, max = 2500) {
    return new Promise(resolve => setTimeout(resolve, min + Math.random() * (max - min)));
}

// ---- CONFIG SELENIUM ----
const options = new chrome.Options();
options.addArguments(
    '--disable-blink-features=AutomationControlled',
    '--disable-infobars',
    '--disable-dev-shm-usage',
    '--no-sandbox',
    '--disable-gpu',
    '--window-size=1280,800',
    '--start-maximized',
    '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121 Safari/537.36'
);
const profilePath = path.join(process.cwd(), "chrome-profile");
options.addArguments(`--user-data-dir=${profilePath}`);
options.excludeSwitches(['enable-automation']);
options.setUserPreferences({ 'credentials_enable_service': false });

// ---- STEALTH PATCH ----
async function applyStealth(driver) {
    await driver.executeScript(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        window.navigator.chrome = { runtime: {} };
        const originalQuery = window.navigator.permissions.query;
        window.navigator.permissions.query = (parameters) =>
            parameters.name === 'notifications'
                ? Promise.resolve({ state: Notification.permission })
                : originalQuery(parameters);
        Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
        Object.defineProperty(navigator, 'languages', { get: () => ['fr-FR', 'fr'] });
    });
}

// ---- SAFE NAVIGATION WITH RETRIES ----
async function safeGet(driver, url, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await adsleep(1500, 4500);
            await driver.get(url);
            await adsleep(2000, 5000);
            await applyStealth(driver);
            return;
        } catch (err) {
            console.log(`Attempt ${attempt} failed for URL: ${url}`);
            if (attempt === retries) throw err;
            let waitTime = 5000 + Math.random() * 5000;
            console.log(`Waiting ${waitTime}ms before retrying...`);
            await sleep(waitTime);
        }
    }
}

async function findElementSafe(driver, locator, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const el = await driver.findElement(locator);
            return el;
        } catch (err) {
            console.log(`Attempt ${attempt} failed to find element: ${locator}`);
            if (attempt === retries) throw err;
            let waitTime = 3000 + Math.random() * 4000;
            await sleep(waitTime);
        }
    }
}

(async function example() {
    let driver = new Builder().forBrowser('chrome').setChromeOptions(options).build();
    await applyStealth(driver);

    let appPath = require.main.filename;
    let pos = appPath.indexOf('node_modules');
    let appRoot = appPath.substr(0, pos);
    let cachePath = path.join(appRoot, 'src/_data/scholar2.json');

    let res = [];
    if (syncFs.existsSync(cachePath)) {
        let fileres = await fs.readFile(cachePath, 'utf8');
        res = JSON.parse(fileres) || [];
    }

    const documentInitialised = () => driver.executeScript("return 'initialised'");

    // SETTINGS
    await safeGet(driver, 'https://scholar.google.fr/citations?user=5eOo9hQAAAAJ&hl=en&oi=ao');
    await driver.wait(() => documentInitialised(), 10000);

    await findElementSafe(driver, By.id('gs_hdr_mnu')).then(el => el.click());
    await safeGet(driver, 'https://scholar.google.fr/scholar_settings?hl=en');
    await driver.wait(() => documentInitialised(), 10000);

    await adsleep(1200, 2600);
    await findElementSafe(driver, By.id('gs_num-b')).then(el => el.click());
    await adsleep(900, 1800);
    await findElementSafe(driver, By.xpath("//a[@data-v='20']")).then(el => el.click());
    await adsleep(900, 1800);
    await findElementSafe(driver, By.name('save')).then(el => el.click());

    await safeGet(driver, "https://scholar.google.fr/citations?user=5eOo9hQAAAAJ&hl=en&oi=ao");
    await driver.wait(() => documentInitialised(), 10000);

    // LOAD ALL PUBLICATIONS
    let temp = true;
    while (temp) {
        let belows = await driver.findElements(By.id("gsc_bpf_more"));
        if (belows.length > 0) {
            temp = await belows[0].isEnabled();
            await belows[0].click();
            await adsleep(3000, 6000);
        } else temp = false;
    }

    // EXTRACT PUBLICATIONS
    let updatedList = [];
    let listmypub = await driver.findElements(By.xpath("//tr[@class='gsc_a_tr']"));
    for (let originePub in listmypub) {
        let title0 = await listmypub[originePub].findElement(By.xpath(".//a[@class='gsc_a_at']"));
        let title1 = await title0.getText();
        let numberCite0 = await listmypub[originePub].findElements(By.xpath(".//td[@class='gsc_a_c']/a[not(@data-eid)]"));
        if (numberCite0.length > 0) {
            let numberCite = numberCite0[0];
            let numberCite1 = await numberCite.getText();
            let linkciting = numberCite1.length > 0 ? await numberCite.getAttribute('href') : '';
            updatedList.push({ title: title1, citingLink: linkciting, citenumber: numberCite1 || 0 });
        }
    }

    // PARSE CITATIONS WITH RETRIES
    for (let pubIt in updatedList) {
        let targetNb = res.findIndex(r => r.title === updatedList[pubIt].title);
        if (targetNb >= 0) res[targetNb].citenumber = res[targetNb].citing.length;
        if (targetNb < 0 || res[targetNb].citenumber != updatedList[pubIt].citenumber) {
            if (targetNb < 0) { res.push([]); targetNb = res.length - 1; }
            let publi = {};
            if (updatedList[pubIt].citenumber > 0) {
                await safeGet(driver, updatedList[pubIt].citingLink);
                await driver.wait(() => documentInitialised(), 10000);
                let headdd = await findElementSafe(driver, By.xpath("//div[@id='gs_ab_md']"));
                let auth0 = await headdd.getText();
                let numberava1 = parseInt(auth0.split(" ")[0]);
                let numberava = parseInt(auth0.split(" ")[1]);
                if (isNaN(numberava)) numberava = numberava1;
                updatedList[pubIt].citenumber = numberava;
            }

            let res0 = [];
            let whiletest = true;
            while (whiletest) {
                let listpub = await driver.findElements(By.xpath("//div[@data-cid and @class='gs_r gs_or gs_scl']"));
                for (let pub in listpub) {
                    let gid = await listpub[pub].getAttribute('data-cid');
                    let pub2 = await listpub[pub].findElements(By.xpath(".//div[@class='gs_or_ggsm']/a"));
                    let pdflink = pub2.length ? await pub2[0].getAttribute('href') : "";
                    let pub3 = await listpub[pub].findElement(By.xpath(".//h3"));
                    let title = await pub3.getText();
                    let pub4 = await pub3.findElements(By.xpath(".//a"));
                    let mainlink = pub4.length ? await pub4[0].getAttribute('href') : "";
                    let pub5 = await listpub[pub].findElement(By.xpath(".//div[@class='gs_a']"));
                    let auth0 = await pub5.getText();
                    let auth1 = auth0.split(" - ")[0];
                    let auths = auth1.split(", ");
                    auths[auths.length - 1] = auths[auths.length - 1].replace(/…/g, '');
                    let pub6 = await listpub[pub].findElements(By.xpath(".//div[@class='gs_a']/a"));
                    let authlink = [];
                    let counter = 0;
                    for (let pubb in auths) {
                        let authlink0 = "";
                        if (pub6.length > counter) {
                            let textt = await pub6[counter].getText();
                            if (textt == auths[pubb]) {
                                authlink0 = await pub6[counter].getAttribute('href');
                                authlink0 = authlink0.substring(authlink0.indexOf("=") + 1, authlink0.indexOf("&"));
                                counter++;
                            }
                        }
                        authlink.push(authlink0);
                    }
                    let venue = "";
                    let year = "";
                    let publiInfo = auth0.split(" - ")[1];
                    if (publiInfo) {
                        let publi2 = publiInfo.split(", ");
                        year = publi2[publi2.length - 1];
                        if (publi2.length > 1) venue = publi2[0];
                    }
                    res0.push({ title, authors: auths, authorsid: authlink, year, journal: venue, gid, pdflink, mainlink });
                }
                whiletest = false;
                let temp = await driver.findElements(By.xpath("//td[@align='left']/a"));
                if (temp.length !== 0) {
                    let link = await temp[0].getAttribute('href');
                    await safeGet(driver, link);
                    whiletest = true;
                }
            }
            publi = { title: updatedList[pubIt].title, citingLink: updatedList[pubIt].citingLink, citenumber: updatedList[pubIt].citenumber, citing: res0 };
            if (res[targetNb].citing) console.log(updatedList[pubIt].title, "orglist", res[targetNb].citing.length, ", newlist", publi.citing.length, ", targetnbr", updatedList[pubIt].citenumber);
            res[targetNb] = publi;
            syncFs.writeFileSync(cachePath, JSON.stringify(res, null, 2));
        }
    }

    await driver.quit();
})();
