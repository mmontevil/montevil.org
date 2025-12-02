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
    return new Promise(resolve =>
        setTimeout(resolve, min + Math.random() * (max - min))
    );
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

// Profil Chrome persistant (cookies / historique)
const profilePath = path.join(process.cwd(), "chrome-profile");
options.addArguments(`--user-data-dir=${profilePath}`);

// Supprime WebDriver flag
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

        Object.defineProperty(navigator, 'plugins', {
            get: () => [1, 2, 3],
        });

        Object.defineProperty(navigator, 'languages', {
            get: () => ['fr-FR', 'fr'],
        });
    });
}

// ---- SAFE NAVIGATION ----
async function safeGet(driver, url) {
    await adsleep(1500, 4500);
    await driver.get(url);
    await adsleep(2000, 5000);
    await applyStealth(driver);
}

// ------------------------------------------------------------
// ------------------------- MAIN -----------------------------
// ------------------------------------------------------------

(async function example() {

    let driver = new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

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

    // --------------------------------------------------------------------
    // SETTINGS
    // --------------------------------------------------------------------
    await safeGet(driver, 'https://scholar.google.fr/citations?user=5eOo9hQAAAAJ&hl=en&oi=ao');
    await driver.wait(() => documentInitialised(), 10000);
    await adsleep();

    await driver.findElement(By.id('gs_hdr_mnu')).click();
    await safeGet(driver, 'https://scholar.google.fr/scholar_settings?hl=en');
    await driver.wait(() => documentInitialised(), 10000);

    await adsleep(1200, 2600);
    await driver.findElement(By.id('gs_num-b')).click();

    await adsleep(900, 1800);
    await driver.findElement(By.xpath("//a[@data-v='20']")).click();

    await adsleep(900, 1800);
    await driver.findElement(By.name('save')).click();

    await safeGet(driver, "https://scholar.google.fr/citations?user=5eOo9hQAAAAJ&hl=en&oi=ao");
    await driver.wait(() => documentInitialised(), 10000);

    // --------------------------------------------------------------------
    // CHARGER TOUTES LES PUBLICATIONS
    // --------------------------------------------------------------------
    let temp = true;
    while (temp) {
        let belows = await driver.findElements(By.id("gsc_bpf_more"));
        if (belows.length > 0) {
            temp = await belows[0].isEnabled();
            await belows[0].click();
            await adsleep(3000, 6000);
        } else {
            temp = false;
        }
    }

    // --------------------------------------------------------------------
    // EXTRACTION DES PUBLICATIONS
    // --------------------------------------------------------------------
    let updatedList = [];
    let listmypub = await driver.findElements(By.xpath("//tr[@class='gsc_a_tr']"));

    for (let originePub in listmypub) {
        let title0 = await listmypub[originePub].findElement(By.xpath(".//a[@class='gsc_a_at']"));
        let title1 = await title0.getText();

        let numberCite0 = await listmypub[originePub].findElements(By.xpath(".//td[@class='gsc_a_c']/a[not(@data-eid)]"));

        if (numberCite0.length > 0) {
            let numberCite = numberCite0[0];
            let numberCite1 = await numberCite.getText();

            if (numberCite1.length > 0) {
                let linkciting = await numberCite.getAttribute('href');
                updatedList.push({
                    title: title1,
                    citingLink: linkciting,
                    citenumber: numberCite1
                });
            } else {
                updatedList.push({ title: title1, citingLink: "", citenumber: 0 });
            }
        }
    }

    // --------------------------------------------------------------------
    // PARCOURIR LES CITATIONS
    // --------------------------------------------------------------------
    for (let pubIt in updatedList) {

        let targetNb = -1;
        for (let ii in res) {
            if (res[ii].title == updatedList[pubIt].title) {
                targetNb = ii;
                res[ii].citenumber = res[ii].citing.length;
            }
        }

        if ((targetNb > -1) && (res[targetNb].citenumber == updatedList[pubIt].citenumber)) {
            // nothing
        } else {

            if (targetNb == -1) {
                res.push([]);
                targetNb = res.length - 1;
            }

            let publi = {};

            if (updatedList[pubIt].citenumber > 0) {

                await safeGet(driver, updatedList[pubIt].citingLink);
                await driver.wait(() => documentInitialised(), 10000);

                let headdd = await driver.findElement(By.xpath("//div[@id='gs_ab_md']"));
                let auth0 = await headdd.getText();
                let numberava1 = parseInt(auth0.split(" ")[0]);
                let numberava = parseInt(auth0.split(" ")[1]);
                if (isNaN(numberava)) numberava = numberava1;
                updatedList[pubIt].citenumber = numberava;

            }

            if ((updatedList[pubIt].citenumber > 0)) {

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

                        res0.push({
                            title,
                            authors: auths,
                            authorsid: authlink,
                            year,
                            journal: venue,
                            gid,
                            pdflink,
                            mainlink
                        });
                    }

                    whiletest = false;

                    let temp = await driver.findElements(By.xpath("//td[@align='left']/a"));
                    if (temp.length !== 0) {
                        let link = await temp[0].getAttribute('href');
                        await safeGet(driver, link);
                        whiletest = true;
                    }
                }

                publi = {
                    title: updatedList[pubIt].title,
                    citingLink: updatedList[pubIt].citingLink,
                    citenumber: updatedList[pubIt].citenumber,
                    citing: res0
                };

            } else {

                publi = {
                    title: updatedList[pubIt].title,
                    citingLink: '',
                    citenumber: 0,
                    citing: []
                };
            }

            if (res[targetNb].citing) {
                console.log(updatedList[pubIt].title);
                console.log("orglist " + res[targetNb].citing.length + ", newlist " + publi.citing.length + ", targetnbr " + updatedList[pubIt].citenumber);
            }

            res[targetNb] = publi;
            let likeJSON = JSON.stringify(res, null, 2);
            syncFs.writeFileSync(cachePath, likeJSON);
        }
    }

    await driver.quit();

})();
