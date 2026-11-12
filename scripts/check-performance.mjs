import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';

// Run against a production preview; no forms are submitted or accounts modified.
const baseURL = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const screenshots = await mkdtemp(join(tmpdir(), 'portfolio-performance-'));
const browser = await chromium.launch({
  headless: true,
  ...(process.env.BROWSER_CHANNEL ? { channel: process.env.BROWSER_CHANNEL } : {}),
});

try {
  for (const mobile of [false, true]) {
    const context = await browser.newContext({
      viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
      isMobile: mobile,
      hasTouch: mobile,
      deviceScaleFactor: mobile ? 3 : 1,
      reducedMotion: mobile ? 'reduce' : 'no-preference',
    });
    const page = await context.newPage();
    const errors = [];
    const scripts = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => {
      if (request.resourceType() === 'script') scripts.push(request.url());
    });
    await page.addInitScript(() => {
      window.animationCallbacks = 0;
      const original = window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame = callback => original(time => {
        window.animationCallbacks++;
        callback(time);
      });
    });
    await page.goto(baseURL);
    await page.locator('#home h1').waitFor();
    // Sample idle work after entrance transitions and deferred startup finish.
    await page.waitForTimeout(3500);
    const heroPattern = page.locator('.hero-pattern');
    const gridSnake = page.locator('.hero-grid-snake');
    const primaryDepth = page.locator('.hero-parallax-primary');
    const secondaryDepth = page.locator('.hero-parallax-secondary');
    const headingBounds = await page.locator('#home h1').boundingBox();
    assert.equal(await heroPattern.getAttribute('data-active'), String(!mobile));
    if (mobile) {
      assert.equal(await gridSnake.evaluate(el => getComputedStyle(el).display), 'none');
    } else {
      await page.evaluate(() => {
        Object.defineProperty(document, 'hidden', { configurable: true, value: true });
        document.dispatchEvent(new Event('visibilitychange'));
      });
      assert.equal(await heroPattern.getAttribute('data-active'), 'false', 'Pause the hero in hidden tabs');
      await page.evaluate(() => {
        delete document.hidden;
        document.dispatchEvent(new Event('visibilitychange'));
      });
      assert.equal(await heroPattern.getAttribute('data-active'), 'true');
    }
    if (mobile) {
      await page.touchscreen.tap(200, 220);
      assert.equal(await primaryDepth.evaluate(el => getComputedStyle(el).transform), 'none', 'Touch must not trigger parallax');
      assert.equal(await page.locator('html').evaluate(el => el.classList.contains('cinematic-cursor-active')), false);
    } else {
      await page.mouse.move(400, 240);
      await page.mouse.move(600, 320, { steps: 8 });
      await page.waitForFunction(() => {
        const near = new DOMMatrix(getComputedStyle(document.querySelector('.hero-parallax-primary')).transform);
        const far = new DOMMatrix(getComputedStyle(document.querySelector('.hero-parallax-secondary')).transform);
        return near.m41 < -1 && far.m41 > 1;
      });
      assert.deepEqual(await page.locator('#home h1').boundingBox(), headingBounds, 'Parallax must not shift the heading');
      assert.equal(await heroPattern.getAttribute('data-pointer'), 'true');
      const trailPoints = await gridSnake.locator('polyline').getAttribute('points');
      const vertices = trailPoints.split(' ').map(point => point.split(',').map(Number));
      assert.ok(vertices.length > 1 && vertices.length <= 14, 'Snake keeps a bounded tail');
      for (let i = 1; i < vertices.length; i++) {
        const [x, y] = vertices[i];
        const [previousX, previousY] = vertices[i - 1];
        assert.equal(x % 36, 0);
        assert.equal(y % 36, 0);
        assert.equal(Math.abs(x - previousX) + Math.abs(y - previousY), 36, 'Snake follows grid edges');
      }
      await page.waitForTimeout(500);
      assert.equal(await gridSnake.locator('polyline').getAttribute('points'), trailPoints, 'Snake holds its shape without fading at rest');
      assert.equal(await gridSnake.evaluate(el => getComputedStyle(el).visibility), 'visible');
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForFunction(() => getComputedStyle(document.querySelector('.hero-parallax-primary')).transform === 'none');
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.waitForFunction(() => document.querySelector('.hero-pattern').dataset.active === 'true');
      await page.mouse.move(610, 325);
      assert.equal(await page.locator('.cinematic-cursor').getAttribute('data-visible'), 'true');
      await page.mouse.down();
      assert.equal(await page.locator('.cinematic-cursor').getAttribute('data-pressed'), 'true');
      await page.mouse.up();
      assert.equal(await page.locator('.cinematic-cursor').getAttribute('data-pressed'), 'false');
      for (const label of ['View Projects', 'Hire Me']) {
        await page.getByRole('link', { name: label, exact: true }).hover();
        assert.equal(await page.locator('.cinematic-cursor').getAttribute('data-hover'), 'true');
        assert.equal(await gridSnake.evaluate(el => getComputedStyle(el).visibility), 'hidden', `Hide snake over ${label}`);
        assert.equal(await gridSnake.locator('polyline').getAttribute('points'), '');
        await page.mouse.move(900, 300);
        await page.waitForFunction(() => document.querySelector('.hero-pattern').dataset.pointer === 'true');
      }
    }
    await page.waitForTimeout(1000);
    const start = await page.evaluate(() => window.animationCallbacks);
    await page.waitForTimeout(1500);
    const idleCallbacks = await page.evaluate(() => window.animationCallbacks) - start;
    assert.ok(idleCallbacks < 5, `Unexpected idle animation loop: ${idleCallbacks} callbacks`);
    assert.equal(await page.locator('canvas').count(), 0);
    assert.ok(!scripts.some(url => /TaskManager|firebaseApp|pushNotifications/.test(url)), 'Private features loaded on homepage');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), 'Horizontal overflow');
    await page.screenshot({ path: join(screenshots, mobile ? 'mobile.png' : 'desktop.png') });

    const dock = page.getByRole('navigation', { name: 'Main navigation' });
    assert.equal(await dock.locator('a[href^="#"]').count(), 6);
    assert.equal(await dock.getByRole('link', { name: 'Home', exact: true }).getAttribute('aria-current'), 'location');
    if (mobile) await dock.getByRole('link', { name: 'Projects', exact: true }).tap();
    else {
      const projectsLink = dock.getByRole('link', { name: 'Projects', exact: true });
      await projectsLink.hover();
      await page.waitForTimeout(250);
      assert.equal(await projectsLink.locator('.dock-tooltip').evaluate(el => getComputedStyle(el).visibility), 'visible');
      await projectsLink.focus();
      await page.keyboard.press('Enter');
    }
    await page.waitForURL('**/#projects');
    await page.waitForFunction(() => document.querySelector('.hero-pattern').dataset.active === 'false');
    assert.equal(await primaryDepth.evaluate(el => el.style.transform), '', 'Reset parallax when leaving the hero');
    assert.equal(await secondaryDepth.evaluate(el => el.style.transform), '', 'Reset all depth layers');
    await page.waitForFunction(() => document.querySelector('.portfolio-dock a[href="#projects"]').getAttribute('aria-current') === 'location');
    assert.equal(await heroPattern.getAttribute('data-pointer'), 'false', 'Hide the grid snake offscreen');
    const projectImages = page.locator('#projects img');
    assert.equal(await projectImages.count(), 6, 'Initially show only six projects');
    const firstSix = await projectImages.evaluateAll(images => images.map(image => image.alt));
    const showMore = page.getByRole('button', { name: /^Show \d+ more projects$/ });
    const extraCount = Number((await showMore.getAttribute('aria-label')).match(/\d+/)[0]);
    await showMore.scrollIntoViewIfNeeded();
    await page.screenshot({ path: join(screenshots, mobile ? 'load-more-mobile.png' : 'load-more-desktop.png') });
    if (mobile) await showMore.tap();
    else {
      await showMore.focus();
      await page.keyboard.press('Enter');
    }
    assert.equal(await projectImages.count(), 6 + extraCount, 'Reveal all remaining projects');
    assert.deepEqual((await projectImages.evaluateAll(images => images.map(image => image.alt))).slice(0, 6), firstSix, 'Keep the initial projects in order');
    assert.equal(await showMore.count(), 0, 'Hide the arrow after all projects are shown');
    await page.waitForFunction(() => document.activeElement === document.querySelector('#projects-grid > :nth-child(7)'));
    for (const img of await projectImages.all()) {
      await img.scrollIntoViewIfNeeded();
      await img.evaluate(element => element.decode());
      assert.equal(await img.getAttribute('loading'), 'lazy');
    }
    await projectImages.first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: join(screenshots, mobile ? 'projects-mobile.png' : 'projects-desktop.png') });
    await page.locator('#contact').scrollIntoViewIfNeeded();
    await page.locator('#contact form').waitFor();
    if (!mobile) {
      await page.locator('#contact input').first().hover();
      assert.equal(await page.locator('html').evaluate(el => el.classList.contains('cinematic-cursor-active')), false, 'Native input cursor was not restored');
      await page.locator('#contact button[type="submit"]').hover();
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForFunction(() => !document.documentElement.classList.contains('cinematic-cursor-active'));
      await page.emulateMedia({ reducedMotion: 'no-preference' });
    }
    await page.goto(`${baseURL}/#tasks`);
    await page.getByRole('heading', { name: 'Private Space' }).waitFor();
    assert.equal(await page.locator('html').evaluate(el => el.classList.contains('cinematic-cursor-active')), false, 'Cursor cleanup failed on route change');
    assert.ok(scripts.some(url => /TaskManager/.test(url)), 'Task workspace did not load');
    await page.goto(`${baseURL}/#home`);
    await page.locator('#home h1').waitFor();
    assert.deepEqual(errors, [], 'Browser runtime errors');
    console.log(`${mobile ? 'Mobile / reduced motion' : 'Desktop'}: navigation, images, task login, return navigation passed; ${idleCallbacks} idle animation callbacks in 1.5s`);
    await context.close();
  }
  console.log(`Screenshots: ${screenshots}`);
} finally {
  await browser.close();
}
