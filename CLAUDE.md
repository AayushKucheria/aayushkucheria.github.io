# Personal Website

The live site is a single static Astro page: `src/pages/index.astro`.

## Layout

The page has one centered content column at every viewport width. The intro,
work, about, ideas, reading, now, community, and contact appear in that order.
All sections stay visible in a continuous scroll. Work entries stack vertically.
There are no layout breakpoints, fixed panes, tabs, or client-side scripts.

The warm cloth colors, Shantell Sans, photo prints, small tilts, and patches
carry the handmade feel. Keep the structure and code simple when editing it.

## Commands

- `npm run dev` — local dev server on port 4321
- `npm run build` — static build to `dist/`

Pushing `main` deploys through GitHub Actions. The frozen 25 September 2026
version lives in `public/archive/2026-09-25/`; leave it intact.
