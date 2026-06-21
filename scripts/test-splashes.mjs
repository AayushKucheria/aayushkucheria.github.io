/**
 * Regression test: paint splashes must honor stored viewport coordinates.
 * Run: node scripts/test-splashes.mjs
 * Requires preview server: npx astro preview --port 4322
 */
import { chromium } from 'playwright';

const BASE = process.env.SPLASH_TEST_URL || 'http://localhost:4322/';
const COORDS = [[0.1, 0.2], [0.5, 0.5], [0.9, 0.7]];

let failed = 0;

function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL:', msg);
    failed++;
  } else {
    console.log('ok:', msg);
  }
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 800, height: 900 } });
await page.addInitScript((stored) => {
  localStorage.setItem('wb-v1', JSON.stringify(stored));
}, COORDS);
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(200);

const splashes = await page.evaluate(() =>
  [...document.querySelectorAll('.splash-wrap')].map(w => {
    const cs = getComputedStyle(w);
    const r = w.getBoundingClientRect();
    const svg = w.querySelector('svg')?.getBoundingClientRect();
    return {
      position: cs.position,
      styleLeft: parseFloat(w.style.left),
      styleTop: parseFloat(w.style.top),
      rectLeft: r.left,
      rectTop: r.top,
      svgCenterX: svg ? (svg.left + svg.right) / 2 : null,
    };
  })
);

assert(splashes.length === COORDS.length, `renders ${COORDS.length} splashes`);

for (let i = 0; i < COORDS.length; i++) {
  const [x, y] = COORDS[i];
  const s = splashes[i];
  const expectedLeft = x * 800;
  const expectedTop = y * 900;

  assert(s.position === 'fixed', `splash ${i} uses position:fixed (got ${s.position})`);
  assert(
    Math.abs(s.svgCenterX - expectedLeft) < 25,
    `splash ${i} center x ≈ ${expectedLeft}px (got ${s.svgCenterX})`
  );
  assert(
    Math.abs(s.rectTop - expectedTop) < 25,
    `splash ${i} top ≈ ${expectedTop}px (got ${s.rectTop})`
  );
  assert(
    s.rectLeft > 50 || x < 0.15,
    `splash ${i} wrap not stuck at viewport left (rectLeft=${s.rectLeft})`
  );
}

await browser.close();
if (failed) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}
console.log('\nAll splash layout checks passed');
