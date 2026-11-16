# Handoff — 2026-11-16

## SoloWare follow-up

The ten-project grid is live and editable through `/write`. The user has begun
replacing project titles and adding short notes; the current source is in
`src/content/project-1.md` through `project-10.md`. The list order remains
provisional. The user will define the stealability status tags and may add
descriptions and demos. Preserve their current copy when making those changes.

All ten linked repositories were private when checked on 6 November. Their
current visibility and code/history have not been reassessed. Review each
repository before proposing a visibility change; none was changed in this work.

## Other deferred work

Typography exploration remains in `PLAN.md`; Source Serif 4 was the first font
to compare. Dependency advisories noted in the earlier handoff have not been
reassessed.

## Next logical step

When the user defines the status labels and ordering, add them to the shared
content and `/write` workflow, then verify the live page after publishing.

## Home content incident — 16 November

Commit `f328084` had replaced `src/content/home.md` with an exact copy of
`project-1.md`; the live Home page lost its introduction. The previous Home
source was restored from `f328084^`. A writing-room save guard now rejects an
exact SoloWare project copy submitted as the Home introduction. The historical
editor action that sent the copy to Home could not be reconstructed from the
commit; investigate if it recurs. The regression is in
`tests/soloware-browser.mjs`, with a source check in `tests/home-content.test.mjs`.
