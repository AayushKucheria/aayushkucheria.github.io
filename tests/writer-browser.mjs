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
const root = await mkdtemp(join(tmpdir(), "writing-room-"));
let server, browser;
const port = 4432,
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
  await page.goto(base + "/write");
  await page
    .locator("#status")
    .filter({ hasText: "Saved to website" })
    .waitFor({ timeout: 10000 });
  const frame = page.frameLocator("#site");
  assert.equal(
    await frame
      .locator(".intro li")
      .first()
      .evaluate((el) => getComputedStyle(el).paddingTop),
    "4px",
  );
  await frame.locator(".intro").fill("Directly edited text");
  await page
    .locator("#status")
    .filter({ hasText: "Saved to website" })
    .waitFor();
  assert.match(
    await readFile(join(root, "src/content/home.md"), "utf8"),
    /Directly edited text/,
  );
  await frame.locator(".intro").press("End");
  await frame.locator(".intro").press("Shift+Home");
  page.once("dialog", (dialog) => dialog.accept("https://example.com/direct"));
  await page.getByRole("button", { name: "Add link", exact: true }).click();
  await page
    .locator("#status")
    .filter({ hasText: "Saved to website" })
    .waitFor();
  assert.equal(
    await frame.locator(".intro a").getAttribute("href"),
    "https://example.com/direct",
  );
  await frame.locator(".intro").press("End");
  await frame.locator(".intro").press("ArrowRight");
  await frame.locator(".intro").press("Space");
  await page
    .locator("#status")
    .filter({ hasText: "Saved to website" })
    .waitFor();
  await frame.locator(".intro").press("End");
  await frame.locator(".intro").press("A");
  await page
    .locator("#status")
    .filter({ hasText: "Saved to website" })
    .waitFor();
  assert.match(await readFile(join(root, "src/content/home.md"), "utf8"), /A/);
  await page
    .getByRole("button", { name: "Markdown view", exact: true })
    .click();
  await page
    .locator("#markdown")
    .fill("- A [real link](https://example.com)\n  - **Nested**");
  await page
    .locator("#status")
    .filter({ hasText: "Saved to website" })
    .waitFor();
  assert.equal(
    await frame.locator(".intro a").getAttribute("href"),
    "https://example.com",
  );
  assert.match(
    await readFile(join(root, "src/content/home.md"), "utf8"),
    /\*\*Nested\*\*/,
  );
  const site = await browser.newPage();
  await site.goto(base);
  assert.equal(await site.locator(".intro li ul strong").innerText(), "Nested");
  await page.reload();
  await page
    .locator("#status")
    .filter({ hasText: "Saved to website" })
    .waitFor();
  await page
    .getByRole("button", { name: "Markdown view", exact: true })
    .click();
  await page.route("**/__writer/content", (route) =>
    route.request().method() === "POST"
      ? route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Test write failed" }),
        })
      : route.continue(),
  );
  await page.locator("#markdown").fill("Recover this draft");
  await page.locator("#status").filter({ hasText: "Could not save" }).waitFor();
  assert.equal(
    await page.locator("#markdown").inputValue(),
    "Recover this draft",
  );
  await page.unroute("**/__writer/content");
  await page.getByRole("button", { name: "Retry save" }).click();
  await page
    .locator("#status")
    .filter({ hasText: "Saved to website" })
    .waitFor();
  await writeFile(join(root, "src/content/home.md"), "An external edit");
  await page.locator("#markdown").fill("Keep my conflicting draft");
  await page
    .locator("#recovery-message")
    .filter({ hasText: "source changed" })
    .waitFor();
  assert.equal(
    await readFile(join(root, "src/content/home.md"), "utf8"),
    "An external edit",
  );
  await page.getByRole("button", { name: "Reload source" }).click();
  await page
    .locator("#status")
    .filter({ hasText: "Saved to website" })
    .waitFor();
  assert.equal(
    await page.locator("#markdown").inputValue(),
    "An external edit",
  );
  await page.locator("#markdown").fill("rapid one");
  await page.locator("#markdown").fill("rapid two");
  await page.locator("#markdown").fill("rapid final");
  await page
    .locator("#status")
    .filter({ hasText: "Saved to website" })
    .waitFor();
  assert.equal(
    await readFile(join(root, "src/content/home.md"), "utf8"),
    "rapid final",
  );
  const denied = await fetch(base + "/__writer/content", {
    method: "POST",
    headers: {
      Origin: "https://example.com",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ markdown: "wrong origin", revision: "no" }),
  });
  assert.equal(denied.status, 403);
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  assert.deepEqual(errors, []);
  console.log(
    "Passed: direct and Markdown edits write source, website renders saved copy, reload, failures and retry, conflict recovery, rapid edits, origin checks, mobile layout.",
  );
} finally {
  await browser?.close();
  server?.kill("SIGTERM");
  await new Promise((r) => setTimeout(r, 400));
  await rm(root, { recursive: true, force: true });
}
