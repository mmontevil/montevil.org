import { chromium } from "playwright";
import path from "path";

export async function createBrowser() {
  const userDataDir = path.resolve("pw-profile");

  const browser = await chromium.launch({
    headless: false,
    args: [
      "--disable-blink-features=AutomationControlled",
      "--no-sandbox",
    ],
  });

  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    locale: "fr-FR",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/121 Safari/537.36",
  });

  // Stealth AVANT toute page
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    Object.defineProperty(navigator, "languages", {
      get: () => ["fr-FR", "fr"],
    });
    Object.defineProperty(navigator, "plugins", {
      get: () => [1, 2, 3, 4],
    });
  });

  return { browser, context };
}