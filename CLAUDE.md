# Personal Website

The live site is a single static Astro page: `src/pages/index.astro`.
Editable copy lives in `src/content/`: `home.md`, `contact.md`, `socials.md`,
`name.txt`, and `location.txt`. The permanent writing room at `/write` uses
the actual page in an iframe and saves each section independently through
`src/editor/integration.mjs`. The editor route and API exist only during dev.
Contact and social labels/URLs can be edited directly or in Markdown view;
name and location use plain text. The Buttondown widget is outside the editable
regions. Section saves retain independent revisions and recovery drafts.

Standing rule: every new content section, heading, label, and hyperlink must
ship with `/write` editing support in the same change. Store its copy in
`src/content/` and verify saving and reloading. Fixed widgets such as Buttondown
are explicit exceptions. See `AGENTS.md`.

## Layout

The page has one centered content column at every viewport width: photos,
name, Helsinki location, and the nested introduction bullets from the downloaded
outline. A contact footer follows as a parent bullet with nested chat,
email, and Buttondown subscription items. GitHub, LinkedIn, X, and coffee icons sit in
one horizontal row beneath the subscription form. The footer lives in
`src/components/Contact.astro`.
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
- `npm run test:contact` — build and check contact links, form, and icon layout

Pushing `main` deploys through GitHub Actions. The frozen 25 September 2026
version lives in `public/archive/2026-09-25/`; leave it intact.
