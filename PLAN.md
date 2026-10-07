# Permanent writing room plan

## TODO

- [ ] Revisit website typography: consider replacing Shantell Sans with a calmer
  font, since the writing already supplies an informal tone. Compare Source
  Serif 4 (warm, thoughtful), Source Sans 3 (clear, understated), Literata
  (literary), DM Sans (modern), and Georgia (classic). Current first choice:
  Source Serif 4; decide later after seeing it with the site's actual text.

1. Test first: a source store reads Markdown; rejects stale revisions; writes
   atomically; and serializes concurrent saves. Renderer preserves nested lists
   and safe links while excluding executable content.
2. Implement one Markdown source, shared rendering and website template.
3. Implement the dev-only `/write` page and fixed-path API. Check loopback host,
   same-origin writes, request size and revision. Log save phase, request ID,
   elapsed milliseconds and outcome without logging copy.
4. Browser test first: Markdown and direct page edits reach the real source file
   and website; reloading restores source; links and nesting persist; failed
   saves retain drafts; rapid edits cannot finish with stale source.
5. Implement editing modes, serial debounced saves, recoverable drafts and
   conflict handling. Pending requests show a live elapsed time and a simple
   saving message; saved status means disk write completed.
6. Build and inspect output: static page uses Markdown and contains no writing
   room or API. Inspect desktop and phone layouts. Update README and CLAUDE.md.

The previous Markdown preview is the approved design reference. The user has
requested turning it into a permanent source editor; this authorizes proceeding.

## Completed

- Source and renderer tests were written first and failed for missing behavior;
  both now pass.
- Browser saving test first failed because the client had no saving behavior.
  Direct/Markdown writing, links, retry, revision conflicts and rapid edits pass.
- The Markdown copy remains unchanged during tests; browser tests use a temp copy.
- Build rendering uses a raw Markdown import; dev reads the file per request.
  The source is excluded from dev file watching to preserve typing focus.
- A global page stylesheet ensures dynamically rendered Markdown receives the
  same styles as the original static introduction.

- Source, real browser, and static output checks pass. The README documents how
  to reopen the editor and recover drafts. The writing room is absent from builds.


## Expandable sections

- Passed renderer tests: leading prose, heading hierarchy, formatted/safe labels, empty headings.
- Passed browser editing: Markdown headings, direct edits, save/reopen, nested headings,
  and read-mode toggles; fixed newsletter remains intact.
- Passed production browser: dummy starter sections, independent expansion, keyboard,
  rapid clicks, dashed/color texture, contact form, reduced motion, small phones,
  and native behavior with JavaScript disabled.
- Passed build: shared saved source, no writing room/API in static output.
- Commit and push the approved design to main; verify the Pages deployment.

## Local Publish

1. Passed real temporary Git tests: content-only commit/push, preserve staged code,
   retry failed push, reject wrong branch/unrelated ahead commits, double-click
   protection, deployment failure and verified live content.
2. Passed browser: local autosave never publishes; Publish flushes all regions, locks
   editing during publishing, reports moving progress, error/retry, reload status.
3. Passed build: no editor/publish API in production. Update writing instructions.

## Nested bullet save fix

- Confirmed in Chromium: native indent creates sibling lists whose Markdown
  conversion loses nesting. Normalize a copy before conversion; leave the
  editing DOM and selection intact.
- Passed browser regression: toolbar Nest, Tab, Shift+Tab, source save, reopening,
  and public rendering. Restored reading groups; the user published the repair.
