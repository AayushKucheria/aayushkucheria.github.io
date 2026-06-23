/**
 * Regression test: splashes must paint above island content (z-index stacking).
 * Run: node scripts/test-splash-visibility.mjs
 * Requires preview: npx astro preview --port 4322
 */
import { chromium } from 'playwright';
import { createHash } from 'crypto';

const BASE = process.env.SPLASH_TEST_URL || 'http://localhost:4322/';
const VIEWPORT = { width: 1440, height: 900 };

let failed = 0;
function assert(cond, msg) {
  if (!cond) { console.error('FAIL:', msg); failed++; }
  else console.log('ok:', msg);
}

async function clipHash(page, x, y, size = 24) {
  const buf = await page.screenshot({ clip: { x: x - size / 2, y: y - size / 2, width: size, height: size } });
  return createHash('md5').update(buf).digest('hex');
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: VIEWPORT });
await page.addInitScript(() => localStorage.removeItem('wb-v1'));
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(300);

// Click on right pane — #dot-layer covers corner-pane only (not home pocket)
const pt = { x: 1000, y: 420 };
const before = await clipHash(page, pt.x, pt.y);

await page.evaluate(({ x, y }) => {
  document.getElementById('dot-layer').dispatchEvent(
    new MouseEvent('click', { bubbles: true, clientX: x, clientY: y })
  );
}, pt);
await page.waitForTimeout(500);

const after = await clipHash(page, pt.x, pt.y);

const state = await page.evaluate(() => {
  const splash = document.querySelector('.splash-wrap');
  const cs = splash ? getComputedStyle(splash) : null;
  return {
    splashCount: document.querySelectorAll('.splash-wrap').length,
    parent: splash?.parentElement?.tagName,
    zIndex: cs?.zIndex,
    position: cs?.position,
  };
});

assert(state.splashCount >= 1, 'click creates a splash');
assert(state.parent === 'BODY', `splash appended to body (got ${state.parent})`);
assert(state.position === 'fixed', `splash uses position:fixed (got ${state.position})`);
assert(parseInt(state.zIndex, 10) > 4, `splash z-index above islands (got ${state.zIndex})`);
assert(before !== after, `splash changes visible pixels at right pane (${pt.x},${pt.y})`);

const leftPaneSplash = await page.evaluate(() => {
  const beforeCount = document.querySelectorAll('.splash-wrap').length;
  document.querySelector('.home-pane')?.dispatchEvent(
    new MouseEvent('click', { bubbles: true, clientX: 120, clientY: 400 })
  );
  return {
    beforeCount,
    afterCount: document.querySelectorAll('.splash-wrap').length,
  };
});
assert(
  leftPaneSplash.afterCount === leftPaneSplash.beforeCount,
  `click on home-pane does not create splash (${leftPaneSplash.beforeCount} → ${leftPaneSplash.afterCount})`
);

await browser.close();
if (failed) { console.error(`\n${failed} assertion(s) failed`); process.exit(1); }
console.log('\nAll splash visibility checks passed');
