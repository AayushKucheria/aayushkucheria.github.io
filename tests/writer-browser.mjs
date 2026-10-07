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
  const originalIntro = await readFile(join(root, "src/content/home.md"), "utf8");
  assert.equal(
    await frame.locator(".contact-copy[contenteditable=true]").count(),
    1,
    "Contact bullets are editable in the writing room",
  );
  const originalWidget = await frame.locator(".newsletter").evaluate(el => el.outerHTML);
  assert.equal(await frame.locator(".newsletter").evaluate(el => el.isContentEditable), false);
  await frame.locator(".contact-copy").fill("Direct contact edit");
  await page.locator("#status").filter({ hasText: "Saved to website" }).waitFor();
  assert.match(await readFile(join(root, "src/content/contact.md"), "utf8"), /Direct contact edit/);
  assert.equal(await readFile(join(root, "src/content/home.md"), "utf8"), originalIntro);
  await page.getByRole("button", { name: "Markdown view", exact: true }).click();
  await page.locator("#markdown").fill("- **say hello**\n  - [book a call](https://example.com/call)\n  - [email me](mailto:hello@example.com)");
  await page.locator("#status").filter({ hasText: "Saved to website" }).waitFor();
  await frame.locator(".contact-copy a").first().filter({ hasText: "book a call" }).waitFor();
  await page.getByRole("button", { name: "Write on the page", exact: true }).click();
  await frame.locator(".contact-copy a").first().evaluate(link => {
    link.closest('[contenteditable=true]').focus();
    const range = document.createRange();
    range.selectNodeContents(link);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  });
  page.once("dialog", dialog => dialog.accept("https://example.com/updated-call"));
  await page.getByRole("button", { name: "Add link", exact: true }).click();
  await page.locator("#status").filter({ hasText: "Saved to website" }).waitFor();
  assert.match(await readFile(join(root, "src/content/contact.md"), "utf8"), /\[book a call\]\(https:\/\/example.com\/updated-call\)/);
  assert.equal(await frame.locator(".newsletter").evaluate(el => el.outerHTML), originalWidget);
  await page.locator("#section").selectOption("socials");
  await page.getByRole("button", { name: "Markdown view", exact: true }).click();
  await page.locator("#markdown").fill("- [GitHub](https://github.com/updated-profile)\n- [LinkedIn](https://linkedin.com/in/updated-profile)\n- [Twitter / X](https://x.com/updated-profile)");
  await page.locator("#status").filter({ hasText: "Saved to website" }).waitFor();
  await page.getByRole("button", { name: "Write on the page", exact: true }).click();
  await frame.locator(".socials a").first().evaluate(link => {
    link.closest('[contenteditable=true]').focus();
    const range = document.createRange();
    range.selectNodeContents(link.querySelector('span'));
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  });
  page.once("dialog", dialog => dialog.accept("https://github.com/direct-profile"));
  await page.getByRole("button", { name: "Add link", exact: true }).click();
  await page.locator("#status").filter({ hasText: "Saved to website" }).waitFor();
  const savedSocials = await readFile(join(root, "src/content/socials.md"), "utf8");
  assert.match(savedSocials, /\[GitHub\]\(https:\/\/github.com\/direct-profile\)/);
  assert.doesNotMatch(savedSocials, /svg|path d=/);
  await frame.locator(".site-name").fill("Test Website Name");
  await page.locator("#status").filter({ hasText: "Saved to website" }).waitFor();
  await frame.locator(".contact-heading").fill("Contact dummy title");
  await page.locator("#status").filter({ hasText: "Saved to website" }).waitFor();
  assert.equal(await readFile(join(root, "src/content/contact-heading.txt"), "utf8"), "Contact dummy title");
  await frame.locator(".location").fill("Based somewhere new");
  await page.locator("#status").filter({ hasText: "Saved to website" }).waitFor();
  const contactSite = await browser.newPage();
  await contactSite.goto(base);
  await contactSite.locator(".contact-fold > summary").click();
  assert.equal(await contactSite.locator(".site-name").innerText(), "Test Website Name");
  assert.equal(await contactSite.locator(".location").innerText(), "Based somewhere new");
  assert.equal(await contactSite.locator(".contact-heading").innerText(), "Contact dummy title");
  assert.equal(await contactSite.locator(".contact-copy strong").innerText(), "say hello");
  assert.equal(await contactSite.getByRole("link", { name: "book a call" }).getAttribute("href"), "https://example.com/updated-call");
  assert.equal(await contactSite.getByRole("link", { name: "GitHub", exact: true }).getAttribute("href"), "https://github.com/direct-profile");
  assert.equal(await contactSite.getByRole("link", { name: "Twitter / X", exact: true }).getAttribute("href"), "https://x.com/updated-profile");
  assert.equal(await contactSite.locator(".socials svg").count(), 3, savedSocials);
  assert.equal(await contactSite.locator(".newsletter").evaluate(el => el.outerHTML), originalWidget);
  await contactSite.close();
  await page.reload();
  await page.locator("#status").filter({ hasText: "Saved to website" }).waitFor();
  assert.equal(await frame.locator(".contact-copy strong").innerText(), "say hello");
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
  // Headings must survive the actual Markdown → page → direct-edit → source path.
  await page.locator("#markdown").fill("- visible intro\n\n## abcd\n- efgh\n\n### ijkl\n- mnop\n\n## qrst\n- uvwx");
  await page.locator("#status").filter({ hasText: "Saved to website" }).waitFor();
  await frame.locator("summary h2").first().filter({ hasText: "abcd" }).waitFor();
  assert.equal(await frame.locator(".intro .fold").count(), 3);
  assert.equal(await frame.locator(".intro .fold[open]").count(), 3, "Writing keeps nested content available");
  await frame.locator(".intro .fold-body > ul > li").first().fill("edited dummy");
  await page.locator("#status").filter({ hasText: "Saved to website" }).waitFor();
  const headingSource = await readFile(join(root, "src/content/home.md"), "utf8");
  assert.match(headingSource, /## abcd/);
  assert.match(headingSource, /### ijkl/);
  assert.match(headingSource, /edited dummy/);
  assert.doesNotMatch(headingSource, /details|summary|fold-body/);
  await page.getByRole("button", { name: "Read the page", exact: true }).click();
  const firstFold = frame.locator(".intro > .fold").first();
  await firstFold.locator(":scope > summary").click();
  await page.waitForTimeout(350);
  assert.equal(await firstFold.getAttribute("open"), null);
  await firstFold.locator(":scope > summary").focus();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(350);
  assert.notEqual(await firstFold.getAttribute("open"), null);
  await page.getByRole("button", { name: "Keep writing", exact: true }).click();
  await page.reload();
  await page.locator("#status").filter({ hasText: "Saved to website" }).waitFor();
  assert.equal(await frame.locator(".intro .fold").count(), 3);
  await page.getByRole("button", { name: "Markdown view", exact: true }).click();
  await page.locator("#markdown").fill("button dummy\n\n- body dummy");
  await page.locator("#status").filter({ hasText: "Saved to website" }).waitFor();
  await page.locator("#markdown").evaluate(el => { el.focus(); el.setSelectionRange(0, 12); });
  await page.getByRole("button", { name: "Heading", exact: true }).click();
  await page.locator("#status").filter({ hasText: "Saved to website" }).waitFor();
  await frame.locator(".intro summary h2").filter({ hasText: "button dummy" }).waitFor();
  await page.getByRole("button", { name: "Write on the page", exact: true }).click();
  await frame.locator(".intro").fill("direct heading dummy");
  await page.locator("#status").filter({ hasText: "Saved to website" }).waitFor();
  await frame.locator(".intro").evaluate(el => {
    el.focus(); const range = document.createRange(); range.selectNodeContents(el);
    const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
  });
  await page.getByRole("button", { name: "Heading", exact: true }).click();
  await page.locator("#status").filter({ hasText: "Saved to website" }).waitFor();
  await frame.locator(".intro summary h2").filter({ hasText: "direct heading dummy" }).waitFor();
  assert.match(await readFile(join(root, "src/content/home.md"), "utf8"), /## direct heading dummy/);
  await page.getByRole("button", { name: "Markdown view", exact: true }).click();
  await page.locator("#markdown").fill("- bullet heading dummy\n- second dummy");
  await page.locator("#status").filter({ hasText: "Saved to website" }).waitFor();
  await frame.locator(".intro > ul > li").first().filter({ hasText: "bullet heading dummy" }).waitFor();
  await page.getByRole("button", { name: "Write on the page", exact: true }).click();
  await frame.locator(".intro > ul > li").first().evaluate(el => {
    el.closest('[contenteditable=true]').focus(); const range = document.createRange(); range.selectNodeContents(el);
    const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
  });
  await page.getByRole("button", { name: "Heading", exact: true }).click();
  await page.locator("#status").filter({ hasText: "Saved to website" }).waitFor();
  assert.match(await readFile(join(root, "src/content/home.md"), "utf8"), /^## bullet heading dummy/);
  assert.match(await readFile(join(root, "src/content/home.md"), "utf8"), /-\s+second dummy/);
  await frame.locator(".intro summary h2").filter({ hasText: "bullet heading dummy" }).waitFor();
  await page.getByRole("button", { name: "Markdown view", exact: true }).click();
  const denied = await fetch(base + "/__writer/content", {
    method: "POST",
    headers: {
      Origin: "https://example.com",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ markdown: "wrong origin", revision: "no" }),
  });
  assert.equal(denied.status, 403);
  const unknown = await fetch(base + "/__writer/content?section=../other-file");
  assert.equal(unknown.status, 400);
  await page.locator("#markdown").fill("- Introduction pending");
  await page.locator("#section").selectOption("contact");
  await page.locator("#markdown").fill("- Contact pending");
  await page.locator("#section").selectOption("intro");
  await page.locator("#status").filter({ hasText: "Saved to website" }).waitFor();
  assert.equal(await page.locator("#markdown").inputValue(), "- Introduction pending");
  await page.locator("#section").selectOption("contact");
  await page.locator("#status").filter({ hasText: "Saved to website" }).waitFor();
  assert.equal(await readFile(join(root, "src/content/home.md"), "utf8"), "- Introduction pending");
  assert.equal(await readFile(join(root, "src/content/contact.md"), "utf8"), "- Contact pending");
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  assert.deepEqual(errors, []);
  console.log(
    "Passed: introduction, contact, social links, name and location edits; fixed newsletter; reload; independent section saves; failures and retry; conflict recovery; rapid edits; origin checks; mobile layout.",
  );
} finally {
  await browser?.close();
  server?.kill("SIGTERM");
  await new Promise((r) => setTimeout(r, 400));
  await rm(root, { recursive: true, force: true });
}
