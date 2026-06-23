# Design Direction — "Place, not Poster"

A working design direction for the next iteration of the site, captured from a
long design conversation + prototyping session (2026-06-23). Nothing here is
built into production yet — `src/pages/index.astro` is unchanged. This is the
brief for a future implementation plan.

**The winning prototype: [`prototypes/corners-two-pane.html`](prototypes/corners-two-pane.html).**
Open it, resize the window, and use the on-page "tweak the pocket" panel. Its
default slider values are the agreed baseline.

---

## 1. Why change at all

The current site is a single-viewport "cloth poster": everything `position:
fixed`, no scroll, one screen. The problem isn't the aesthetic — it's that the
*constraints became taxing instead of generative*:

- Adding or changing anything forces re-solving the whole layout (every element
  is hand-placed with absolute `top/left/rotate`).
- One screen is asked to carry *everything* (identity, intro, work, projects,
  community, reading, contact) at once, forever → constant curation anxiety.
- The cloth metaphor seemed to forbid expand/collapse, pages, scroll — so there
  was nowhere to put depth.

Key reframe: **the single-screen discipline was never the problem; applying it
to ALL content at once was.** Scope it per section and it becomes generative
again.

## 2. Core decisions

1. **Keep the soul.** The cloth surface, weave texture, handmade marks, warm
   palette, Shantell Sans — all stay. This is the part that must not be lost.
2. **Poster → place.** The site becomes a *place* you move through, made of
   distinct sections called **"corners"** (also "cloths"). Each corner is small
   enough to compose with pleasure.
3. **Relax the vows, keep them as tools.** No-scroll is demoted from a sacred
   rule to an option used where it serves. Scrolling is allowed.
4. **Move personality OFF placement.** This is the central craft move. Today
   personality lives in hand-tuned coordinates (exhausting, forever). Move it to
   three places that are decided once or are automatic:
   - **The vibe layer** (cloth, weave, palette, font) — decided once, never
     re-touched.
   - **A fixed set of primitives** (below) — learn once, reuse everywhere.
   - **The content itself** (your books, ideas, writing).
   Placement (flow + tilt) becomes *automatic*. You decide *what exists* and
   *which corner it lives in*, never *where it sits*.

## 3. The primitive taxonomy (the "set of pieces")

Reference sheet: [`prototypes/primitive-taxonomy.html`](prototypes/primitive-taxonomy.html).

There was no defined vocabulary before — that's why authoring felt arbitrary.
The proposed cohesive set:

| Piece | What it is | Use for | Variants |
|---|---|---|---|
| **Mark** | bare ink on the cloth | your voice: headings, body, labels | heading / body / stitch-label |
| **Patch** | a piece of cloth on the cloth | any discrete item | tint (slate/sage/terracotta/umber), size (s/m), **spine** (deep-dyed, for books) |
| **Photo** | a paper polaroid | faces, places, moments | optional caption |
| **Tag** | a paper tag on a thread | tiny meta: a status, a link | — |
| **Thread** | a line | hang a list, tie pieces, atmosphere | — |

Plus two **containers** (the "where", decision-free): **Corner** (one cloth =
one section) and **Label-list** (a stitch-label + a flow of pieces, optionally
with sub-labels).

**The key cohesion fix:** today a book, a project, and a work-card are three
look-alike things. Collapse them into ONE **Patch** with variants. Learn the
piece once, use it in every corner.

**Patch colour** is currently a thin *stitched accent edge* (dashed top line),
not a solid fill — keeps the surface airy and readable. (Open question: bolder
colour blocks instead? See §7.)

## 4. Layout — the two-pane "pocket" (master–detail)

Chosen over a top-tab layout and a single-column layout. On laptop:

- **LEFT = a static "home base"** that never scrolls: name, short description,
  photos, and all contact (let's chat, buy me a coffee, email, GitHub/LinkedIn/X,
  mailing list). It's permanent furniture — you're always "in the room."
- **RIGHT = the corner you picked**, and the *only* part that scrolls. The corner
  nav (work / steal these ideas / reading / now / …) sits as a horizontal
  stitched row at the **top of the right column**. One corner shows at a time.
- **Switching is instant** — no animation, no panning, no transitions (an
  explicit, repeated preference). Same technique as `prototypes/materials.html`.

**The pocket effect** (this is what stops it feeling like a corporate CV
sidebar):
- The left panel is a *darker piece of cloth* than the surface.
- Its right edge is **hand-cut and wavy**, not a straight rule — done with an SVG
  `feDisplacementMap` filter (`#cloth-edge`) on a **separate background layer**
  (`.pocket-bg`) so the fabric warps but the text doesn't.
- It casts a soft shadow rightward, so the right content reads as having slid
  *out of* the pocket. This soft depth replaces the abrupt dividing line.

## 5. Responsive — one fluid layout + a single breakpoint

The current site hand-tunes three tiers; that's a big part of the maintenance
tax. The new approach:

- **`auto-fit` grid inside corners:** `grid-template-columns: repeat(auto-fit,
  minmax(230px, 1fr))`. Columns fill the width automatically — 1 on phone, 2 on
  tablet, 2–3 on laptop — **with no extra breakpoints.** This is what fixes the
  laptop whitespace everywhere at once.
- **One breakpoint only (960px):** above it = two panes; below it = panes stack.
- **Phone = one long scroll**, every corner stacked, each under its own little
  stitched heading; the tab switcher is hidden. (Chosen over tab-switching on
  phone — don't bury content behind taps.)

Heuristics worth keeping (the "how designers think about this" notes):
- Design mobile-first; the single column is the guaranteed-correct baseline.
- There are only three legit things to do with extra width: turn it into margin,
  add columns, or add a second pane. Stretching one column is the only mistake.
- Master–detail has a standard mobile collapse (panes stack, master → top).
- Prefer container-driven reflow (`auto-fit`, `flex-wrap`) over pixel
  breakpoints. Don't give tablet a bespoke design.

## 6. Corners (sections)

Existing content maps to corners: **work**, **reading** (grouped by theme via
sub-labels: machines & minds / embodiment / AI futures), plus **community**.

New corners wanted:
- **steal these ideas** — one-line ideas, free to take (built in the prototype).
- **now** — what you're focused on now (indie-web `/now`).
- **about** — a longer write-up; good home for the two "research questions" that
  were dropped from the static left panel.
- Optional indie-web ones discussed: **uses**, **colophon** (especially apt for
  a hand-crafted site).

## 7. Open questions / not yet decided

- **Pocket darkness value** — the default is good and is the baseline, but the
  user was still tuning and not 100% certain. Flagged; revisit with the tweak
  panel. (Defaults: see `:root` `--pocket-*` vars in the prototype.)
- **Patch colour treatment** — thin accent edge (current) vs. bolder colour
  blocks. Not finalized.
- **Seam-spill** — letting photos/pieces literally cross the pocket edge onto the
  right was discussed as a strong anti-corporate move but NOT built (the static
  left can't overflow; would need a piece belonging to neither column).
- **Tablet** — currently flips to long-scroll at 960px; confirm that's the right
  threshold vs. keeping tabs a bit wider.
- **Which corners to actually ship**, and final content for each.

## 8. Notes for whoever implements this

- This is a **static HTML prototype**. Production is a single Astro page
  (`src/pages/index.astro`). Porting is a substantial restructure — **write an
  implementation plan first.**
- Reusable techniques proven here: the separate `.pocket-bg` layer + `#cloth-edge`
  displacement filter; the `auto-fit` grid; automatic tilt via `:nth-child`; the
  instant tab-switch JS.
- The on-page **tweak panel** in `corners-two-pane.html` is a dev-only tool for
  tuning the pocket — strip it when porting to production.
- **CSS gotcha we hit:** a `.home-pane > *` rule (specificity 0,1,0) silently
  overrode `.pocket-bg`'s `position: absolute` because of equal specificity +
  later source order, collapsing the pocket to 0px. Fixed with
  `:not(.pocket-bg)`. Watch for that pattern.
- Things to fold back in from the current site when porting: the paint-splash
  interaction and the SVG threads (atmosphere), and the roughnotation bracket.

## Prototype index

- `corners-two-pane.html` — **the chosen direction** (pocket, responsive, tweak panel)
- `primitive-taxonomy.html` — the five-piece vocabulary reference sheet
- `corners-labeled-list.html` — earlier exploration: top tabs + labeled-list corners
- `corners-pinboard.html` — earlier exploration: top tabs + pinboard flow (for comparison)
- (older `color-*`, `surface-*`, `objects-*`, `work-*`, `materials`, `mobile-responsive` files are prior abandoned studies, left untracked)
