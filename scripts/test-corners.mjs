/**
 * Regression test: two-pane corners layout, tabs, content, responsive collapse.
 * Run: node scripts/test-corners.mjs
 * Requires preview: npx astro preview --port 4322
 */
import { chromium } from 'playwright';

const BASE = process.env.SPLASH_TEST_URL || 'http://localhost:4322/';
const DESKTOP = { width: 1440, height: 900 };
const CORNERS = ['work', 'about', 'ideas', 'reading', 'now', 'community'];

let failed = 0;
function assert(cond, msg) {
  if (!cond) { console.error('FAIL:', msg); failed++; }
  else console.log('ok:', msg);
}

async function cornerDisplays(page) {
  return page.evaluate((ids) => {
    const out = {};
    for (const id of ids) {
      const el = document.getElementById(id);
      out[id] = el ? getComputedStyle(el).display : null;
    }
    return out;
  }, CORNERS.map(c => `c-${c}`));
}

async function countGridColumns(page, selector) {
  return page.evaluate((sel) => {
    const items = [...document.querySelectorAll(sel)];
    const lefts = new Set(items.map(el => Math.round(el.offsetLeft)));
    return lefts.size;
  }, selector);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: DESKTOP });
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(300);

// 1. Desktop pane layout
const paneLayout = await page.evaluate(() => {
  const home = document.querySelector('.home-pane');
  const corner = document.querySelector('.corner-pane');
  return {
    homePosition: home ? getComputedStyle(home).position : null,
    cornerExists: !!corner,
  };
});
assert(paneLayout.homePosition === 'fixed', `home-pane is position:fixed (got ${paneLayout.homePosition})`);
assert(paneLayout.cornerExists, 'corner-pane exists');

// 2. pocket-bg not collapsed
const pocketRect = await page.evaluate(() => {
  const el = document.querySelector('.pocket-bg');
  return el ? el.getBoundingClientRect() : { width: 0, height: 0 };
});
assert(pocketRect.width > 0, `pocket-bg width > 0 (got ${pocketRect.width})`);
assert(pocketRect.height > 0, `pocket-bg height > 0 (got ${pocketRect.height})`);

// 3. Initial tab / corner state
const initialTab = await page.evaluate(() => {
  const tab = document.querySelector('.corner-tab[data-corner="work"]');
  return tab?.classList.contains('active') ?? false;
});
assert(initialTab, 'work tab has active class on load');

let displays = await cornerDisplays(page);
assert(displays['c-work'] !== 'none', 'c-work visible on load');
for (const c of CORNERS.filter(c => c !== 'work')) {
  assert(displays[`c-${c}`] === 'none', `#c-${c} hidden on load (got ${displays[`c-${c}`]})`);
}

// 4. Tab switching — instant, exclusive visibility
for (const corner of CORNERS) {
  await page.click(`.corner-tab[data-corner="${corner}"]`);
  await page.waitForTimeout(50);

  displays = await cornerDisplays(page);
  assert(displays[`c-${corner}`] !== 'none', `#c-${corner} visible after tab click`);

  for (const other of CORNERS.filter(c => c !== corner)) {
    assert(displays[`c-${other}`] === 'none', `#c-${other} hidden when ${corner} active`);
  }

  const transition = await page.evaluate((id) => {
    const el = document.getElementById(id);
    if (!el) return { duration: null, property: null };
    const cs = getComputedStyle(el);
    return { duration: cs.transitionDuration, property: cs.transitionProperty };
  }, `c-${corner}`);

  const instant =
    transition.duration === '0s' ||
    (!transition.property.includes('display') && !transition.property.includes('opacity'));
  assert(instant, `#c-${corner} switch is instant (duration=${transition.duration}, property=${transition.property})`);
}

// 5. Content anchors
await page.click('.corner-tab[data-corner="about"]');
await page.waitForTimeout(50);
const aboutText = await page.evaluate(() => document.getElementById('c-about')?.textContent ?? '');
assert(aboutText.includes('latent space'), 'about corner includes "latent space"');
assert(aboutText.includes('interface'), 'about corner includes "interface"');

await page.click('.corner-tab[data-corner="community"]');
await page.waitForTimeout(50);
const communityText = await page.evaluate(() => document.getElementById('c-community')?.textContent ?? '');
assert(communityText.includes('Aalto'), 'community corner includes "Aalto"');
assert(communityText.includes('CEA'), 'community corner includes "CEA"');

await page.click('.corner-tab[data-corner="reading"]');
await page.waitForTimeout(50);
const readingCounts = await page.evaluate(() => {
  const section = document.getElementById('c-reading');
  return {
    subLabels: section?.querySelectorAll('.sub-label').length ?? 0,
    spines: section?.querySelectorAll('.spine').length ?? 0,
  };
});
assert(readingCounts.subLabels === 3, `reading corner has 3 .sub-label (got ${readingCounts.subLabels})`);
assert(readingCounts.spines >= 10, `reading corner has >=10 .spine (got ${readingCounts.spines})`);

// 6. Taxonomy pieces
const taxonomy = await page.evaluate(() => ({
  homeTags: document.querySelectorAll('.home-pane .tag').length,
  totalSpines: document.querySelectorAll('.spine').length,
}));
assert(taxonomy.homeTags >= 1, `home-pane has >=1 .tag (got ${taxonomy.homeTags})`);
assert(taxonomy.totalSpines >= 10, `page has >=10 .spine total (got ${taxonomy.totalSpines})`);

// 7. Auto-fit reflow — work grid columns shrink at narrower width
await page.setViewportSize(DESKTOP);
await page.waitForTimeout(100);
await page.click('.corner-tab[data-corner="work"]');
await page.waitForTimeout(50);
const colsWide = await countGridColumns(page, '#c-work .grid > *');
assert(colsWide > 0, `work grid has columns at 1440px (got ${colsWide})`);

await page.setViewportSize({ width: 700, height: 900 });
await page.waitForTimeout(200);
const colsNarrow = await countGridColumns(page, '#c-work .grid > *');
assert(colsNarrow > 0, `work grid has columns at 700px (got ${colsNarrow})`);
assert(colsWide > colsNarrow, `grid columns shrink: ${colsWide}@1440 > ${colsNarrow}@700`);

// 8. Mobile collapse
await page.setViewportSize({ width: 500, height: 900 });
await page.waitForTimeout(200);

const mobile = await page.evaluate(() => {
  const nav = document.querySelector('.corner-nav');
  const navDisplay = nav ? getComputedStyle(nav).display : null;
  const corners = [...document.querySelectorAll('.corner')].map(el => getComputedStyle(el).display);
  const headings = [...document.querySelectorAll('.corner-h')].map(el => getComputedStyle(el).display);
  return { navDisplay, corners, headings };
});

assert(mobile.navDisplay === 'none', `corner-nav hidden on mobile (got ${mobile.navDisplay})`);
assert(mobile.corners.every(d => d !== 'none'), 'every .corner visible on mobile');
assert(mobile.headings.some(d => d !== 'none'), 'at least one .corner-h visible on mobile');

await browser.close();
if (failed) { console.error(`\n${failed} assertion(s) failed`); process.exit(1); }
console.log('\nAll corners checks passed');
