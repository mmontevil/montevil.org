import { Builder, By, Key, until } from 'selenium-webdriver';
import { promises as fs } from 'fs';
import syncFs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

 import slugify from '../src/_utils/slugify.js';

dotenv.config();

/**
 * Sleep helper
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * ESM replacements for __filename / __dirname
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Resolve app root (replacement for require.main.filename)
 */
const appRoot = path.resolve(__dirname, '..');
const cachePath = path.join(appRoot, '_cache', 'people.json');

let res = {};

(async function example() {
  const driver = await new Builder().forBrowser('firefox').build();

  const documentInitialised = () =>
    driver.executeScript("return 'initialised'");

  try {
    const file = await fs.readFile(cachePath, 'utf8');
    res = JSON.parse(file) || {};

    const authors = Object.values(res) || [];
    const outdated = [
      '91n7gC0AAAAJ',
      'NaC6mSsAAAAJ',
      'r0hRIEwAAAAJ',
      'us2IQTMAAAAJ',
    ];

    for (const entry of authors) {
      const gsid = entry.gsid;

      if (gsid && gsid !== '' && !outdated.includes(gsid)) {
        console.log(
          'https://scholar.google.fr/citations?user=' + gsid
        );

        await driver.get(
          'https://scholar.google.fr/citations?user=' + gsid
        );
        await driver.wait(() => documentInitialised(), 12000);
        await sleep(3110);

        const titre = await driver.getTitle();

        if (titre !== 'Error 404 (Not Found)!!1') {
          const urls = await driver.findElements(
            By.xpath("//div[@id='gsc_prf_ivh']/a")
          );

          for (const url of urls) {
            const urlRes = await url.getAttribute('href');
            res[slugify(entry.shortname)].url = urlRes;
          }

          const nameel = await driver.findElement(
            By.xpath("//div[@id='gsc_prf_in']")
          );

          res[slugify(entry.shortname)].fullName =
            (await nameel.getText()).replaceAll('"', '');

          const affiliationel = await driver.findElement(
            By.xpath("//div[@id='gsc_prf_i']/div[@class='gsc_prf_il']")
          );

          res[slugify(entry.shortname)].affiliation =
            (await affiliationel.getText()).replaceAll('"', '');
        }
      }
    }
  } finally {
    await driver.quit();
    const likeJSON = JSON.stringify(res, null, 2);
    syncFs.writeFileSync(cachePath, likeJSON);
  }
})();
