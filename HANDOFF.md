# Handoff — 2026-06-23

## In progress
- Major design exploration: reworking the site from a single-screen "cloth
  poster" into a **place with "corners"**. Full write-up in
  [`DESIGN-DIRECTION.md`](DESIGN-DIRECTION.md). The chosen direction is the
  two-pane "pocket" layout: [`prototypes/corners-two-pane.html`](prototypes/corners-two-pane.html).
  Nothing is in production yet — `src/pages/index.astro` is untouched.

## Decided but not built
- The whole "Place, not Poster" direction (corners, primitive taxonomy, two-pane
  pocket, auto-fit responsive, phone long-scroll). See DESIGN-DIRECTION.md §2–§6.
- New corners wanted: steal these ideas, now, about (the two research questions
  belong here), maybe uses / colophon.
- Personality moves off hand-placed coordinates onto the vibe layer + a fixed
  primitive set + content; placement (flow + tilt) becomes automatic.

## Known issues / loose ends
- **Pocket darkness** value not finalized — default is the baseline and is good,
  but user was still tuning. Use the on-page tweak panel to settle it.
- Not built: seam-spill (pieces crossing the pocket edge); patch colour
  treatment (accent edge vs bolder block) undecided; final corner list/content.
- The tweak panel in `corners-two-pane.html` is dev-only — strip on port.
- Older `prototypes/` studies and `.vscode/` remain untracked by choice (scratch
  + local config).

## Next logical step
Write an implementation plan to port `corners-two-pane.html` into
`src/pages/index.astro` (substantial restructure — plan before coding), folding
back the splash interaction and SVG threads.
