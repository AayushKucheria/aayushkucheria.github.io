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
  assert.equal(await page.locator(".project-card").count(), 10, "SoloWare shows all ten projects");
  assert.match(await page.locator("body").innerText(), /people-connector/);
  const repositories = ['people-connector','userscripts','paper-ipad','btw','radio-station','interactive-writing','SocialChats','writing-space','lokmat','FinnishConversations'];
  for (let i = 0; i < repositories.length; i++) {
    const card = page.locator('.project-card').nth(i);
    assert.equal(await card.locator('h2').innerText(), repositories[i]);
    assert.equal(await card.getByRole('link').getAttribute('href'), `https://github.com/AayushKucheria/${repositories[i]}`);
    assert.equal(await card.locator('p').count(), 1, 'Only the repository link, no description');
  }
  await page.goto(base);
  await page.getByRole("link", {name:"SoloWare", exact:true}).click();
  assert.match(page.url(), /soloware/);
  await page.goto(base + "/write");
  await page.locator("#status").filter({hasText:"Saved locally"}).waitFor();
  await page.locator("#section").selectOption("project-1");
  const frame = page.frameLocator("#site");
  await frame.locator('[data-content-section="project-1"][contenteditable=true]').waitFor();
  await page.getByRole("button", {name:"Markdown view", exact:true}).click();
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
