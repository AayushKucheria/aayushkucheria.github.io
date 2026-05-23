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
- Island primitives: `.patch` (cloth on cloth), `.tag` (ochre cloth label — community only), bare (naked text on surface)
- Connections and atmosphere via SVG thread (`#threads`) + roughjs curly brace on work block

## Cloth primitive system
Two primitives, used deliberately:

**`.patch`** — a piece of cloth laid on the surface. Diagonal weave at a different angle from the background (42°/135° vs. the surface's 0°/90°). Slightly warmer: `#d4cab4` on `#ddd5be`. Soft shadow. Used for: work cards, project cards, research block.

**`.tag`** — ochre cloth label. `#c0993a` with woven texture overlay. Used for: community block **only**. The one accent on the board. Has a 🪢 knot emoji instead of a pin — cloth fastening, not corkboard.

**Stitch labels** — section labels ("work", "bookshelf") use `text-decoration: underline dotted #b09060` with wide letter-spacing. Printed/stitched into the surface feel, not floating above it.

**Photos** — paper polaroids on cloth. Cream border `#f2ede4`, not pure white. The paper/cloth contrast is intentional.

**Books** — flat solid cloth colors (no gradients): slate `#4a6272`, sage `#476055`, terracotta `#724038`. Fabric covers over board.

## Color system
Three ink tones, one cloth accent:

**Surfaces:**
- `--clr-board: #ddd5be` — the single cloth surface (canvas)
- `.patch` background: `#d4cab4` — cloth on cloth, slightly warmer
- `.tag` background: `#c0993a` — ochre, community only

**Ink tones (marks on the surface):**
- `--clr-ink: #2a2218` — primary ink, warm near-black. Name, headings, full presence.
- `--clr-ink2 / --clr-brown: #5a4830` — secondary ink, warm medium brown. Labels, subtitles, stamps.
- `--clr-ink3 / --clr-muted: #7a6a50` — tertiary ink, muted warm. Body text, captions.

**Connective tissue:**
- `--clr-tan: #b09060` — threads, roughjs curly brace, roughnotation bracket. Never on text.

**Why one accent:** Only the community tag is ochre. Everything else is canvas-toned. Ochre means something — it's the one deliberately attached thing on the board.

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
- `#c0993a` — tag (ochre) background
- `#f2ede4` — polaroid border (cream)
- `#5a4030` — `#work-lbl` color (slightly different brown from `--clr-brown`)
- `#2a2210`, `#3a2e10` — community label/text darks
- `#6a5038`, `#9a8060` — pill name/desc browns
- `#4a6272`, `#476055`, `#724038` — book cover colors (slate, sage, terracotta)
- `#4a3820`, `#8a7248` — tooltip and hint text
- **JS splash colors** in `renderSplash()` — `#8a4820` / `#4a3018` (fresh/old splash) — literals in script block

## Island positions — edit in ONE place
All island positions are CSS custom properties at the top of the `<style>` block in `index.astro`, with an ASCII map. Change a number there — not scattered in individual rules.

```
SURFACE ZONES (approx 1440 × 900)
┌──────────────────────────────────────────────────────────┐
│ [ph][ph] [  name  ] [ph][ph]  [proj][proj][proj]         │
│                                                [links]   │
│ [W O R K  ——  hero, 580px wide]  [research] [community]  │
│                                                          │
│                                         [bookshelf]      │
└──────────────────────────────────────────────────────────┘
```

## Content islands
| ID | Type | Zone | Content |
|---|---|---|---|
| `#name-block` | bare | top, left:195px, -2° | "Aayush Kucheria" 5rem/3.9rem |
| `#photo-1/4` | `.photo-ph` polaroid (cream border) | around name | eagx + wappu + selfie + group |
| `#projects-block` | `.patch` flex row | top, left:50vw, +1° | 3 project cards |
| `#links-block` | bare | top-right, -1° | cal.com + email + socials |
| `#research-block` | `.patch` | center, left:48.6vw, -3° | "hi, I'm Aayush" greeting + teaser |
| `#work-block` | bare | left-center hero, -1.5° | stitch label + 2 `.patch` cards, roughjs curly brace on left |
| `#community-block` | `.tag` (ochre) | center-right, +2° | 🪢 + "community" heading |
| `#reading-block` | bare | bottom-right, +1° | stitch label + 10 book covers + roughnotation bracket |

## Annotations (roughnotation)
Fires on load:
- Bracket on `#book-list` — tan `#b09060`, left side, 400ms delay, 700ms animation

## Canvas (roughjs) — `drawAll()`
Runs on load and resize. Draws only:
- Curly brace on left edge of `#work-block` labelled "work" in tan `#b09060`

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
