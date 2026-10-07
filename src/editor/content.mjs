import { readFile, writeFile, rename, rm } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
export function renderMarkdown(markdown) {
  return sanitizeHtml(marked.parse(markdown), {
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
