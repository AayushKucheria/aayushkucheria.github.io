# Personal Website — CLAUDE.md

## Stack
- Astro (static output) → deploys to GitHub Pages at aayushkucheria.github.io
- `npm run dev` — dev server on **localhost:4321** (port pinned)
- `npm run build` — static build to `dist/`
- Single page: `src/pages/index.astro`
- Push to `main` → auto-deploy via GitHub Actions

## Design language
The site is a **cloth surface** — not a scrolling document, not a whiteboard. Everything is `position: fixed`, single viewport, no scroll.

- One surface: `#ddd5be` (unbleached canvas) filling the full viewport, canvas weave texture via `body::before`
- No outer wall, no inset board, no tape — one material layer
- Font: Shantell Sans (Google Fonts), weights 300–800
- Content lives in **islands**: `position: fixed` zones with 2–5° tilts
- Island primitives: `.patch` (cloth on cloth), bare (naked text on surface)
- Connections and atmosphere via SVG thread (`#threads`)

## Visual hierarchy
Four levels of importance, achieved through position, typography, and motion — not color:

1. **Name + face** — large type, polaroid photos, top zone
2. **Intro** (`#research-block`) — bare text on cloth, left side, streams in on load word-by-word, roughnotation underline fires after streaming. The gravitational center.
3. **Work** — horizontal two-card strip, lower on the board (52vh). Quieter typography (`--sz-xl` not `--sz-2xl`). Presence without dominance.
4. **Projects, Community** — equal weight, supporting
5. **Book a call** — prominent but not competing (`--sz-lg` bold)

## Cloth primitive system
Two primitives, used deliberately:

**`.patch`** — a piece of cloth laid on the surface. Diagonal weave at a different angle from the background (42°/135° vs. the surface's 0°/90°). Slightly warmer: `#d4cab4` on `#ddd5be`. Soft shadow. Used for: work cards, project cards.

**Bare** — text directly on the cloth surface. Used for: name, intro, links, bookshelf label. Things that feel written or printed, not placed.

**Stitch labels** — section labels ("work", "bookshelf") use `text-decoration: underline dotted #b09060` with wide letter-spacing. Printed/stitched into the surface feel, not floating above it.

**Photos** — paper polaroids on cloth. Cream border `#f2ede4`, not pure white. The paper/cloth contrast is intentional.

**Books** — flat solid cloth colors (no gradients): slate `#4a6272`, sage `#476055`, terracotta `#724038`. Fabric covers over board.

## Color system
Three ink tones, one cloth accent:

**Surfaces:**
- `--clr-board: #ddd5be` — the single cloth surface (canvas)
- `.patch` background: `#d4cab4` — cloth on cloth, slightly warmer

**Ink tones (marks on the surface):**
- `--clr-ink: #2a2218` — primary ink, warm near-black. Name, headings, full presence.
- `--clr-ink2 / --clr-brown: #5a4830` — secondary ink, warm medium brown. Labels, subtitles, stamps.
- `--clr-ink3 / --clr-muted: #7a6a50` — tertiary ink, muted warm. Body text, captions.

**Connective tissue:**
- `--clr-tan: #b09060` — threads, roughnotation annotations. Never on text.

**Note on accent color:** Community's ochre (`#c0993a`) has been temporarily removed while hierarchy is being tuned. The `.tag` CSS class still exists but is unused. Color decisions come after position/typography hierarchy is settled.

## Design tokens — edit in ONE place
All typography and colors are CSS custom properties at the top of the `:root` block in `index.astro`. To change fonts, sizes, or colors globally, edit the token there.

**Tokens covered:**
- `--font` — font family
- `--sz-name` / `--sz-name2` — hero name sizes (clamp)
- `--sz-2xl` through `--sz-xs` — type scale (1.5rem → 0.6rem), `--sz-cover` for book spines
- `--clr-board`, `--clr-paper` — surface backgrounds
- `--clr-ink`, `--clr-tan`, `--clr-brown`, `--clr-muted` — text & atmosphere colors

**Still one-off literals (must edit in-place if changed):**
- `#d4cab4` — patch background
- `#f2ede4` — polaroid border (cream)
- `#5a4030` — `#work-lbl` color (slightly different brown from `--clr-brown`)
- `#6a5038`, `#9a8060` — pill name/desc browns
- `#4a6272`, `#476055`, `#724038` — book cover colors (slate, sage, terracotta)
- `#4a3820`, `#8a7248` — tooltip and hint text
- **JS splash colors** in `renderSplash()` — `#8a4820` / `#4a3018` (fresh/old splash) — literals in script block

## Island positions — edit in ONE place
All island positions are CSS custom properties at the top of the `<style>` block in `index.astro`, with an ASCII map. Change a number there — not scattered in individual rules.

```
SURFACE ZONES (approx 1440 × 900)
┌──────────────────────────────────────────────────────────┐
│ [ph][ph] [  name  ] [ph][ph]  [proj][proj][proj] [links] │
│                                              [community] │
│ [intro — bare, streams in]                               │
│                                                          │
│ [W O R K — horizontal strip ————————————]  [bookshelf]   │
└──────────────────────────────────────────────────────────┘
```

## Content islands
| ID | Type | Zone | Content |
|---|---|---|---|
| `#name-block` | bare | top, left:13.5vw, -2° | "Aayush Kucheria" 5rem/3.9rem |
| `#photo-1/4` | `.photo-ph` polaroid (cream border) | around name | eagx + wappu + selfie + group |
| `#projects-block` | `.patch` flex row | top, left:50vw, +1° | 3 project cards |
| `#links-block` | bare | top-right, -1° | cal.com + email + socials |
| `#research-block` | bare | left, left:4vw, top:28vh, -1.5° | "hi, I'm Aayush" streams in; roughnotation underline fires after |
| `#work-block` | bare wrapper + `.patch` cards | bottom strip, top:52vh, -1.5° | stitch label + 2 `.patch` cards side-by-side (`.w-row`) |
| `#community-block` | bare (color TBD) | center-right, +2° | "community" heading |
| `#reading-block` | bare | bottom-right, +1° | stitch label + 10 book covers + roughnotation bracket |

## Intro streaming — `streamIntro()`
Fires on load. Splits `.res-txt` into 6-word chunks, fades each in with 520ms stagger starting at 700ms. After all chunks appear, fires a roughnotation underline on `.res-label` (tan `#b09060`, roughness 3.5).

## Annotations (roughnotation)
- Bracket on `#book-list` — tan `#b09060`, left side, 400ms delay, 700ms animation
- Underline on `.res-label` — fires after intro streaming completes

## Canvas (roughjs) — `drawAll()`
Runs on load and resize. Resizes canvas only — no drawings currently. (Curly brace on work block was removed when work became a horizontal strip.)

## SVG threads — `drawThreads()`
Runs on load and resize. Draws into `#threads` (SVG, `inset: 0`):
- **Connection threads**: name→work, name→research, name→projects, work→reading — thin quadratic bezier paths, `#9a7a45`, 0.9px, ~0.5 opacity
- **Loose filaments**: 20 stray thread ends scattered across the cloth — short curved paths, 0.7px, ~0.15–0.33 opacity. Replace the old roughjs atmospheric squiggles.

## Paint splash interaction
Click anywhere on `#dot-layer` → organic SVG paint splash with spring bounce. Fresh: `#8a4820`. Return-visit: `#4a3018`, faded. Max 100, stored in `localStorage` key `wb-v1`.

## Bookshelf block
10 book covers, 2 rows of 5. Flat solid cloth colors — no gradients:
- **Slate** (`#4a6272`): machines & minds — Dream Machine, Philosopher of Palo Alto, Mindstorms
- **Sage** (`#476055`): embodiment — Spell of the Sensuous, Becoming Animal, Love and Will
- **Terracotta** (`#724038`): AI futures — Precipice, Otherness & Control AGI, Live Theory Seq., Alignment Problem
Hover shows `#cover-tip` tooltip (title + author).

## Preferences (do not change without asking)
- No CSS borders for section dividers
- No centered column layouts — full viewport, absolute positioning
- No dark backgrounds
- No outer wall/border around the board — single cloth surface
- roughness 3.5+ on roughnotation annotations — wobblier is better
- Thread filaments for atmosphere, not roughjs squiggles
- Keep code extremely simple and elegant — no fancy tricks
