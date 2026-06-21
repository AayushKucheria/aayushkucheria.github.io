/**
 * Regression test: new clicks persist normalized coords to localStorage.
 * Run: node scripts/test-splash-storage.mjs
 * Requires preview: npx astro preview --port 4322
 */
import { chromium } from 'playwright';

const BASE = process.env.SPLASH_TEST_URL || 'http://localhost:4322/';
const VIEWPORT = { width: 1000, height: 800 };

let failed = 0;
function assert(cond, msg) {
  if (!cond) { console.error('FAIL:', msg); failed++; }
  else console.log('ok:', msg);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: VIEWPORT });
await page.addInitScript(() => localStorage.removeItem('wb-v1'));
await page.goto(BASE, { waitUntil: 'networkidle' });

const click = { x: 420, y: 360 };
await page.evaluate(({ x, y }) => {
  document.getElementById('dot-layer').dispatchEvent(
    new MouseEvent('click', { bubbles: true, clientX: x, clientY: y })
  );
}, click);
await page.waitForTimeout(400);

const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('wb-v1') || '[]'));
const expectedX = click.x / VIEWPORT.width;
const expectedY = click.y / VIEWPORT.height;

assert(stored.length === 1, 'one coord pair stored after click');
assert(
  Math.abs(stored[0][0] - expectedX) < 0.001,
  `stored x ≈ ${expectedX} (got ${stored[0][0]})`
);
assert(
  Math.abs(stored[0][1] - expectedY) < 0.001,
  `stored y ≈ ${expectedY} (got ${stored[0][1]})`
);

await browser.close();
if (failed) { console.error(`\n${failed} assertion(s) failed`); process.exit(1); }
console.log('\nAll splash storage checks passed');
