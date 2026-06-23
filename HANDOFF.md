# Handoff — 2026-06-23

## Done this session
- Added a "buy me a coffee" patch to `#links-block`, next to the "let's chat"
  cal.com patch. Reuses `.cal-patch` styling on `sunshine.jpg` cloth with a
  `+1.5°` tilt so it reads as its own placed piece. Links to
  https://buymeacoffee.com/aayushkucheria. Chose the BMC link over their JS
  widget — the floating widget would break the fixed, no-chrome cloth surface.

## Decided but not built
- The Buttondown newsletter form in `#links-block` is intentionally **unstyled**
  (raw embeddable form, only the "Powered by Buttondown" line is muted/right-aligned).
  User explicitly asked not to aesthetically modify it yet. A future pass could
  style it to match the cloth system (bare-on-cloth input, stitch-style label).
- Optional later: add `?embed=1` + a few lines of `fetch` so subscribing shows an
  inline success message instead of opening Buttondown's hosted confirmation.

## Known issues / loose ends
- Free Buttondown plans require keeping the "Powered by Buttondown" referral link —
  it's currently present but de-emphasized. Fine to remove only on a paid plan.
- Untracked `prototypes/` HTML explorations and `.vscode/` editor config remain
  uncommitted by choice — design scratch + local config, not shipped.

## Next logical step
Confirm the GitHub Pages deploy went live, then decide whether to style the
Buttondown form to match the site or leave it plain.
