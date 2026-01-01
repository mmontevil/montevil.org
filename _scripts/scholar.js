import { Builder, By, Key, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import { promises as fs } from "fs";
import syncFs from "fs";
import dotenv from "dotenv";
import slugifyString from "@sindresorhus/slugify";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ---------------------------------- */
/* Helpers                            */
/* ---------------------------------- */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function adsleep(min = 800, max = 2500) {
  return new Promise((resolve) =>
    setTimeout(resolve, min + Math.random() * (max - min)),
  );
}

/* ---------------------------------- */
/* Selenium config                    */
/* ---------------------------------- */
const options = new chrome.Options();
options.addArguments(
  "--disable-blink-features=AutomationControlled",
  "--disable-infobars",
  "--disable-dev-shm-usage",
  "--no-sandbox",
  "--disable-gpu",
  "--window-size=1280,800",
  "--start-maximized",
);

const randomUA = [
  "Mozilla/5.0 ... Chrome/120 Safari/537.36",
  "Mozilla/5.0 ... Chrome/121 Safari/537.36",
  "Mozilla/5.0 ... Chrome/122 Safari/537.36",
][Math.floor(Math.random() * 3)];

const randomWindow = [
  "--window-size=1280,720",
  "--window-size=1366,768",
  "--window-size=1440,900",
][Math.floor(Math.random() * 3)];

options.addArguments(`--user-agent=${randomUA}`);
options.addArguments(randomWindow);

if (Math.random() < 0.5) options.addArguments("--disable-gpu");
if (Math.random() < 0.3) options.addArguments("--force-device-scale-factor=1");
if (Math.random() < 0.3) options.addArguments("--force-device-scale-factor=2");

const profilePath = path.join(process.cwd(), "chrome-profile");
options.addArguments(`--user-data-dir=${profilePath}`);
options.excludeSwitches(["enable-automation"]);
options.setUserPreferences({ credentials_enable_service: false });

/* ---------------------------------- */
/* Stealth patch                      */
/* ---------------------------------- */
async function applyStealth(driver) {
  await driver.executeScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });

    Object.defineProperty(navigator, "hardwareConcurrency", {
      get: () => [2, 4, 6, 8][Math.floor(Math.random() * 4)],
    });

    Object.defineProperty(navigator, "deviceMemory", {
      get: () => [4, 8, 16][Math.floor(Math.random() * 3)],
    });

    Object.defineProperty(navigator, "maxTouchPoints", { get: () => 0 });

    Object.defineProperty(screen, "colorDepth", {
      get: () => [24, 30][Math.floor(Math.random() * 2)],
    });

    Object.defineProperty(screen, "width", {
      get: () => 1280 + Math.floor(Math.random() * 200),
    });

    Object.defineProperty(screen, "height", {
      get: () => 720 + Math.floor(Math.random() * 200),
    });

    window.navigator.chrome = { runtime: {} };

    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters) =>
      parameters.name === "notifications"
        ? Promise.resolve({ state: Notification.permission })
        : originalQuery(parameters);

    Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3] });
    Object.defineProperty(navigator, "languages", {
      get: () => ["fr-FR", "fr"],
    });
  });
}

/* ---------------------------------- */
/* CAPTCHA detection                  */
/* ---------------------------------- */
async function isCaptchaPresent(driver) {
  try {
    const texts = [
      "unusual traffic",
      "our systems have detected",
      "please show you are not a robot",
      "are you a robot",
    ];

    for (const t of texts) {
      const nodes = await driver.findElements(
        By.xpath(
          `//*[contains(translate(normalize-space(text()), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), "${t}")]`,
        ),
      );
      if (nodes.length > 0) return true;
    }

    if (
      (
        await driver.findElements(
          By.css("input#captcha, input[name*='captcha'], input[id*='captcha']"),
        )
      ).length
    )
      return true;
    if (
      (await driver.findElements(By.css("[class*='captcha'], [id*='captcha']")))
        .length
    )
      return true;
    if (
      (
        await driver.findElements(
          By.css(
            "iframe[src*='recaptcha'], iframe[src*='google.com/recaptcha']",
          ),
        )
      ).length
    )
      return true;

    return false;
  } catch {
    return false;
  }
}

async function waitForCaptchaSolve(
  driver,
  waitMs = 60000,
  pollIntervalMs = 5000,
) {
  if (!(await isCaptchaPresent(driver))) return true;

  console.log("⚠️ CAPTCHA detected — solve manually");
  const start = Date.now();

  while (Date.now() - start < waitMs) {
    await sleep(pollIntervalMs);
    if (!(await isCaptchaPresent(driver))) {
      console.log("✅ CAPTCHA solved");
      await adsleep(1500, 3000);
      return true;
    }
  }

  return false;
}

/* ---------------------------------- */
/* Safe navigation                    */
/* ---------------------------------- */
async function safeGet(driver, url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await adsleep(1500, 4500);
      if (Math.random() < 0.12) await sleep(15000 + Math.random() * 15000);

      await driver.get(url);
      await adsleep(2000, 5000);
      await applyStealth(driver);

      if (!(await waitForCaptchaSolve(driver)))
        throw new Error("CAPTCHA timeout");

      return;
    } catch (err) {
      if (attempt === retries) throw err;
      await sleep(5000 + Math.random() * 5000);
    }
  }
}

async function findElementSafe(driver, locator, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await driver.findElement(locator);
    } catch (err) {
      if (attempt === retries) throw err;
      await sleep(3000 + Math.random() * 4000);
    }
  }
}

/* ---------------------------------- */
/* Main                               */
/* ---------------------------------- */
(async () => {
  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  await applyStealth(driver);

  const cachePath = path.join(
    path.resolve(__dirname, ".."),
    "src/_data/scholar2.json",
  );

  let res = [];
  if (syncFs.existsSync(cachePath)) {
    res = JSON.parse(await fs.readFile(cachePath, "utf8")) || [];
  }

  const documentInitialised = () =>
    driver.executeScript("return 'initialised'");

  // SETTINGS
  await safeGet(
    driver,
    "https://scholar.google.fr/citations?user=5eOo9hQAAAAJ&hl=en&oi=ao",
  );

  await driver.wait(() => documentInitialised(), 10000);
  await findElementSafe(driver, By.id("gs_hdr_mnu")).then((el) => el.click());
  await safeGet(driver, "https://scholar.google.fr/scholar_settings?hl=en");
  await driver.wait(() => documentInitialised(), 10000);

  await adsleep(1200, 2600);
  await findElementSafe(driver, By.id("gs_num-b")).then((el) => el.click());
  await adsleep(900, 1800);
  await findElementSafe(driver, By.xpath("//a[@data-v='20']")).then((el) =>
    el.click(),
  );
  await adsleep(900, 1800);
  await findElementSafe(driver, By.name("save")).then((el) => el.click());

  await safeGet(
    driver,
    "https://scholar.google.fr/citations?user=5eOo9hQAAAAJ&hl=en&oi=ao",
  );
  await driver.wait(() => documentInitialised(), 10000);

  // LOAD ALL PUBLICATIONS
  let temp = true;
  while (temp) {
    const belows = await driver.findElements(By.id("gsc_bpf_more"));
    if (belows.length > 0) {
      temp = await belows[0].isEnabled();
      await belows[0].click();
      await adsleep(3000, 6000);
    } else temp = false;
  }

  // EXTRACT PUBLICATIONS
  const updatedList = [];
  const listmypub = await driver.findElements(
    By.xpath("//tr[@class='gsc_a_tr']"),
  );
  for (const pubElement of listmypub) {
    const title0 = await pubElement.findElement(
      By.xpath(".//a[@class='gsc_a_at']"),
    );
    const titleText = await title0.getText();
    const numberCiteEls = await pubElement.findElements(
      By.xpath(".//td[@class='gsc_a_c']/a[not(@data-eid)]"),
    );
    if (numberCiteEls.length > 0) {
      const numberCite = numberCiteEls[0];
      const numberCiteText = await numberCite.getText();
      const linkciting =
        numberCiteText.length > 0 ? await numberCite.getAttribute("href") : "";
      updatedList.push({
        title: titleText,
        citingLink: linkciting,
        citenumber: numberCiteText || 0,
      });
    }
  }

  // PARSE CITATIONS
  for (const pubItem of updatedList) {
    let targetNb = res.findIndex((r) => r.title === pubItem.title);
    if (targetNb >= 0) res[targetNb].citenumber = res[targetNb].citing.length;
    if (targetNb < 0 || res[targetNb]?.citenumber != pubItem.citenumber) {
      if (targetNb < 0) {
        res.push({});
        targetNb = res.length - 1;
      }
      const publi = { ...pubItem, citing: [] };

      if (pubItem.citenumber > 0 && pubItem.citingLink) {
        await safeGet(driver, pubItem.citingLink);
        await driver.wait(() => documentInitialised(), 10000);
        const res0 = [];
        let hasNext = true;

        while (hasNext) {
          const listpub = await driver.findElements(
            By.xpath("//div[@data-cid and contains(@class,'gs_r')]"),
          );

          for (const item of listpub) {
            const gid = await item.getAttribute("data-cid");

            const pdfEls = await item.findElements(
              By.xpath(".//div[@class='gs_or_ggsm']/a"),
            );
            const pdflink = pdfEls.length
              ? await pdfEls[0].getAttribute("href")
              : "";

            const titleEl = await item.findElement(By.xpath(".//h3"));
            const title = await titleEl.getText();

            const linkEls = await titleEl.findElements(By.xpath(".//a"));
            const mainlink = linkEls.length
              ? await linkEls[0].getAttribute("href")
              : "";

            const metaEl = await item.findElement(
              By.xpath(".//div[@class='gs_a']"),
            );
            const metaText = await metaEl.getText();

            const authorPart = metaText.split(" - ")[0];
            const authors = authorPart
              .split(", ")
              .map((a) => a.replace(/…/g, ""));

            const authorLinks = [];
            const authorLinkEls = await metaEl.findElements(By.xpath(".//a"));
            let i = 0;

            for (const a of authors) {
              let id = "";
              if (authorLinkEls[i]) {
                const txt = await authorLinkEls[i].getText();
                if (txt === a) {
                  const href = await authorLinkEls[i].getAttribute("href");
                  id = href.substring(href.indexOf("=") + 1, href.indexOf("&"));
                  i++;
                }
              }
              authorLinks.push(id);
            }

            let year = "";
            let journal = "";
            const pubInfo = metaText.split(" - ")[1];
            if (pubInfo) {
              const parts = pubInfo.split(", ");
              year = parts.at(-1);
              if (parts.length > 1) journal = parts[0];
            }

            res0.push({
              title,
              authors,
              authorsid: authorLinks,
              year,
              journal,
              gid,
              pdflink,
              mainlink,
            });
          }

          hasNext = false;
          const nextLinks = await driver.findElements(
            By.xpath("//td[@align='left']/a"),
          );
          if (nextLinks.length) {
            await safeGet(driver, await nextLinks[0].getAttribute("href"));
            hasNext = true;
          }
        }
        publi.citing = res0;
      }

      res[targetNb] = publi;
      syncFs.writeFileSync(cachePath, JSON.stringify(res, null, 2));
    }
  }

  await driver.quit();
})();
