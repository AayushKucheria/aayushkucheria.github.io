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

## Local Publish button — approved

Autosave writes only local content. Publish is the sole editor action that sends
changes online. Match `prototypes/publish-progress.html`: toolbar button, progress
strip, elapsed seconds through saving/pushing/deployment, live result or retry.
Flush all regions before publishing. Commit only registered content files;
preserve unrelated working and staged edits. Require main, never force push or
pull/reset automatically. Refuse to push unrelated unpublished commits.
Use local Git and GitHub CLI authentication. Observe the matching Pages workflow
and verify the live page contains the committed content before reporting Live.
Log phase boundaries with elapsed milliseconds, without content or credentials.
Publishing and saves remain loopback/same-origin only and absent from builds.


## SoloWare — approved 6 November 2026

- `/soloware/` uses the approved compact grid in the homepage's Shantell Sans,
  cloth colors, paper patches and dashed borders. Shared navigation links both pages.
- Initial content is only the ten supplied repository names and GitHub links,
  in the supplied order. Descriptions, notes, media and status tags are empty.
  The user will supply copy, final order and the meaning of stealability tags.
- Keep all new text and destinations in `src/content/`, registered with `/write`.
  Cards and the introduction use visible Markdown headings; notes use the existing
  expandable headings. Selecting a region opens its page in the writing room.
- Saves retain serialization, conflict checks and draft recovery. Publish flushes
  every region and verifies each page's saved content before reporting Live.
- Repository visibility stays unchanged. A safety review is required before
  proposing any private repository for public release; none is reviewed yet.

### Verified facts

- Confirmed by measurement: the static build produces `/` and `/soloware/`;
  shared page styling lives in `src/components/SiteShell.astro`.
- Confirmed by measurement: `src/editor/sections.mjs` registers navigation,
  SoloWare introduction/notes and ten independent project Markdown sources.
- Confirmed by measurement: browser edits save to source, survive reopening
  `/write`, and appear on the public page renderer. Phone widths down to 320px pass.
- Confirmed by measurement: GitHub CLI reports all ten repositories private.
  Links alone will be published; source code and access permissions stay private.
- Confirmed by measurement: `.github/workflows/deploy.yml` deploys static output
  to GitHub Pages on pushes to main. Publication is explicitly authorized.
