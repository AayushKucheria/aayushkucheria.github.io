import { readFile, writeFile, rename, rm } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
function cleanHtml(html) {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title"],
      code: ["class"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, target: "_blank", rel: "noopener noreferrer" },
      }),
    },
  });
}
export function renderMarkdown(markdown) {
  const tokens = marked.lexer(markdown);
  const levels = [];
  let html = "", body = [];
  const flush = () => {
    body.links = tokens.links;
    html += cleanHtml(marked.parser(body));
    body = [];
  };
  const close = () => { html += "</div></div></details>\n"; levels.pop(); };
  for (const token of tokens) {
    if (token.type !== "heading") { body.push(token); continue; }
    flush();
    while (levels.length && levels.at(-1) >= token.depth) close();
    const label = token.text
      ? cleanHtml(marked.Parser.parseInline(token.tokens))
      : "Untitled";
    html += `<details class="fold"><summary><h${token.depth} class="toggle-label">${label}</h${token.depth}></summary><div class="fold-panel"><div class="fold-body">`;
    levels.push(token.depth);
  }
  flush();
  while (levels.length) close();
  return html;
}
export function createContentStore(path) {
  let queue = Promise.resolve();
  const read = async () => {
    const markdown = await readFile(path, "utf8");
    return {
      markdown,
      revision: createHash("sha256").update(markdown).digest("hex"),
    };
  };
  return {
    read,
    save(markdown, revision) {
      const task = queue.then(async () => {
        const current = await read();
        if (current.revision !== revision)
          throw Object.assign(
            new Error(
              "The source changed in another editor. Your draft is still here.",
            ),
            { status: 409 },
          );
        const temp = path + "." + randomUUID() + ".tmp";
        try {
          await writeFile(temp, markdown, "utf8");
          await rename(temp, path);
        } finally {
          await rm(temp, { force: true });
        }
        return read();
      });
      queue = task.catch(() => {});
      return task;
    },
  };
}
