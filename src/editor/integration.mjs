import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { createContentStore } from "./content.mjs";
import { renderSection } from "./rendering.mjs";
import { sections } from "./sections.mjs";
const sources = Object.fromEntries(Object.entries(sections).map(([id, section]) => [
  id, fileURLToPath(new URL(`../content/${section.file}`, import.meta.url)),
]));
export default function writingRoom() {
  return {
    name: "local-writing-room",
    hooks: {
      "astro:config:setup"({ command, injectRoute, updateConfig }) {
        if (command !== "dev") return;
        injectRoute({
          pattern: "/write",
          entrypoint: fileURLToPath(new URL("./Write.astro", import.meta.url)),
        });
        updateConfig({ vite: { server: { watch: { ignored: Object.values(sources) } } } });
      },
      "astro:server:setup"({ server }) {
        const stores = Object.fromEntries(Object.entries(sources).map(([id, source]) => [id, createContentStore(source)]));
        server.middlewares.use(async (req, res, next) => {
          const requestUrl = new URL(req.url, "http://localhost");
          const path = requestUrl.pathname;
          if (!["/__writer/content", "/__writer/render"].includes(path))
            return next();
          const started = performance.now(),
            id = randomUUID().slice(0, 8);
          const respond = (status, data) => {
            res.statusCode = status;
            res.setHeader("Content-Type", "application/json");
            res.setHeader("Cache-Control", "no-store");
            res.end(JSON.stringify(data));
          };
          try {
            const host = req.headers.host || "";
            if (!/^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(host))
              return respond(403, { error: "Use the local writing room." });
            if (req.method === "GET" && path === "/__writer/content") {
              const section = requestUrl.searchParams.get("section") || "intro";
              if (!Object.hasOwn(stores, section)) return respond(400, { error: "Unknown website section." });
              return respond(200, await stores[section].read());
            }
            if (req.method !== "POST")
              return respond(405, { error: "Method not allowed" });
            if (req.headers.origin !== `http://${host}`)
              return respond(403, {
                error: "Open the writing room on this local server.",
              });
            let body = "";
            for await (const chunk of req) {
              body += chunk;
              if (Buffer.byteLength(body) > 262144)
                return respond(413, {
                  error: "This draft is too large to save.",
                });
            }
            let data;
            try {
              data = JSON.parse(body);
            } catch {
              return respond(400, { error: "Invalid request." });
            }
            if (typeof data.markdown !== "string")
              return respond(400, { error: "Markdown text is required." });
            const section = data.section ?? "intro";
            if (!Object.hasOwn(stores, section)) return respond(400, { error: "Unknown website section." });
            if (path === "/__writer/render")
              return respond(200, { html: renderSection(section, data.markdown) });
            if (typeof data.revision !== "string")
              return respond(400, { error: "Source revision is required." });
            console.info(
              JSON.stringify({
                event: "writer-save",
                section,
                id,
                phase: "start",
                elapsedMs: 0,
              }),
            );
            const saved = await stores[section].save(data.markdown, data.revision);
            console.info(
              JSON.stringify({
                event: "writer-save",
                section,
                id,
                phase: "saved",
                elapsedMs: Math.round(performance.now() - started),
              }),
            );
            respond(200, saved);
          } catch (error) {
            console.info(
              JSON.stringify({
                event: "writer-save",
                id,
                phase: "failed",
                elapsedMs: Math.round(performance.now() - started),
                status: error.status || 500,
              }),
            );
            respond(error.status || 500, {
              error: error.status
                ? error.message
                : "Could not save the source file. Your draft is still here.",
            });
          }
        });
      },
    },
  };
}
