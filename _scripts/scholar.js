import { chromium } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { promises as fs } from "fs";
import syncFs from "fs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

chromium.use(StealthPlugin());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ---------------------------------- */
/* Helpers                            */
/* ---------------------------------- */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Much longer delays — Scholar needs 5–15s between requests minimum
async function adsleep(min = 5000, max = 15000) {
  return new Promise((resolve) =>
    setTimeout(resolve, min + Math.random() * (max - min)),
  );
}

// Occasional long pause to mimic a human taking a break
async function maybeBreak() {
  if (Math.random() < 0.15) {
    const pause = 20000 + Math.random() * 40000;
    console.log(`💤 Taking a ${Math.round(pause / 1000)}s break...`);
    await sleep(pause);
  }
}

/* ---------------------------------- */
/* Real User-Agent strings            */
/* ---------------------------------- */
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
];

const WINDOW_SIZES = [
  { width: 1280, height: 720 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
  { width: 1536, height: 864 },
];

/* ---------------------------------- */
/* Browser factory                    */
/* ---------------------------------- */
async function launchBrowser() {
  const ua = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  const win = WINDOW_SIZES[Math.floor(Math.random() * WINDOW_SIZES.length)];
  const profilePath = path.join(process.cwd(), "chrome-profile");

  // launchPersistentContext is required when using a user data dir in Playwright
  const context = await chromium.launchPersistentContext(profilePath, {
    headless: false, // Keep visible — headless is easier to detect
    userAgent: ua,
    viewport: win,
    locale: "fr-FR",
    timezoneId: "Europe/Paris",
    permissions: [],
    extraHTTPHeaders: {
      "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
    },
    args: [
      "--disable-blink-features=AutomationControlled",
      "--disable-infobars",
      "--disable-dev-shm-usage",
      "--no-sandbox",
      `--window-size=${win.width},${win.height}`,
    ],
  });

  // Block images/fonts to reduce fingerprint surface and speed up loads
  await context.route("**/*.{png,jpg,jpeg,gif,webp,svg,woff,woff2,ttf}", (route) =>
    route.abort(),
  );

  const page = await context.newPage();

  // Extra stealth: override navigator properties
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "hardwareConcurrency", { get: () => [4, 6, 8][Math.floor(Math.random() * 3)] });
    Object.defineProperty(navigator, "deviceMemory", { get: () => [8, 16][Math.floor(Math.random() * 2)] });
    Object.defineProperty(navigator, "maxTouchPoints", { get: () => 0 });
    Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3, 4, 5] });
    window.navigator.chrome = { runtime: {} };
  });

  // launchPersistentContext has no separate browser object — context IS the top-level handle
  return { browser: context, context, page };
}

/* ---------------------------------- */
/* CAPTCHA detection                  */
/* ---------------------------------- */
async function isCaptchaPresent(page) {
  try {
    const bodyText = (await page.textContent("body")).toLowerCase();
    const triggers = [
      "unusual traffic",
      "our systems have detected",
      "please show you are not a robot",
      "are you a robot",
      "i'm not a robot",
    ];
    if (triggers.some((t) => bodyText.includes(t))) return true;

    const captchaSelectors = [
      "input#captcha",
      "input[name*='captcha']",
      "[class*='captcha']",
      "[id*='captcha']",
      "iframe[src*='recaptcha']",
    ];
    for (const sel of captchaSelectors) {
      if ((await page.locator(sel).count()) > 0) return true;
    }
    return false;
  } catch {
    return false;
  }
}

async function waitForCaptchaSolve(page, waitMs = 120000, pollMs = 5000) {
  if (!(await isCaptchaPresent(page))) return true;

  console.log("⚠️  CAPTCHA detected — solve it manually in the browser window");
  const start = Date.now();

  while (Date.now() - start < waitMs) {
    await sleep(pollMs);
    if (!(await isCaptchaPresent(page))) {
      console.log("✅ CAPTCHA solved");
      await adsleep(3000, 6000);
      return true;
    }
  }

  console.error("❌ CAPTCHA timeout");
  return false;
}

/* ---------------------------------- */
/* Safe navigation                    */
/* ---------------------------------- */
async function safeGet(page, url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await maybeBreak();
      await adsleep(5000, 12000); // Longer wait before every navigation

      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
      await adsleep(3000, 7000);

      if (!(await waitForCaptchaSolve(page))) throw new Error("CAPTCHA timeout");
      return;
    } catch (err) {
      console.warn(`⚠️  Attempt ${attempt} failed for ${url}: ${err.message}`);
      if (attempt === retries) throw err;
      await sleep(10000 + Math.random() * 10000);
    }
  }
}

/* ---------------------------------- */
/* Main                               */
/* ---------------------------------- */
(async () => {
  const { context, page } = await launchBrowser();

  const cachePath = path.join(
    path.resolve(__dirname, ".."),
    "src/_data/scholar2.json",
  );

  let res = [];
  if (syncFs.existsSync(cachePath)) {
    res = JSON.parse(await fs.readFile(cachePath, "utf8")) || [];
  }

  // SETTINGS — set results-per-page to 20
  await safeGet(page, "https://scholar.google.fr/citations?user=5eOo9hQAAAAJ&hl=en&oi=ao");
  await page.locator("#gs_hdr_mnu").click();
  await adsleep(2000, 4000);

  await safeGet(page, "https://scholar.google.fr/scholar_settings?hl=en");
  await page.locator("#gs_num-b").click();
  await adsleep(1500, 3000);
  // Wait for dropdown option to appear before clicking
  await page.waitForSelector("a[data-v='20']", { timeout: 10000 });
  await page.locator("a[data-v='20']").click();
  await adsleep(1500, 3000);
  await page.locator("[name='save']").click();
  await adsleep(3000, 6000);

  await safeGet(page, "https://scholar.google.fr/citations?user=5eOo9hQAAAAJ&hl=en&oi=ao");
  console.log("✅ Loaded profile page");

  // LOAD ALL PUBLICATIONS
  let hasMore = true;
  while (hasMore) {
    const btn = page.locator("#gsc_bpf_more");
    if ((await btn.count()) > 0 && (await btn.isEnabled())) {
      await btn.click();
      await adsleep(5000, 10000); // Longer wait after each "show more"
    } else {
      hasMore = false;
    }
  }
  console.log("✅ All publications loaded");

  // EXTRACT PUBLICATIONS
  const updatedList = [];
  const rows = await page.locator("tr.gsc_a_tr").all();

  for (const row of rows) {
    const titleText = await row.locator("a.gsc_a_at").textContent();
    const citeEl = row.locator("td.gsc_a_c a:not([data-eid])");

    if ((await citeEl.count()) > 0) {
      const numberCiteText = (await citeEl.textContent()).trim();
      const citenumber = parseInt(numberCiteText, 10) || 0;
      let linkciting = "";
      if (citenumber > 0) {
        const rawHref = await citeEl.getAttribute("href");
        linkciting = rawHref
          ? rawHref.startsWith("http")
            ? rawHref
            : `https://scholar.google.fr${rawHref}`
          : "";
      }
      updatedList.push({
        title: titleText.trim(),
        citingLink: linkciting,
        citenumber,
      });
    }
  }
  console.log(`✅ Extracted ${updatedList.length} publications`);

  // PARSE CITATIONS
  for (const pubItem of updatedList) {
    let targetNb = res.findIndex((r) => r.title === pubItem.title);
    if (targetNb >= 0) res[targetNb].citenumber = res[targetNb].citing?.length ?? 0;

    if (targetNb < 0 || res[targetNb]?.citenumber !== pubItem.citenumber) {
      if (targetNb < 0) {
        res.push({});
        targetNb = res.length - 1;
      }
      const publi = { ...pubItem, citing: [] };

      if (pubItem.citenumber > 0 && pubItem.citingLink) {
        await safeGet(page, pubItem.citingLink);
        const res0 = [];
        let hasNext = true;

        while (hasNext) {
          const items = await page.locator("div[data-cid].gs_r").all();

          for (const item of items) {
            const gid = await item.getAttribute("data-cid");

            const pdfEl = item.locator("div.gs_or_ggsm a").first();
            const pdflink = (await pdfEl.count()) > 0 ? await pdfEl.getAttribute("href") : "";

            const titleEl = item.locator("h3");
            const title = await titleEl.textContent();

            const linkEl = titleEl.locator("a");
            const mainlink = (await linkEl.count()) > 0 ? await linkEl.getAttribute("href") : "";

            const metaText = await item.locator("div.gs_a").textContent();

            const authorPart = metaText.split(" - ")[0];
            const authors = authorPart
              .split(", ")
              .map((a) => a.replace(/…/g, "").trim());

            const authorLinks = [];
            const authorLinkEls = await item.locator("div.gs_a a").all();
            let i = 0;
            for (const a of authors) {
              let id = "";
              if (authorLinkEls[i]) {
                const txt = (await authorLinkEls[i].textContent()).trim();
                if (txt === a) {
                  const href = await authorLinkEls[i].getAttribute("href");
                  id = href ? href.substring(href.indexOf("=") + 1, href.indexOf("&")) : "";
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

            res0.push({ title: title.trim(), authors, authorsid: authorLinks, year, journal, gid, pdflink, mainlink });
          }

          hasNext = false;
          const nextLink = page.locator("td[align='left'] a").first();
          if ((await nextLink.count()) > 0) {
            const href = await nextLink.getAttribute("href");
            const nextUrl = href.startsWith("http")
              ? href
              : `https://scholar.google.fr${href}`;
            await safeGet(page, nextUrl);
            hasNext = true;
          }
        }
        publi.citing = res0;
      }

      res[targetNb] = publi;
      syncFs.writeFileSync(cachePath, JSON.stringify(res, null, 2));
      console.log(`💾 Saved: ${pubItem.title}`);
    }
  }

  await context.close();
  console.log("✅ Done");
})();
