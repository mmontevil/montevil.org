// scraper/index.js

import { createBrowser } from "./browser.js";
import {
  openProfile,
  configureScholarSettings,
  loadAllPublications,
  extractPublications,
  scrapeCitations,
} from "./scholar.js";
import { loadCache, saveCache } from "./storage.js";

const USER_ID = "5eOo9hQAAAAJ";

const { browser, context } = await createBrowser();
const page = await context.newPage();

let cache = loadCache();

/* -------- PROFIL + SETTINGS -------- */

await openProfile(page, USER_ID);
await configureScholarSettings(page);
await openProfile(page, USER_ID);

/* -------- PUBLICATIONS -------- */

await loadAllPublications(page);
const pubs = await extractPublications(page);

/* -------- CITATIONS -------- */

for (const pub of pubs) {
  if (!pub.citingLink) continue;

  const cached = cache.find(c => c.title === pub.title);
  if (cached && cached.citing?.length) continue;

  console.log(`📄 Citations : ${pub.title}`);

  pub.citing = await scrapeCitations(page, pub.citingLink);

  cache = cache.filter(c => c.title !== pub.title).concat(pub);
  saveCache(cache);

  // pause longue aléatoire (CRUCIAL)
  if (Math.random() < 0.35) {
    console.log("⏸ Pause longue humaine");
    await page.waitForTimeout(20000 + Math.random() * 30000);
  }
}

await browser.close();
