# Personal Website — CLAUDE.md

## Stack
- Astro (static output) → deploys to GitHub Pages at aayushkucheria.github.io
- `npm run dev` — dev server on localhost:4321
- `npm run build` — static build to `dist/`
- Single page: `src/pages/index.astro`

## Design language
The site is a **whiteboard on a wall** — not a scrolling document. Everything is `position: fixed`, single viewport, no scroll.

- Warm tan wall (`#d4c4a8`) shows behind the board (`#f3eadb`, inset 28px)
- Masking tape strips hold the board to the wall (`.tape` elements)
- Content lives in **islands**: absolute-positioned zones with 2–5° tilts
- Zone types: `.sticky` (yellow), `.torn` (clip-path torn edge), `.index-card` (blue top border), plain `.paper`
- Font: Shantell Sans (Google Fonts), weights 300–800

## Annotations (roughnotation)
Loaded from npm (`rough-notation`). Annotations fire sequentially on load:
1. Highlight on intro sticky note (yellow, 200ms)
2. Highlight on "Work" label (yellow, 500ms)
3. Underline on "thinking about" label (blue, 800ms)
4. **Bracket** on reading list — left bracket, red, padding `[18, 6, 12, 6]` (1050ms)
5. Circle on "consciousness" word (red, 1300ms)

## Canvas (roughjs)
Loaded from npm (`roughjs`). `drawAll()` runs on load and resize:
- Connecting arcs between named islands (roughness 2.8, warm tan)
- 24 atmospheric squiggles scattered across the board (roughness 3.8, very faint)
- 10 small rough circles scattered (atmospheric)
- Red arc from float-note to research-block

## Interactive dots
Click anywhere on `#dot-layer` to leave a dot. Fresh dots are red, returning-visit dots are dark/faint. Stored in localStorage key `wb-v1`, max 100.

## Content islands
| ID | Zone type | Position | Content |
|---|---|---|---|
| `#name-block` | bare | top-left, -2° | "Aayush Kucheria" 7.5rem |
| `#intro-block` | sticky | top-right, +4° | tagline italic |
| `#research-block` | torn | upper-center, -3° | Research summary |
| `#work-block` | bare | mid-left, -2° | 4 work items |
| `#thinking-block` | index-card | mid-right, -4° | topics list |
| `#float-note` | bare | center, +5° | floating question |
| `#reading-block` | bare | bottom-left, -1.5° | 10 book covers in 3 themed clusters + bracket |
| `#links-block` | bare | bottom-right, +2.5° | cal.com + email + socials |

## Reading block covers
Books displayed as face-on cover rectangles (44×58px), absolutely positioned within a 340×155px container, clustered in 3 color-coded theme groups:
- **Blue** (`#3a5c7a → #4e7a9e`): machines & minds — Dream Machine, Philosopher of Palo Alto, Mindstorms
- **Green** (`#3d6645 → #547a5c`): embodiment — Spell of the Sensuous, Becoming Animal, Love and Will
- **Rust** (`#7a3528 → #9e4a3a`): AI futures — Precipice, Otherness & Control AGI, Live Theory Seq., Alignment Problem

Each cover is an `<a>` linking to Goodreads (books) or LessWrong (sequences). Hover shows a `#cover-tip` tooltip with full title + author. Covers lift on hover (`scale(1.18) translateY(-5px)`). No theme labels — grouping is communicated by color alone.

## Preferences (do not change without asking)
- No CSS borders for section dividers
- No centered column layouts — full viewport, absolute positioning
- No dark backgrounds
- No rigid frames (the tape+inset approach is intentional)
- roughness 3.5+ on all annotations — wobblier is better
- Variety of annotation types — never all the same
- Squiggles: more is more, they give the analogue feel
