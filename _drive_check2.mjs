import { chromium } from 'playwright';

const url = 'http://localhost:5184';
const shotDir = 'C:\\Users\\ashik\\AppData\\Local\\Temp\\claude\\c--Users-ashik-Desktop-Work-antigravity-protfolio\\9a39df49-5446-40f8-883b-144af01d347d\\scratchpad';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (msg) => { if (msg.type() === 'error') errors.push('console.error: ' + msg.text()); });

await page.goto(url + '#tasks', { waitUntil: 'networkidle' });
await page.waitForSelector('text=Private Space', { timeout: 10000 });
await page.screenshot({ path: shotDir + '\\10_login_gate.png' });

// Try signing in with a bogus account to see the friendly error surface
await page.fill('input[type="email"]', 'nonexistent-test-account@example.com');
await page.fill('input[type="password"]', 'somepassword123');
await page.click('button:has-text("Unlock")');
await page.waitForTimeout(2000);
await page.screenshot({ path: shotDir + '\\11_login_error.png' });

console.log('ERRORS:', JSON.stringify(errors));
await browser.close();
