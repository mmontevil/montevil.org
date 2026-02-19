// scraper/human.js

export async function humanPause(page, min = 3000, max = 7000) {
  await page.waitForTimeout(min + Math.random() * (max - min));
}

export async function humanScroll(page) {
  await page.mouse.wheel(0, 200 + Math.random() * 400);
  await page.waitForTimeout(1000 + Math.random() * 1500);
}

export async function humanBeforeClick(page) {
  await humanScroll(page);
  await page.waitForTimeout(1500 + Math.random() * 2000);
}
