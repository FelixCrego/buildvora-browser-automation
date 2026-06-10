import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const saasList = [
  { slug: "aipm", url: "https://aipm-ruddy-two.vercel.app/dashboard" },
  { slug: "felix-crm", url: "https://felix-crm-xi.vercel.app/dashboard" },
  { slug: "linkgrowth", url: "https://linkgrowth-ai-saas.vercel.app/" },
  { slug: "real-estate-crm", url: "https://real-estate-crm-two-pi.vercel.app/dashboard" },
  { slug: "bluepeak-plumbing-crm", url: "https://bluepeak-plumbing-crm.vercel.app/dashboard" },
  { slug: "felix-marketing-hub", url: "https://felix-marketing-hub.vercel.app/login" },
  { slug: "real-estate-investor-marketing-hub", url: "https://real-estate-investor-marketing-hub.vercel.app/" },
  { slug: "junior-underwriter", url: "https://junior-underwriter.vercel.app/" },
  { slug: "backlink-prospector", url: "https://backlink-prospector.vercel.app/login" },
  { slug: "social-content-hub", url: "https://social-content-hub.vercel.app/" },
  { slug: "carrot-seoai", url: "https://carrot-seoai.vercel.app/" },
];

const outputDir = path.join(process.cwd(), "public", "screenshots");

async function ensureOutputDir() {
  await fs.mkdir(outputDir, { recursive: true });
}

async function capturePage(browser, item) {
  const context = await browser.newContext({
    viewport: { width: 1600, height: 1000 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const outputPath = path.join(outputDir, `${item.slug}.png`);

  try {
    await page.goto(item.url, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(3500);
    await page.screenshot({ path: outputPath, fullPage: false });
    // eslint-disable-next-line no-console
    console.log(`captured: ${item.slug}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`failed: ${item.slug}`, error?.message || error);
  } finally {
    await context.close();
  }
}

async function main() {
  await ensureOutputDir();
  const browser = await chromium.launch({ headless: true });
  try {
    for (const item of saasList) {
      await capturePage(browser, item);
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});

