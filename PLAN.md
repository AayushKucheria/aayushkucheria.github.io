# Personal Website — Plan

## Stack  (DONE)
Astro — static output, deployed to GitHub Pages via GitHub Actions. The repo
`aayushkucheria.github.io` is a user site → served at root, base path `/`.

## M1 Status: SHIPPED

Steps completed:
- [x] Settled milestone ladder (SPEC.md)
- [x] Removed Jekyll / Chirpy, scaffolded Astro
- [x] Prototyped 6 directions; Aayush chose editorial-spread + scattered-whiteboard hybrid
- [x] Built M1 in Astro (`src/pages/index.astro`)
- [x] GitHub Actions deploy workflow (`.github/workflows/deploy.yml`)
- [x] `astro build` passes clean

## Design direction (locked for M1)
- Full-width layouts — no centered column with empty margins
- Dotted grid background, Shantell Sans, roughnotation scroll annotations
- Synthesis section offset ~30% from left (prototype E)
- Work: wall-to-wall 5-column grid (prototype D)
- Footer: two-column split (now / contact)

## Next milestones (SPEC.md for detail)
- M2 — Now: a living "what I'm focused on" page
- M3 — Work, deepened
- M4 — Bookshelf
- M5 — Writing

## Notes
- Push to main triggers auto-deploy via GitHub Actions
- No unit tests — static content site; verify visually in browser
- PLAN.md / SPEC.md committed to git as of M1 ship
