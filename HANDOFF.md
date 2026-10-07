# Handoff — 2026-10-08

## Known issues / loose ends

- The contact footer and `/write` support are complete. New content must
  always include editor support; this standing rule is in `AGENTS.md`.
- Separate design work remains in the working tree: nameplate positioning
  and `prototypes/toggle-*.html`. Preserve those edits for that design session.
- The existing Astro dependency tree has three npm audit advisories affecting
  `http-cache-semantics`, `sharp`, and `source-map-js`. They were observed during
  dependency installation; dependency upgrades were outside the writing editor
  change. The added editor dependencies were not reported as vulnerable.

## Next logical step

Continue the separate design review; reopen the writing room with
`npm run dev` and visit `/write` when editing copy.
