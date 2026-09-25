# Handoff — 2026-09-25

## Decided but not built
- Move substantive page copy from `src/pages/index.astro` into separate Markdown
  files. Astro already supports Markdown; use content collections when repeated
  work, idea, or book entries warrant one file each. Keep small UI labels in the
  template. The user asked for this direction, but the migration has not started.
- A permanent `dev` branch is unnecessary for now. Use short-lived branches for
  larger changes. Automatic live previews for each branch can be revisited if
  the archived comparison URL is insufficient.

## Known issues / loose ends
- Earlier handoff notes mentioned a possible hitch when hovering the Helsinki
  tag and a faint cloth-edge fringe on some GPUs. Neither was rechecked this
  session.

## Next logical step
Agree which sections and repeated items should move first, then implement the
Markdown content migration without changing the site's appearance.
