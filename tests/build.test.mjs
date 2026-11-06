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

test('SoloWare and navigation render every registered shared source in static output', async () => {
  const { sections } = await import('../src/editor/sections.mjs');
  const home = await readFile('dist/index.html', 'utf8');
  const solo = await readFile('dist/soloware/index.html', 'utf8');
  for (const [id, section] of Object.entries(sections)) {
    const html = renderSection(id, await readFile(`src/content/${section.file}`, 'utf8')).trim();
    if (section.page === '/soloware/' || section.shared) assert.ok(solo.includes(html), `SoloWare includes ${id}`);
    if (section.shared) assert.ok(home.includes(html), `Home includes ${id}`);
  }
  assert.equal((solo.match(/class="project-card"/g) || []).length, 10);
  assert.doesNotMatch(solo, /__writer|contenteditable|Website writing room/);
});
