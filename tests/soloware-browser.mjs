import { chromium } from "playwright";
import {
  mkdtemp,
  cp,
  symlink,
  readFile,
  writeFile,
  rm,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import assert from "node:assert/strict";
const root = await mkdtemp(join(tmpdir(), "soloware-"));
let server, browser;
const port = 4436,
  base = `http://127.0.0.1:${port}`;
try {
  for (const file of ["src", "astro.config.mjs", "package.json"])
    await cp(file, join(root, file), { recursive: true });
  await symlink(
    join(process.cwd(), "node_modules"),
    join(root, "node_modules"),
    "dir",
  );
  await symlink(join(process.cwd(), "public"), join(root, "public"), "dir");
  server = spawn(
    process.execPath,
    [
      join(process.cwd(), "node_modules/astro/bin/astro.mjs"),
      "dev",
      "--ignore-lock",
      "--host",
      "127.0.0.1",
      "--port",
      String(port),
    ],
    { cwd: root, stdio: ["ignore", "pipe", "pipe"] },
  );
  let logs = "";
  server.stdout.on("data", (x) => (logs += x));
  server.stderr.on("data", (x) => (logs += x));
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(base, { signal: AbortSignal.timeout(1500) })).ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  assert.ok(ready, logs);
  browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base + "/soloware/");
  const repositories = ['people-connector','userscripts','paper-ipad','btw','radio-station','interactive-writing','SocialChats','writing-space','lokmat','FinnishConversations'];
  const featured = [5, 4, 3, 9], others = [1, 2, 6, 7, 8, 10];
  const projects = [...featured.map(n => ['.project-row', n]), ...others.map(n => ['.also-made li', n])];
  assert.equal(await page.locator(".project-row").count(), 4, "four featured rows");
  assert.equal(await page.locator(".also-made li").count(), 6, "six projects in the also-made list");
  for (const [selector, n] of projects) {
    const card = page.locator(selector).nth((selector === '.project-row' ? featured : others).indexOf(n));
    assert.equal(await card.locator('h2').innerText(), (await readFile(join(root, `src/content/project-${n}.md`), "utf8")).match(/^## (.+)$/m)[1]);
    const href = await card.locator('a').last().getAttribute('href');
    assert.equal(href, n === 3 || selector !== '.project-row' ? `https://github.com/AayushKucheria/${repositories[n - 1]}` : '#');
  }
  const steal = page.locator('.project-row').nth(2).getByRole('link', {name: /Steal it/});
  assert.equal(await steal.evaluate(a => getComputedStyle(a).outlineStyle), 'dashed', 'GitHub link renders as a Steal button');
  const pending = page.locator('.project-row').first().locator('a', {hasText: 'Steal it'});
  assert.equal(await pending.getAttribute('aria-disabled'), 'true');
  assert.equal(await pending.evaluate(a => getComputedStyle(a).pointerEvents), 'none', 'a Steal link to # is disabled');
  assert.equal(await page.locator('.also-heading h2').innerText(), 'also made');
  await page.goto(base);
  await page.getByRole("link", {name:/^soloware$/i}).click();
  assert.match(page.url(), /soloware/);
  await page.goto(base + "/write");
  const originalHome = await readFile(join(root, "src/content/home.md"), "utf8");
  const copiedCard = await readFile(join(root, "src/content/project-1.md"), "utf8");
  const protection = await page.evaluate(async copied => {
    const current = await (await fetch('/__writer/content?section=intro')).json();
    const response = await fetch('/__writer/content', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({section: 'intro', markdown: copied, revision: current.revision}),
    });
    return {status: response.status, body: await response.json()};
  }, copiedCard);
  assert.equal(protection.status, 409, 'A project card pasted into Home must be rejected');
  assert.equal(await readFile(join(root, "src/content/home.md"), "utf8"), originalHome);
  await page.locator("#status").filter({hasText:"Saved locally"}).waitFor();
  await page.locator("#section").selectOption("project-5");
  const frame0 = page.frameLocator("#site");
  await frame0.locator('[data-content-section="project-5"][contenteditable=true]').waitFor();
  await page.getByRole("button", {name:"Markdown view", exact:true}).click();
  const featuredCopy = "## Radio pickle\n\n![demo](/favicon.svg)\n\nWarm.\n\n[Use it ↗](https://example.com/radio) [Steal it ↗](https://github.com/example/radio)";
  await page.locator("#markdown").fill(featuredCopy);
  await page.locator("#status").filter({hasText:"Saved locally"}).waitFor();
  assert.equal(await readFile(join(root,"src/content/project-5.md"),"utf8"),featuredCopy);
  await page.locator("#section").selectOption("soloware-also");
  await frame0.locator('[data-content-section="soloware-also"]').waitFor();
  await page.locator("#markdown").fill("## other pickles");
  await page.locator("#status").filter({hasText:"Saved locally"}).waitFor();
  await page.locator("#section").selectOption("project-1");
  const frame = page.frameLocator("#site");
  await frame.locator('[data-content-section="project-1"][contenteditable=true]').waitFor();
  const copy = "## Updated pickle\n\nOne silly sentence.  \nAnother silly sentence.  \nThe last silly sentence.\n\n[New repository](https://github.com/example/pickle)";
  await page.locator("#markdown").fill(copy);
  await page.locator("#status").filter({hasText:"Saved locally"}).waitFor();
  assert.equal(await readFile(join(root,"src/content/project-1.md"),"utf8"),copy);
  await page.reload();
  await page.locator("#status").filter({hasText:"Saved locally"}).waitFor();
  await page.locator("#section").selectOption("project-1");
  await frame.getByRole("heading", {name:"Updated pickle"}).waitFor();
  await page.getByRole("button", {name:"Markdown view", exact:true}).click();
  assert.equal(await page.locator("#markdown").inputValue(),copy);
  await page.locator("#section").selectOption("intro");
  await frame.locator('[data-content-section="intro"]').waitFor();
  await page.locator("#section").selectOption("soloware-intro");
  await frame.locator('[data-content-section="soloware-intro"]').waitFor();
  await page.locator("#markdown").fill("# PickleWare\n\nFlibberty gibbet.");
  await page.locator("#status").filter({hasText:"Saved locally"}).waitFor();
  await page.locator("#section").selectOption("soloware-about");
  await page.locator("#markdown").fill("## Notes\n\nSaved from an initially empty region.");
  await page.locator("#status").filter({hasText:"Saved locally"}).waitFor();
  await page.locator("#section").selectOption("navigation");
  await page.locator("#markdown").fill("[Home](/) · [Pickles](/soloware/)");
  await page.locator("#status").filter({hasText:"Saved locally"}).waitFor();
  await page.goto(base + "/soloware/");
  await page.getByRole("heading", {name:"Updated pickle"}).waitFor();
  await page.getByRole("heading", {name:"PickleWare"}).waitFor();
  await page.getByRole("heading", {name:"other pickles"}).waitFor();
  const radio = page.locator('.project-row').first();
  assert.equal(await radio.getByRole("link",{name:/Use it/}).getAttribute("href"),"https://example.com/radio");
  await page.setViewportSize({width:1280,height:900});
  const [img, title] = await Promise.all([radio.locator('img').boundingBox(), radio.locator('h2').boundingBox()]);
  assert.ok(img.x + img.width <= title.x, 'demo sits beside the text on wide screens');
  assert.equal(await page.getByRole("link",{name:"New repository"}).getAttribute("href"),"https://github.com/example/pickle");
  assert.equal(await page.getByRole("link",{name:"Pickles"}).getAttribute("href"),"/soloware/");
  for(const width of [1280,768,390,320]) {
    await page.setViewportSize({width,height:900});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`No overflow at ${width}`);
  }
  await page.screenshot({path:"/tmp/soloware-mobile.png",fullPage:true});
  await page.setViewportSize({width:1280,height:960});
  await page.screenshot({path:"/tmp/soloware-desktop.png",fullPage:true});
  assert.deepEqual(errors,[]);
  console.log("SoloWare: navigation, grid, source saves, reopen, page switching, links and responsive widths passed");
} finally {
  await browser?.close();
  server?.kill();
  await rm(root,{recursive:true,force:true});
}
