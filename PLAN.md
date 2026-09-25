# Personal Website — Layout Plan

## Decision

Use one top-to-bottom reading flow at every screen width. Keep the warm,
handmade visual character and all current section content and links. Put
contact and the newsletter last. Skip a separate prototype.

## Implementation

- Replace the fixed two-pane layout, tabs, and card grid with one centered
  column and always-visible sections.
- Remove layout breakpoints and JavaScript tied to the old panes and tabs.
- Preserve the archived 25 September 2026 build.
- Check the result in a browser at wide and narrow widths, then use
  `npm run build` as the ongoing project check.

## Verified

- Confirmed by measurement: the previous live source was 668 lines in
  `src/pages/index.astro`, with a 960px pane breakpoint and a 519px tweak.
- Confirmed by measurement: the new source is 194 lines, with no layout
  breakpoint or client-side script.
- Confirmed by measurement: the layout passed browser checks at 1440px,
  700px, and 390px before the temporary test harness was removed.
