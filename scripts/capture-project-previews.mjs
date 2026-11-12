import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';

const projects = [
  { slug: 'gtec-mahe', url: 'https://gtecmahe.com/' },
  { slug: 'mythili-manthra', url: 'https://www.mythilimanthra.in/' },
  { slug: 'hg-legal-services', url: 'https://hglegalservices.com/' },
];

const browser = await chromium.launch({
  headless: true,
  ...(process.env.BROWSER_CHANNEL ? { channel: process.env.BROWSER_CHANNEL } : {}),
});
try {
  const selected = process.argv[2] ? projects.filter(project => project.slug === process.argv[2]) : projects;
  const results = await Promise.allSettled(selected.map(async ({ slug, url }) => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1080 }, deviceScaleFactor: 1 });
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.locator('body').waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.waitForLoadState('load', { timeout: 20000 }).catch(() => {});
      await page.waitForTimeout(7000);
      const path = fileURLToPath(new URL(`../src/assets/${slug}.png`, import.meta.url));
      await page.screenshot({ path, animations: 'disabled' });
      console.log(JSON.stringify({ slug, title: await page.title(), text: (await page.locator('body').innerText()).slice(0, 3500), path }));
    } finally {
      await page.close();
    }
  }));
  for (const result of results) {
    if (result.status === 'rejected') {
      console.error(result.reason.message);
      process.exitCode = 1;
    }
  }
} finally {
  await browser.close();
}
