# Personal Website

The live site is a single static Astro page: `src/pages/index.astro`.
The introduction comes from `src/content/home.md`. The permanent writing room
at `/write` uses the actual page in an iframe and saves that Markdown file through
`src/editor/integration.mjs`. The editor route and API exist only during dev.

## Layout

The page has one centered content column at every viewport width: photos,
name, Helsinki location, and the nested introduction bullets from the downloaded
outline. There are no additional sections or footer.
The published page has no client-side editor scripts. The local writing room
has direct editing and a Markdown view.

The warm cloth colors, Shantell Sans, photo prints, small tilts, and patches
carry the handmade feel. Keep the structure and code simple when editing it.

## Commands

- `npm run dev` — local dev server on port 4321
- `npm run build` — static build to `dist/`
- `npm test` — source and renderer checks
- `npm run test:browser` — isolated browser saving checks
- `npm run test:build` — build and production output check

Pushing `main` deploys through GitHub Actions. The frozen 25 September 2026
version lives in `public/archive/2026-09-25/`; leave it intact.
