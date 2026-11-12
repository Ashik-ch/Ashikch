import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';

const baseURL = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const screenshots = await mkdtemp(join(tmpdir(), 'portfolio-startup-'));
const browser = await chromium.launch({
  headless: true,
  ...(process.env.BROWSER_CHANNEL ? { channel: process.env.BROWSER_CHANNEL } : {}),
});

try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: 'block' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    let releaseScripts;
    const scriptsReady = new Promise(resolve => { releaseScripts = resolve; });
    await page.route('**/assets/*.js', async route => {
      await scriptsReady;
      await route.continue();
    });
    await page.goto(baseURL, { waitUntil: 'commit' });
    await page.locator('.startup-hero').waitFor();
    await page.evaluate(() => document.fonts.ready);
    const before = await page.locator('#home h1').boundingBox();
    const beforeDescription = await page.locator('#home p').boundingBox();
    const beforeTitle = await page.locator('.startup-title').textContent();
    assert.equal(await page.locator('#home').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(3, 7, 18)');
    assert.equal(await page.locator('#home h1').evaluate(el => getComputedStyle(el).fontSize), width === 1440 ? '96px' : '60px');
    assert.equal(await page.locator('#root header').count(), 0, 'Do not display the old unstyled navigation');
    await page.screenshot({ path: join(screenshots, `before-${width}.png`) });
    releaseScripts();
    await page.locator('.hero-pattern').waitFor();
    const heading = page.locator('#home h1');
    assert.equal(await page.locator('#home .text-cyan-300').textContent(), beforeTitle, 'Startup title must match the React hero');
    assert.equal(await heading.evaluate(el => getComputedStyle(el).opacity), '1', 'Hero must be visible as soon as React mounts');
    const after = await heading.boundingBox();
    const afterDescription = await page.locator('#home p').boundingBox();
    for (const key of ['x', 'y', 'width', 'height']) {
      assert.ok(Math.abs(before[key] - after[key]) < 2, `Heading ${key} jumped: ${before[key]} -> ${after[key]} at ${width}px`);
      assert.ok(Math.abs(beforeDescription[key] - afterDescription[key]) < 2, `Description ${key} jumped at ${width}px`);
    }
    await page.screenshot({ path: join(screenshots, `after-${width}.png`) });
    assert.deepEqual(errors, []);
    await context.close();
    console.log(`${width}px: styled first paint and stable React handoff passed`);
  }

  const context = await browser.newContext({ javaScriptEnabled: false, serviceWorkers: 'block' });
  const page = await context.newPage();
  await page.route('**/*.css', route => route.abort());
  await page.goto(baseURL);
  assert.equal(await page.locator('.startup-hero h1').evaluate(el => getComputedStyle(el).fontSize), '96px');
  assert.equal(await page.locator('.startup-hero').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(3, 7, 18)');
  assert.equal(await page.locator('.offline-content #contact').count(), 1, 'Keep no-JavaScript contact content accessible');
  await context.close();
  console.log(`No-JavaScript / unavailable stylesheet fallback passed. Screenshots: ${screenshots}`);
} finally {
  await browser.close();
}
