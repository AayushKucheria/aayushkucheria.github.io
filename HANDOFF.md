# Handoff — 2026-11-06

## SoloWare follow-up

The user approved the compact grid in the homepage's style and requested an
immediate public version with ten names and GitHub links only. User-provided
order is provisional. Copy, demos and stealability tag definitions await the
user; do not invent them. All ten repositories are private (verified with gh).
No source/history safety review has been done and no visibility was changed.
Review private repositories before proposing public release. GitHub app needs
reauthentication; local gh works. `/write` edits all new content and navigation.

## Decided but not built

Typography exploration is deferred. See PLAN.md for candidate fonts; Source
Serif 4 is the current first choice to compare against actual site text.

## Known issues / loose ends

Previously recorded dependency advisories for http-cache-semantics, sharp, and
source-map-js have not been reassessed in this session.

## Next logical step

Resume typography exploration when requested; run `npm run dev` to reopen the
local writing room. Publish and the nested-bullet fix are implemented and tested.
The user published the corrected reading groups. Autosave remains local, and
Publish uses local Git/GitHub CLI credentials; `/write` is absent from production.
