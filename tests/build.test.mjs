import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { renderMarkdown } from "../src/editor/content.mjs";
test("static website renders shared source and excludes the writing room", async () => {
  const source = await readFile("src/content/home.md", "utf8");
  const html = await readFile("dist/index.html", "utf8");
  assert.ok(html.includes(renderMarkdown(source).trim()));
  assert.doesNotMatch(html, /__writer|contenteditable|Website writing room/);
  await assert.rejects(access("dist/write/index.html"));
});
