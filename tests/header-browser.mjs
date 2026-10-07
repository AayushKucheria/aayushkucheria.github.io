import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.goto(process.env.HEADER_TEST_URL || 'http://127.0.0.1:4321');
  const transform = locator => locator.evaluate(el => getComputedStyle(el).transform);
  for (const photo of await page.locator('.photos img').all()) {
    await page.mouse.move(1000, 800);
    await page.waitForTimeout(500);
    const resting = await transform(photo);
    await photo.hover();
    await page.waitForTimeout(250);
    assert.notEqual(await transform(photo), resting, 'Each photo lifts and enlarges on hover');
    await page.mouse.move(1000, 800);
    await page.waitForTimeout(500);
    assert.equal(await transform(photo), resting, 'Photo returns to its original tilt');
  }
  const location = page.locator('.location');
  assert.equal(await location.innerText(), 'Based in Helsinki');
  const string = await location.evaluate(el => {
    const style = getComputedStyle(el, '::before');
    return style.content !== 'none' && parseFloat(style.height) > 0;
  });
  assert.ok(string, 'Helsinki tag hangs from a visible string');
  await location.hover();
  await page.waitForTimeout(200);
  const first = await transform(location);
  await page.waitForTimeout(400);
  assert.notEqual(await transform(location), first, 'Helsinki tag swings while hovered');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(await location.evaluate(el => getComputedStyle(el).animationName), 'none');
  const photo = page.locator('.photos img').first();
  await page.mouse.move(1000, 800);
  const still = await transform(photo);
  await photo.hover();
  await page.waitForTimeout(250);
  assert.equal(await transform(photo), still, 'Reduced motion keeps photos still');
  for (const width of [1280, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  }
  console.log('Header: photo hover and reset, hanging tag swing, reduced motion, and responsive layout passed');
} finally {
  await browser.close();
}
