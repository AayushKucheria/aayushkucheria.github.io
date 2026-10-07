import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const base = "http://127.0.0.1:4433";
const server = spawn(process.execPath, [
  "node_modules/astro/bin/astro.mjs", "preview", "--host", "127.0.0.1", "--port", "4433",
], { stdio: ["ignore", "pipe", "pipe"] });
let logs = "", browser;
server.stdout.on("data", data => logs += data);
server.stderr.on("data", data => logs += data);
try {
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      if ((await fetch(base, { signal: AbortSignal.timeout(1000) })).ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.ok(ready, logs);
  browser = await chromium.launch();
  for (const width of [1280, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(base);
    const contact = page.locator("footer#contact");
    assert.equal(await contact.count(), 1, "The website includes the contact bullet and its children");
    assert.equal(await contact.locator(".contact-copy > ul > li > strong").innerText(), "contact");
    for (const [name, href] of [
      ["let's chat", "https://cal.com/aayushk/chat"],
      ["buy me a coffee", "https://buymeacoffee.com/aayushkucheria"],
      ["aayush.kucheria@gmail.com", "mailto:aayush.kucheria@gmail.com"],
    ]) {
      assert.equal(await contact.getByRole("link", { name, exact: true }).getAttribute("href"), href);
    }
    const form = contact.locator("form");
    assert.equal(await form.getAttribute("action"), "https://buttondown.com/api/emails/embed-subscribe/aayushk");
    assert.equal(await form.getAttribute("method"), "post");
    assert.equal(await form.getByLabel("for occasional updates").getAttribute("type"), "email");
    await form.getByRole("button", { name: "subscribe" }).click();
    assert.equal(await form.getByLabel("for occasional updates").evaluate(input => input.validity.valueMissing), true);

    const icons = contact.locator(".socials a");
    assert.equal(await icons.count(), 4);
    for (const [name, href] of [
      ["GitHub", "https://github.com/AayushKucheria"],
      ["LinkedIn", "https://linkedin.com/in/aayushkucheria"],
      ["X", "https://twitter.com/aay17ush"],
      ["buy me a coffee", "https://buymeacoffee.com/aayushkucheria"],
    ]) {
      const link = contact.getByRole("link", { name, exact: true });
      assert.equal(await link.getAttribute("href"), href);
      assert.equal(await link.locator("svg").getAttribute("aria-hidden"), "true");
    }
    const layout = await contact.evaluate(footer => {
      const form = footer.querySelector("form").getBoundingClientRect();
      const social = footer.querySelector(".socials").getBoundingClientRect();
      const icons = [...footer.querySelectorAll(".socials a")].map(link => link.getBoundingClientRect());
      return {
        belowForm: social.top >= form.bottom,
        sameRow: icons.every(icon => Math.abs(icon.top - icons[0].top) < 1),
        overflow: document.documentElement.scrollWidth > innerWidth,
      };
    });
    assert.deepEqual(layout, { belowForm: true, sameRow: true, overflow: false });
    console.log(`Contact at ${width}px: bullets, newsletter validation, accessible icons, and layout passed`);
    await page.close();
  }
} finally {
  await browser?.close();
  server.kill();
}
