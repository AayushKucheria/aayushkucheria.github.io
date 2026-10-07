import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createContentStore, renderMarkdown } from "../src/editor/content.mjs";
import { renderSection } from "../src/editor/rendering.mjs";
test("social profile rendering preserves editable labels and safe links", () => {
  const html = renderSection("socials", "- [My GitHub](https://github.com/example)\n- [Other site](https://example.com)\n- [Unsafe](javascript:alert(1))\n<script>alert(1)</script>");
  assert.match(html, /href="https:\/\/github.com\/example"/);
  assert.match(html, /<span class="social-label">My GitHub<\/span>/);
  assert.match(html, /<svg[^>]*aria-hidden="true"/);
  assert.doesNotMatch(html, /href="javascript:|<script/);
});
test("name and location render as literal text", () => {
  for (const section of ["name", "location"]) {
    assert.equal(renderSection(section, " <img src=x onerror=alert(1)> & name "), "&lt;img src=x onerror=alert(1)&gt; &amp; name");
  }
});
test("source saves atomically and rejects outdated or concurrent revisions", async () => {
  const dir = await mkdtemp(join(tmpdir(), "site-content-"));
  const path = join(dir, "home.md");
  try {
    await writeFile(path, "- Original");
    const store = createContentStore(path);
    const original = await store.read();
    const next = await store.save("- New", original.revision);
    assert.equal(await readFile(path, "utf8"), "- New");
    await assert.rejects(store.save("Stale", original.revision), {
      status: 409,
    });
    const results = await Promise.allSettled([
      store.save("First", next.revision),
      store.save("Second", next.revision),
    ]);
    assert.equal(results.filter((x) => x.status === "fulfilled").length, 1);
    assert.equal(await readFile(path, "utf8"), "First");
  } finally {
    await rm(dir, { recursive: true });
  }
});
test("shared Markdown renderer preserves nested formatting and safe links", () => {
  const html = renderMarkdown(
    "- [link](https://example.com)\n  - **Nested**\n\n<script>alert(1)</script>\n\n[bad](javascript:alert(1))",
  );
  assert.match(html, /<a href="https:\/\/example.com"/);
  assert.match(html, /<ul>[\s\S]*<ul>/);
  assert.match(html, /<strong>Nested<\/strong>/);
  assert.doesNotMatch(html, /<script|href="javascript:/);
});

test("headings become nested expandable sections while introductory bullets stay visible", () => {
  const html = renderMarkdown("- hello\n\n## work\n- abcd\n\n### small bit\n- efgh\n\n## reading\n- ijkl");
  assert.match(html, /^<ul>[\s\S]*hello[\s\S]*<\/ul>\s*<details class="fold">/);
  assert.equal((html.match(/<details class="fold">/g) || []).length, 3);
  assert.match(html, /<summary><h2 class="toggle-label">work<\/h2><\/summary>/);
  assert.match(html, /abcd[\s\S]*<details class="fold">[\s\S]*small bit[\s\S]*efgh/);
  assert.doesNotMatch(html, /<details[^>]*\bopen\b/);
});

test("heading labels remain safe and formatted, including empty headings", () => {
  const html = renderMarkdown("## **abcd** <script>bad()</script>\n\n##\n\n# efgh\n\n- [safe](https://example.com)");
  assert.match(html, /<strong>abcd<\/strong>/);
  assert.doesNotMatch(html, /<script/);
  assert.equal((html.match(/<details class="fold">/g) || []).length, 3);
  assert.match(html, /Untitled/);
  assert.match(html, /href="https:\/\/example.com"/);
});

test("reference links inside heading labels use the document definitions", () => {
  const html = renderMarkdown("## [abcd][site]\n- efgh\n\n[site]: https://example.com");
  assert.match(html, /<h2 class="toggle-label"><a href="https:\/\/example.com"/);
});
