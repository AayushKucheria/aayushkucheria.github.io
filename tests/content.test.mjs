import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createContentStore, renderMarkdown } from "../src/editor/content.mjs";
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
