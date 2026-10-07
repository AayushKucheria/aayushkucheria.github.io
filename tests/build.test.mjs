import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { renderMarkdown } from "../src/editor/content.mjs";
import { renderSection } from "../src/editor/rendering.mjs";
test("static website renders shared source and excludes the writing room", async () => {
  const source = await readFile("src/content/home.md", "utf8");
  const html = await readFile("dist/index.html", "utf8");
  assert.ok(html.includes(renderMarkdown(source).trim()));
  for (const section of ["contact", "socials"]) {
    const copy = await readFile(`src/content/${section}.md`, "utf8");
    assert.ok(html.includes(renderSection(section, copy).trim()), `Production includes the saved ${section} source`);
  }
  assert.doesNotMatch(html, /__writer|contenteditable|Website writing room/);
  await assert.rejects(access("dist/write/index.html"));
});
