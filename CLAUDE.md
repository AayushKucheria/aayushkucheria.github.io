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
- Island types: `.sticky` (yellow `#f5e97a`), `.torn` (clip-path torn edge), `.index-card` (blue top border `#a8c0e0`), bare (no wrapper)
- Colors: red `#c8341a`, blue `#2a5e8c`, tan `#c8a87a`

## Island positions — edit in ONE place
All island positions are CSS custom properties at the top of the `<style>` block in `index.astro`, with an ASCII map. To move any section, change its variable there — not scattered in individual rules.

```
BOARD ZONES (approx 1440 × 900)
┌──────────────────────────────────────────────────────────┐
│ [name] [photo][photo][photo]  [proj][proj][proj]         │
│                                             [research]   │
│ [W O R K  ——  hero, 580px wide]  [intro]   [think-card] │
│                         [float]             [community]  │
│ [links]                                [reading]         │
└──────────────────────────────────────────────────────────┘
```

## Content islands
| ID | Type | Zone | Content |
|---|---|---|---|
| `#name-block` | bare | top-left, -2° | "Aayush Kucheria" 6rem/4.6rem |
| `#photo-1/2/3` | `.photo-ph` div | top-left cluster | placeholder rectangles — swap for `<img>` |
| `#projects-block` | bare flex row | top-center, +1° | 3 pinned project cards |
| `#research-block` | `.torn` | upper-right, -3° | decorative skeleton (no text) |
| `#work-block` | bare | left-center hero, -1.5° | 2-column grid, `#work-lbl` annotated |
| `#thinking-block` | `.index-card` | mid-right, -4° | decorative skeleton (no text) |
| `#intro-block` | `.sticky` | center board, +1.5° | tagline italic |
| `#float-note` | bare | center-low, +4° | floating question |
| `#community-block` | `.sticky` + pin | mid-right, +2° | Helsinki AI safety community |
| `#reading-block` | bare | bottom-right, +1° | 10 book covers + bracket annotation |
| `#links-block` | bare | bottom-left, -2° | cal.com + email + socials |

## Annotations (roughnotation)
Fire sequentially on load:
1. Highlight on `#work-lbl` — yellow, 200ms
2. Bracket on `#book-list` — red, left side, 800ms

## Canvas (roughjs)
`drawAll()` runs on load and resize. Draws:
- Connecting arcs: name→work, name→research, name→projects, work→reading, thinking→links, float→research (red)
- 24 atmospheric squiggles (roughness 3.8, very faint tan)
- 10 small rough circles scattered

## Paint splash interaction
Click anywhere on `#dot-layer` → organic SVG paint splash appears with spring bounce animation. Fresh splashes: red `#c8341a`. Return-visit splashes: dark `#5a3a18`, faded. Max 100, stored in localStorage key `wb-v1`.

## Reading block
10 book covers (70×92px), absolutely positioned in a 490×220px container, 2 rows of 5. Three color-coded theme groups — no labels, color communicates grouping:
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
