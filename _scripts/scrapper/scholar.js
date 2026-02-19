// scraper/scholar.js

import { humanPause, humanBeforeClick } from "./human.js";

/* ================= CAPTCHA ================= */

export async function isCaptcha(page) {
  return await page.evaluate(() => {
    const text = document.body.innerText.toLowerCase();
    return (
      text.includes("unusual traffic") ||
      text.includes("are you a robot") ||
      text.includes("not a robot") ||
      document.querySelector("iframe[src*='recaptcha']") !== null
    );
  });
}

export async function waitForCaptchaSolved(page) {
  if (!(await isCaptcha(page))) return;

  console.log("🛑 CAPTCHA détecté");
  console.log("👉 Résous le CAPTCHA MANUELLEMENT");
  console.log("⏳ Le script est en pause totale");

  while (true) {
    await page.waitForTimeout(3000);
    if (!(await isCaptcha(page))) {
      console.log("✅ CAPTCHA résolu — reprise du script");
      await page.waitForTimeout(5000 + Math.random() * 5000);
      return;
    }
  }
}

/* ================= SETTINGS ================= */

export async function configureScholarSettings(page) {
  await page.waitForSelector("#gs_hdr_mnu", { timeout: 20000 });
  await humanBeforeClick(page);
  await page.click("#gs_hdr_mnu", { delay: 200 });

  await humanPause(page);

  await page.goto(
    "https://scholar.google.fr/scholar_settings?hl=en",
    { waitUntil: "domcontentloaded", timeout: 60000 }
  );

  await waitForCaptchaSolved(page);
  await humanPause(page);

  await page.waitForSelector("#gs_num-b", { timeout: 20000 });
  await humanBeforeClick(page);
  await page.click("#gs_num-b", { delay: 200 });

  await humanPause(page, 1500, 3000);
  await page.click("a[data-v='20']", { delay: 200 });

  await humanPause(page, 1500, 3000);
  await page.click("button[name='save']", { delay: 200 });

  await humanPause(page, 5000, 8000);
}

/* ================= PROFILE ================= */

export async function openProfile(page, userId) {
  await page.goto(
    `https://scholar.google.fr/citations?user=${userId}&hl=en`,
    { waitUntil: "domcontentloaded", timeout: 60000 }
  );

  await waitForCaptchaSolved(page);
  await humanPause(page);
  await page.waitForSelector("tr.gsc_a_tr", { timeout: 20000 });
}

/* ================= PUBLICATIONS ================= */

export async function loadAllPublications(page) {
  while (true) {
    await waitForCaptchaSolved(page);

    const more = await page.$("#gsc_bpf_more");
    if (!more || !(await more.isEnabled())) break;

    await humanBeforeClick(page);
    await more.hover();
    await page.waitForTimeout(1000 + Math.random() * 1500);
    await more.click({ delay: 250 });

    await humanPause(page, 6000, 10000);
  }
}

export async function extractPublications(page) {
  await humanPause(page);

  return await page.$$eval("tr.gsc_a_tr", rows =>
    rows.map(r => {
      const title = r.querySelector(".gsc_a_at")?.innerText ?? "";
      const cite = r.querySelector(".gsc_a_c a");

      return {
        title,
        citenumber: cite?.innerText ?? "0",
        citingLink: cite?.href ?? "",
        citing: [],
      };
    })
  );
}

/* ================= CITATIONS ================= */

export async function scrapeCitations(page, url) {
  const results = [];

  await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });

  await waitForCaptchaSolved(page);
  await humanPause(page);
  await page.waitForSelector(".gs_r", { timeout: 20000 });

  while (true) {
    await waitForCaptchaSolved(page);

    const items = await page.$$("[data-cid].gs_r");

    for (const item of items) {
      const title = await item.$eval("h3", el => el.innerText);
      const meta = await item.$eval(".gs_a", el => el.innerText);

      results.push({ title, meta });
      await page.waitForTimeout(800 + Math.random() * 1200);
    }

    const next = await page.$("a[aria-label='Next']");
    if (!next) break;

    await humanBeforeClick(page);
    await next.hover();
    await page.waitForTimeout(1200 + Math.random() * 1800);
    await next.click({ delay: 250 });

    await humanPause(page, 7000, 12000);
  }

  return results;
}
