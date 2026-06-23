# Personal Website — CLAUDE.md

> **Shipped 2026-06-23:** the site is now the two-pane **"place with corners"**
> design (formerly the single-screen "cloth poster"). The brief and rationale
> live in `DESIGN-DIRECTION.md`; the source prototypes are
> `prototypes/corners-two-pane.html` (layout) and
> `prototypes/primitive-taxonomy.html` (the piece vocabulary). Production is the
> single Astro page `src/pages/index.astro`.

## Stack
- Astro (static output) → deploys to GitHub Pages at aayushkucheria.github.io
- `npm run dev` — dev server on **localhost:4321** (port pinned)
- `npm run build` — static build to `dist/`
- `npm test` — Playwright regression suite (`build` + preview on **4322**): splash
  tests + corners tests (`scripts/run-splash-tests.mjs`)
- Single page: `src/pages/index.astro`
- Push to `main` → auto-deploy via GitHub Actions

## The big idea
A **place you move through**, not a poster. The personality lives in three places
that are decided once or are automatic — never in hand-tuned coordinates:
1. **The vibe layer** — cloth surface, canvas weave, warm palette, Shantell Sans.
2. **A fixed set of primitives** (the taxonomy below) — learn once, reuse everywhere.
3. **The content** — your work, ideas, books, writing.
Placement (flow + tilt) is automatic via `:nth-child`. You decide *what exists*
and *which corner it lives in*, never *where it sits*.

## Layout — two-pane "pocket" (master–detail)
`.layout` is a CSS grid: `var(--pocket-width) 1fr`.

- **LEFT = `.home-pane`** — static "home base", `position: fixed`, never scrolls.
  Holds: photos, name (`.hero`), the "Based in Helsinki" tag, a short
  description, and all contact (cloth CTAs, email, socials, Buttondown form).
- **RIGHT = `.corner-pane`** — the only part that scrolls. A horizontal stitched
  `.corner-nav` row sits sticky at the top; one `.corner` shows at a time.
- **The pocket effect:** `.home-pane` carries a separate darker-cloth background
  layer, `.pocket-bg`, with a hand-cut wavy edge via the `#cloth-edge`
  `feDisplacementMap` filter and a soft rightward shadow. Keep the
  `.home-pane > *:not(.pocket-bg)` rule — without the `:not()` the pocket
  collapses to 0px (specificity bug).
- **Switching is instant** — no transition. Tab click toggles `.active` on the
  tab and the matching `#c-<name>` corner.

## Corners
Six corners, nav order: **work · about · steal these ideas · reading · now ·
community**. Tab `data-corner` values: `work, about, ideas, reading, now,
community`; sections are `#c-work … #c-community`; `work` is active on load.
Each corner's first child is a `.corner-h` (hidden on desktop, shown on mobile).
`about` holds the two research questions; `reading` groups books by theme with
`.sub-label`s; `community` holds the two org entries.

## Primitive taxonomy (the "set of pieces")
Reference: `prototypes/primitive-taxonomy.html`. CSS is organized by piece.
- **Mark** — bare ink: `.hero`, body text, `.stitch-label` / `.sub-label`.
- **Patch** — cloth on cloth, the workhorse: `.patch` with tint
  (`.slate/.sage/.terracotta/.umber`, a thin stitched accent edge via `::after`,
  not a fill), size (`.patch` / `.patch.sm`), and **spine** (`.spine`, deep-dyed,
  for books). Work cards, ideas, now-cards, and books are all this one piece.
- **Photo** — `.photo` polaroid (cream border `#f2ede4`) + `.cap`.
- **Tag** — `.tag` (`.string` + `.card`): paper tag on a thread, for tiny meta.
  Used for the "Based in Helsinki" coda.
- **Thread** — SVG line: loose-filament atmosphere + the roughnotation reading
  bracket.
- **Containers:** Corner (`<section class="corner">`) and Label-list
  (`.stitch-label` + a `.grid` / `.wrap` flow).

## Contact CTAs (cloth, not tags)
"let's chat" and "buy me a coffee" are fabric **cloth patches** (`.cal-patch`
with `.cal-patch-bg`), not tags: `let's chat` = `/fabrics/pink_cotton.jpeg`,
`buy me a coffee` = `/fabrics/blue_linen.jpeg`, each with the `#cloth-edge`
torn-edge filter. Other fabrics available in `public/fabrics/`.

## Color system
- `--clr-board: #ddd5be` — the single cloth surface (canvas weave via
  `body::before`, `mix-blend-mode: multiply`).
- `--pocket-color: #ccc2a6` — the darker left pocket cloth.
- `.patch` background `#cec3ac` — cloth on cloth.
- Ink: `--clr-ink #2a2218` (primary) · `--clr-ink2 #5a4830` · `--clr-ink3 #7a6a50`.
- `--clr-tan #b09060` — threads, roughnotation, patch accent edges. Never on text.

## Responsive — one fluid layout + one breakpoint
- Corners use `grid-template-columns: repeat(auto-fit, minmax(230px, 1fr))` — 1–3
  columns fill the width automatically with no extra breakpoints.
- **One breakpoint (960px):** above = two panes; below = panes stack, `.pocket-bg`
  hidden, `.corner-nav` hidden, every `.corner` shown stacked under its
  `.corner-h`. One minor tweak at 519px.

## Paint splash interaction
Click empty right-pane cloth → organic SVG paint splash (spring bounce). A
document-level listener paints unless the click target is interactive/content
(`PAINT_IGNORE`) or the left `.home-pane`; `#dot-layer` is a non-blocking
geometry element that also sizes the canvas/threads to the right pane. Splashes
append to `document.body` (`.splash-wrap`, `position: fixed; z-index: 5`), max
100, stored in `localStorage` key `wb-v1`. Regression tests:
`scripts/test-splash-*.mjs`, run via `npm test`.

## corner-nav must stay transparent
The sticky `.corner-nav` has **no** background fill, weave, or mask. Giving it
its own opaque `--clr-board` + weave makes it read as a distinct lighter,
differently-woven band over the shared `body::before` cloth (confirmed via
runtime measurement). Let the single fixed surface show through.

## SVG filters
- `#cloth-edge` — `feDisplacementMap` for the pocket's wavy edge and the cloth
  CTA edges. NOTE: its `feTurbulence` source is not desaturated; on some GPUs
  this can produce a faint colored fringe at filtered edges (open issue, see
  `HANDOFF.md`).

## Preferences (do not change without asking)
- Keep the cloth soul: weave, warm palette, Shantell Sans, handmade marks.
- No CSS borders for section dividers; no dark backgrounds.
- Personality via primitives + content, not hand-placed coordinates.
- Instant corner switching — no animation.
- Keep code extremely simple and elegant.
