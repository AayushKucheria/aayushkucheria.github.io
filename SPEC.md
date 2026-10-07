# Permanent writing room

## Intended behavior

The website and its local writing room share `src/content/home.md`. Keep the
photos, name and Helsinki location in the page template. The writing room edits
only the introduction, with Markdown links, formatting and nested bullets.

Open `/write` after `npm run dev`. Default to editing directly on the rendered
page; provide the approved Markdown editor alongside it. Save after a short
pause, serially, and confirm only after the source file was written. Display
waiting, saving, saved, and failed states; a timer ticks during pending requests.
Keep a browser draft for recovery. Offer retry or reload if another editor has
changed the source, preserving the unsaved draft.

Save to local source automatically. Publishing continues through the existing
GitHub Pages workflow. The static build contains no writing route or save API.
Use a fixed source path, atomic writes, a content revision check and loopback,
same-origin write requests. Render Markdown through one shared renderer.

## Verified project facts

- Confirmed by measurement: `src/pages/index.astro` renders the current page
  with four photos, name and location; `src/content/home.md` supplies the eight
  nested introductory bullet items.
- Confirmed by measurement: `astro.config.mjs` sets `output: 'static'`.
- Confirmed by measurement: `package.json` runs Astro dev on port 4321.
- Confirmed by measurement: `.github/workflows/deploy.yml` builds and publishes `dist` on pushes to `main`.
- Confirmed by measurement: the existing writing prototype uses localStorage
  and download; it does not write project files.
- Confirmed by measurement: installed Astro integration types expose dev-only
  route injection and the `astro:server:setup` middleware hook.

No unverified deployment or server assumptions are required.


## Expandable sections — approved 8 October 2026

Use the colored stitches prototype: muted textured heading washes, rotating
triangles, matching dashed margins, whole-heading tap targets, smooth expansion,
and reduced motion. Keep the introduction visible. Sections open independently;
use native details as the fallback when JavaScript is disabled.

Markdown headings in any editable prose region receive this treatment from the
shared renderer. Deeper headings nest under the preceding shallower heading.
The writing room keeps all sections open while writing, preserves headings when
converting direct edits back to Markdown, offers a Heading button, and enables
toggles in read mode. The contact title is also editable; its fixed newsletter
stays outside editable regions. Social and coffee icons remain visible.

Starter sections are work, steal these ideas, reading, now, and community. Their
bodies contain only `abcd` / `efgh`; previous prototype copy is not published.
