# Permanent writing room plan

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
