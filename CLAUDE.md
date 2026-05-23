# Personal Website — CLAUDE.md

## Stack
- Astro (static output) → deploys to GitHub Pages at aayushkucheria.github.io
- `npm run dev` — dev server on **localhost:4321** (port pinned)
- `npm run build` — static build to `dist/`
- Single page: `src/pages/index.astro`
- Push to `main` → auto-deploy via GitHub Actions

## Design language
The site is a **whiteboard pinned to a warm tan wall** — not a scrolling document. Everything is `position: fixed`, single viewport, no scroll.

- Wall: `#d4c4a8`. Board: `#f3eadb`, inset 28px, with masking tape strips (`.tape`)
- Font: Shantell Sans (Google Fonts), weights 300–800
- Content lives in **islands**: `position: fixed` zones with 2–5° tilts
- Island types: `.sticky` (yellow `#f5e97a`), `.torn` (clip-path torn edge), bare (no wrapper)
- Colors: red `#c8341a`, blue `#2a5e8c`, tan `#c8a87a`

## Design tokens — edit in ONE place
All typography and colors are CSS custom properties at the top of the `:root` block in `index.astro`, above the island positions. To change fonts, sizes, or colors globally, edit the token there.

**Tokens covered (change here, updates everywhere):**
- `--font` — font family
- `--sz-name` / `--sz-name2` — hero name sizes (clamp)
- `--sz-2xl` through `--sz-xs` — type scale (1.5rem → 0.6rem), `--sz-cover` for book spines
- `--clr-wall`, `--clr-board`, `--clr-paper`, `--clr-sticky` — surface backgrounds
- `--clr-ink`, `--clr-red`, `--clr-blue`, `--clr-tan`, `--clr-brown`, `--clr-muted` — text & accent colors

**Still one-off literals (must edit in-place if changed):**
- Alpha variants like `#c8341a44`, `#2a5e8c14` — hex alpha suffixes can't reference a CSS var
- `#9a2010` — red hover darken on `.w-subtitle a:hover`
- `#5a4030` — `#work-lbl` color (slightly different brown from `--clr-brown`)
- `#2a2210`, `#3a2e10` — community label/text darks
- `#6a5038`, `#9a8060` — pill name/desc browns
- `#9a8a6c` — bookshelf label color
- `#4a3820`, `#8a7248` — tooltip and hint text
- `#faf7f0` — proj-card and tooltip bg (close to `--clr-paper` but distinct)
- Book cover gradients: `.t1` blue, `.t2` green, `.t3` rust
- **JS canvas / splash colors** in `drawAll()` and `renderSplash()` — `#c8341a`, `#5a3a18`, `#c8a87a` variants — these are literals in the script block and don't read CSS vars

## Island positions — edit in ONE place
All island positions are CSS custom properties at the top of the `<style>` block in `index.astro` (just below the design tokens), with an ASCII map. To move any section, change its variable there — not scattered in individual rules.

```
BOARD ZONES (approx 1440 × 900)
┌──────────────────────────────────────────────────────────┐
│ [ph][ph] [  name  ] [ph][ph]  [proj][proj][proj]         │
│                                                [links]   │
│ [W O R K  ——  hero, 580px wide]  [intro]  [community]   │
│                          [research/intro]                │
│                                         [bookshelf]      │
└──────────────────────────────────────────────────────────┘
```

## Content islands
| ID | Type | Zone | Content |
|---|---|---|---|
| `#name-block` | bare | top, left:195px, -2° | "Aayush Kucheria" 5rem/3.9rem |
| `#photo-1/4` | `.photo-ph` polaroid | top-left of name (left:36/98px) | eagx + wappu photos |
| `#photo-2/3` | `.photo-ph` polaroid | top-right of name (left:500/572px) | selfie + group photo |
| `#projects-block` | bare flex row | top, left:800px, +1° | 3 pinned project cards (150px wide each) |
| `#links-block` | bare | top-right, right:52px, top:44px, -1° | cal.com + email + socials |
| `#research-block` | `.torn` | center, left:700px, top:270px, -3° | "hi, I'm Aayush" intro greeting + teaser |
| `#work-block` | bare | left-center hero, left:48px, top:195px, -1.5° | vertical stack of 2 full-width cards, `#work-lbl` annotated |
| `#intro-block` | `.sticky` | center board, +1.5° | tagline italic |
| `#community-block` | `.sticky` + pin | center-right, right:52px, top:220px, +2° | "community" heading + "adding soon" |
| `#reading-block` | bare | bottom-right, +1° | 10 book covers (58×76px) + bracket annotation, labelled "bookshelf" |

## Annotations (roughnotation)
Fire sequentially on load:
1. Highlight on `#work-lbl` — yellow, 200ms
2. Bracket on `#book-list` — red, left side, 800ms

## Canvas (roughjs)
`drawAll()` runs on load and resize. Draws:
- Connecting arcs: name→work, name→research, name→projects, work→reading
- Curly brace on left edge of `#work-block` labelled "work" in tan
- 24 atmospheric squiggles (roughness 3.8, very faint tan)
- 10 small rough circles scattered

## Paint splash interaction
Click anywhere on `#dot-layer` → organic SVG paint splash appears with spring bounce animation. Fresh splashes: red `#c8341a`. Return-visit splashes: dark `#5a3a18`, faded. Max 100, stored in localStorage key `wb-v1`.

## Bookshelf block
10 book covers (58×76px), absolutely positioned in a 390×178px container, 2 rows of 5. Three color-coded theme groups — no labels, color communicates grouping:
- **Blue** (`#3a5c7a → #4e7a9e`): machines & minds — Dream Machine, Philosopher of Palo Alto, Mindstorms
- **Green** (`#3d6645 → #547a5c`): embodiment — Spell of the Sensuous, Becoming Animal, Love and Will
- **Rust** (`#7a3528 → #9e4a3a`): AI futures — Precipice, Otherness & Control AGI, Live Theory Seq., Alignment Problem
Hover shows `#cover-tip` tooltip (title + author).

## Preferences (do not change without asking)
- No CSS borders for section dividers
- No centered column layouts — full viewport, absolute positioning
- No dark backgrounds
- roughness 3.5+ on all annotations — wobblier is better
- Variety of annotation types — never all the same
- Squiggles: more is more, they give the analogue feel
- Keep code extremely simple and elegant — no fancy tricks
