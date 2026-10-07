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

The page has one centered content column: photos, name, the Helsinki tag hanging
beneath the end of the name, introductory bullets, and expandable sections.
Markdown headings in `src/content/home.md` become native `details` toggles;
deeper headings nest. Shared styling in `src/styles/toggles.css` supplies muted
color, textured heading patches, and dashed margins. `src/toggles.js` adds smooth
expansion; native toggles also work without JavaScript. The approved reference
is `prototypes/toggle-colored-stitches.html`. Starter section bodies are dummy
`abcd` / `efgh` text and make no claims about the owner's work or activity.

Contact links and the fixed Buttondown form share a toggle in
`src/components/Contact.astro`. Its label comes from `contact-heading.txt`.
GitHub, LinkedIn, X, and coffee icons remain visible beneath it.
The local writing room uses these same renderers and styles, keeps toggles open
while writing, and provides a Heading button plus `##` / `###` Markdown support.
Read mode enables toggles. Heading structure survives direct edits and autosave.
The published page includes only the toggle interaction, with no editor route/API.

The warm cloth colors, Shantell Sans, photo prints, small tilts, and patches
carry the handmade feel. Keep the structure and code simple when editing it.

## Commands

- `npm run dev` — local dev server on port 4321
- `npm run build` — static build to `dist/`
- `npm test` — source and renderer checks
- `npm run test:browser` — isolated browser saving checks
- `npm run test:build` — build and production output check
- `npm run test:contact` — build and check contact links, form, and icon layout
- `npm run test:toggles` — responsive toggle interactions and progressive enhancement

Pushing `main` deploys through GitHub Actions. The frozen 25 September 2026
version lives in `public/archive/2026-09-25/`; leave it intact.

## Local publishing

`/write` autosaves locally; only Publish sends content online. `publish.mjs`
commits registered content files with `git commit --only`, preserves staged code,
refuses non-main branches and unrelated unpublished commits, and never force
pushes or pulls. The local-only API uses the same host/origin checks as saving.
The button flushes every region, locks editing, and shows phases with elapsed
seconds. Reload resumes progress. GitHub CLI follows the matching Pages workflow;
Live requires the public page to contain the committed content. Failed pushes
retain the commit for retry. Content edits stay local until the button is pressed.
