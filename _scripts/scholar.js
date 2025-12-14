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
    '--start-maximized'
);
// ---- Randomized Chrome Args per Session ----
const randomUA = [
    "Mozilla/5.0 ... Chrome/120 Safari/537.36",
    "Mozilla/5.0 ... Chrome/121 Safari/537.36",
    "Mozilla/5.0 ... Chrome/122 Safari/537.36"
][Math.floor(Math.random()*3)];

const randomWindow = [
    "--window-size=1280,720",
    "--window-size=1366,768",
    "--window-size=1440,900",
][Math.floor(Math.random()*3)];

options.addArguments(`--user-agent=${randomUA}`);
options.addArguments(randomWindow);

if (Math.random() < 0.5) options.addArguments("--disable-gpu");
if (Math.random() < 0.3) options.addArguments("--force-device-scale-factor=1");
if (Math.random() < 0.3) options.addArguments("--force-device-scale-factor=2");

const profilePath = path.join(process.cwd(), "chrome-profile");
options.addArguments(`--user-data-dir=${profilePath}`);
options.excludeSwitches(['enable-automation']);
options.setUserPreferences({ 'credentials_enable_service': false });


let scholarPageCount = 0;
// ---- STEALTH PATCH ----
async function applyStealth(driver) {
    await driver.executeScript(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        // ---- Hardware Fingerprint Randomization ----
        Object.defineProperty(navigator, 'hardwareConcurrency', {
          get: () => [2, 4, 6, 8][Math.floor(Math.random()*4)]
          });
        Object.defineProperty(navigator, 'deviceMemory', {
          get: () => [4, 8, 16][Math.floor(Math.random()*3)]
          });
        Object.defineProperty(navigator, 'maxTouchPoints', {
          get: () => 0
          });
        Object.defineProperty(screen, 'colorDepth', {
          get: () => [24, 30][Math.floor(Math.random()*2)]
          });
        Object.defineProperty(screen, 'width', {
          get: () => 1280 + Math.floor(Math.random()*200)
          });
        Object.defineProperty(screen, 'height', {
          get: () => 720 + Math.floor(Math.random()*200)
          });
        
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

// ---- CAPTCHA DETECTION & WAIT ----
async function isCaptchaPresent(driver) {
    try {
        // 1) Text-based detection (case-insensitive)
        const texts = [
            'unusual traffic',
            'our systems have detected',
            'please show you are not a robot',
            'are you a robot'
        ];
        for (const t of texts) {
            const nodes = await driver.findElements(By.xpath(`//*[contains(translate(normalize-space(text()), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), "${t}")]`));
            if (nodes.length > 0) return true;
        }

        // 2) input field detection (common captcha input names/ids)
        const captchaInputs = await driver.findElements(By.css("input#captcha, input[name*='captcha'], input[id*='captcha']"));
        if (captchaInputs.length > 0) return true;

        // 3) element/class/id detection
        const captchaEls = await driver.findElements(By.css("[class*='captcha'], [id*='captcha']"));
        if (captchaEls.length > 0) return true;

        // 4) recaptcha iframe detection
        const frames = await driver.findElements(By.css("iframe[src*='recaptcha'], iframe[src*='google.com/recaptcha']"));
        if (frames.length > 0) return true;

        return false;
    } catch (e) {
        console.log("Error during CAPTCHA presence check:", e);
        // be conservative: if check fails, treat as no captcha
        return false;
    }
}

/**
 * If a CAPTCHA is detected, wait up to waitMs milliseconds for the user to solve it.
 * Polls every pollIntervalMs to check if CAPTCHA disappeared.
 * Returns true if solved within wait time, false otherwise.
 */
async function waitForCaptchaSolve(driver, waitMs = 60000, pollIntervalMs = 5000) {
    const present = await isCaptchaPresent(driver);
    if (!present) return true; // no captcha

    console.log(`⚠️ CAPTCHA detected. Please solve it in the opened browser. Waiting up to ${Math.round(waitMs/1000)}s...`);
    const start = Date.now();
    while (Date.now() - start < waitMs) {
        await sleep(pollIntervalMs);
        const still = await isCaptchaPresent(driver);
        if (!still) {
            console.log("✅ CAPTCHA solved — resuming.");
            // small human-like pause before continuing
            await adsleep(1500, 3000);
            return true;
        }
        const elapsed = Math.round((Date.now() - start) / 1000);
        console.log(`...still waiting (${elapsed}s)`);
    }

    console.log(`❌ CAPTCHA still present after ${Math.round(waitMs/1000)}s.`);
    return false;
}

// ---- SAFE NAVIGATION WITH RETRIES (uses captcha logic) ----
async function safeGet(driver, url, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await adsleep(1500, 4500);

            // occasional long human-like wait (low probability)
            if (Math.random() < 0.12) {
                const longWait = 15000 + Math.random() * 15000; // 15-30s
                console.log(`Long human-like wait before navigating: ${Math.round(longWait/1000)}s`);
                await sleep(longWait);
            }

            await driver.get(url);
            await adsleep(2000, 5000);
            await applyStealth(driver);

            // check captcha and wait for up to 60s if present
            const solved = await waitForCaptchaSolve(driver, 60000, 5000);
            if (!solved) {
                // If you prefer to keep waiting indefinitely instead of throwing, change behavior here.
                throw new Error('CAPTCHA not solved within 60s');
            }

            return;
        } catch (err) {
            console.log(`Attempt ${attempt} failed for URL: ${url} — ${err.message || err}`);
            if (attempt === retries) throw err;
            const waitTime = 5000 + Math.random() * 5000;
            console.log(`Waiting ${Math.round(waitTime)}ms before retrying...`);
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
            // locator is an object; for logging convert to string carefully
            try { console.log(`Attempt ${attempt} failed to find element: ${locator.using || ''} ${locator.value || ''}`); } catch(e){ }
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
              //console.log("[CookieCleaner] Clearing cookies to break tracking…");
              //await driver.manage().deleteAllCookies();
              //await adsleep(4000, 7000);  // small delay after clearing
            
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
