import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { createServer } from 'node:net';
const portProbe = createServer();
await new Promise(resolve => portProbe.listen(0, "127.0.0.1", resolve));
const port = portProbe.address().port;
await new Promise(resolve => portProbe.close(resolve));
const base = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ['node_modules/astro/bin/astro.mjs', 'preview', '--ignore-lock', '--host', '127.0.0.1', '--port', String(port)], { stdio: ['ignore', 'pipe', 'pipe'] });
let browser, logs = '';
server.stdout.on('data', data => logs += data);
server.stderr.on('data', data => logs += data);
try {
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    try { if ((await fetch(base)).ok) { ready = true; break; } } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.ok(ready, logs);
  browser = await chromium.launch();
  for (const width of [1280, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base);
    const folds = page.locator('.intro > .fold');
    assert.equal(await folds.count(), 5);
    assert.equal(await page.locator('.fold[open]').count(), 0);
    assert.match(await page.locator('.intro > ul').innerText(), /welcome to my corner/);
    const first = folds.first();
    await first.locator('summary').focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    assert.notEqual(await first.getAttribute('open'), null);
    assert.equal(await first.locator('.fold-body').innerText(), 'abcd\nefgh');
    assert.equal(await first.locator('.fold-body').evaluate(el => getComputedStyle(el).borderLeftStyle), 'dashed');
    assert.match(await first.locator('.toggle-label').evaluate(el => getComputedStyle(el).backgroundImage), /repeating-linear-gradient/);
    await folds.nth(1).locator('summary').click();
    await page.waitForTimeout(300);
    assert.notEqual(await first.getAttribute('open'), null, 'Opening a second section keeps the first open');
    await first.locator('summary').click();
    await page.waitForTimeout(300);
    assert.equal(await first.getAttribute('open'), null);
    assert.equal(await first.locator('li').first().isVisible(), false);
    // Rapid reversals must finish in the state requested by the last click.
    await first.locator('summary').click();
    await first.locator('summary').click();
    await first.locator('summary').click();
    await page.waitForTimeout(350);
    assert.notEqual(await first.getAttribute('open'), null);
    await page.locator('.contact-fold > summary').click();
    await page.waitForTimeout(300);
    assert.equal(await page.locator('.newsletter input').isVisible(), true);
    assert.equal(await page.locator('.socials a').count(), 4);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: `/tmp/site-toggles-${width}.png`, fullPage: true });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await first.locator('summary').click();
    assert.equal(await first.getAttribute('open'), null);
    assert.deepEqual(errors, []);
    await page.close();
    console.log(`Toggles at ${width}px: dummy sections, independent expansion, keyboard, rapid clicks, texture, dashed margins, contact, reduced motion, no overflow passed`);
  }
  const plain = await browser.newPage({ javaScriptEnabled: false });
  await plain.goto(base);
  await plain.locator('.intro > .fold').first().locator('summary').click();
  assert.equal(await plain.locator('.intro > .fold').first().locator('li').first().isVisible(), true, 'Native toggles work without JavaScript');
} finally {
  await browser?.close();
  server.kill();
}
