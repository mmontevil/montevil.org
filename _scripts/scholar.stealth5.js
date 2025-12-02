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

async function randomSleep(min = 800, max = 2500) {
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

// ---- SAFE NAVIGATION ----
async function safeGet(driver, url, longWait = false) {
    await randomSleep(1500, 4500);
    await driver.get(url);
    await randomSleep(longWait ? 60000 : 2000, longWait ? 120000 : 5000);
    await applyStealth(driver);
}

(async function main() {
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

    const docReady = () => driver.executeScript("return 'initialised'");

    // ---- SETTINGS ----
    await safeGet(driver, 'https://scholar.google.fr/citations?user=5eOo9hQAAAAJ&hl=en&oi=ao', true);
    await driver.wait(() => docReady(), 10000);

    await driver.findElement(By.id('gs_hdr_mnu')).click();
    await safeGet(driver, 'https://scholar.google.fr/scholar_settings?hl=en', true);
    await driver.wait(() => docReady(), 10000);

    await driver.findElement(By.id('gs_num-b')).click();
    await randomSleep(900, 1800);
    await driver.findElement(By.xpath("//a[@data-v='20']")).click();
    await randomSleep(900, 1800);
    await driver.findElement(By.name('save')).click();

    await safeGet(driver, "https://scholar.google.fr/citations?user=5eOo9hQAAAAJ&hl=en&oi=ao", true);
    await driver.wait(() => docReady(), 10000);

    // ---- LOAD ALL PUBLICATIONS ----
    let moreExists = true;
    while (moreExists) {
        let moreButton = await driver.findElements(By.id("gsc_bpf_more"));
        if (moreButton.length > 0 && await moreButton[0].isEnabled()) {
            await moreButton[0].click();
            await randomSleep(3000, 6000);
        } else {
            moreExists = false;
        }
    }

    // ---- EXTRACT PUBLICATIONS ----
    let updatedList = [];
    let listmypub = await driver.findElements(By.xpath("//tr[@class='gsc_a_tr']"));
    for (let pubElem of listmypub) {
        let titleElem = await pubElem.findElement(By.xpath(".//a[@class='gsc_a_at']"));
        let title = await titleElem.getText();

        let citeElems = await pubElem.findElements(By.xpath(".//td[@class='gsc_a_c']/a[not(@data-eid)]"));
        if (citeElems.length > 0) {
            let citeNumText = await citeElems[0].getText();
            updatedList.push({
                title,
                citingLink: citeNumText.length ? await citeElems[0].getAttribute('href') : '',
                citenumber: citeNumText.length ? citeNumText : 0
            });
        }
    }

    // ---- PROCESS CITATIONS ----
    for (let pub of updatedList) {
        let targetIdx = res.findIndex(r => r.title === pub.title);
        if (targetIdx === -1) {
            res.push([]);
            targetIdx = res.length - 1;
        }

        if (res[targetIdx].citenumber === pub.citenumber) continue;

        let publi = { title: pub.title, citingLink: pub.citingLink, citenumber: 0, citing: [] };

        if (pub.citenumber > 0) {
            await safeGet(driver, pub.citingLink, true);
            await driver.wait(() => docReady(), 10000);

            let headdd = await driver.findElement(By.xpath("//div[@id='gs_ab_md']"));
            let auth0 = await headdd.getText();
            let numberava1 = parseInt(auth0.split(" ")[0]);
            let numberava = parseInt(auth0.split(" ")[1]);
            if (isNaN(numberava)) numberava = numberava1;
            publi.citenumber = numberava;

            // ---- SCRAPE CITING PUBLICATIONS ----
            let allCiting = [];
            let hasNext = true;
            while (hasNext) {
                let citingElems = await driver.findElements(By.xpath("//div[@data-cid and @class='gs_r gs_or gs_scl']"));
                for (let c of citingElems) {
                    let gid = await c.getAttribute('data-cid');
                    let titleElem = await c.findElement(By.xpath(".//h3"));
                    let title = await titleElem.getText();
                    let mainlinkElem = await titleElem.findElements(By.xpath(".//a"));
                    let mainlink = mainlinkElem.length ? await mainlinkElem[0].getAttribute('href') : '';

                    let authorsElem = await c.findElement(By.xpath(".//div[@class='gs_a']"));
                    let authText = await authorsElem.getText();
                    let authList = authText.split(' - ')[0].split(', ').map(a => a.replace(/…/g, ''));
                    let authLinksElems = await authorsElem.findElements(By.xpath(".//a"));
                    let authLinks = authList.map((_, i) => authLinksElems[i] ? authLinksElems[i].getAttribute('href').then(h => h.substring(h.indexOf('=')+1, h.indexOf('&'))) : '');

                    let venueYear = authText.split(' - ')[1] || '';
                    let venue = venueYear.split(', ').length > 1 ? venueYear.split(', ')[0] : '';
                    let year = venueYear.split(', ').pop() || '';

                    let pdfElem = await c.findElements(By.xpath(".//div[@class='gs_or_ggsm']/a"));
                    let pdflink = pdfElem.length ? await pdfElem[0].getAttribute('href') : '';

                    allCiting.push({ title, authors: authList, authorsid: await Promise.all(authLinks), year, journal: venue, gid, pdflink, mainlink });
                }

                let nextElems = await driver.findElements(By.xpath("//td[@align='left']/a"));
                if (nextElems.length) {
                    await safeGet(driver, await nextElems[0].getAttribute('href'), true);
                    hasNext = true;
                } else hasNext = false;
            }

            publi.citing = allCiting;
        }

        res[targetIdx] = publi;
        syncFs.writeFileSync(cachePath, JSON.stringify(res, null, 2));
    }

    await driver.quit();
})();
