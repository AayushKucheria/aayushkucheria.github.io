# Handoff — 2026-06-23

## Done this session
- Rebuilt `src/pages/index.astro` from the single-screen "cloth poster" into the
  two-pane "corners" place (per `DESIGN-DIRECTION.md` + the prototypes).
- Added `scripts/test-corners.mjs` and updated the splash tests for the new
  right-pane layout; `npm test` is green.
- Fixed: `#dot-layer` blocking nav/link clicks; `.corner-nav` painting a distinct
  lighter/differently-woven band (now transparent — confirmed via runtime
  measurement).
- Restored cloth CTAs (let's chat = pink_cotton, buy me a coffee = blue_linen);
  moved photos above the name.

## Known issues / loose ends
- **Pocket / cloth-CTA edge fringe (open):** the `#cloth-edge` `feDisplacementMap`
  uses a non-desaturated `feTurbulence`, which produces a faint yellow-green
  fringe at filtered edges on the user's GPU. NOT reproducible in headless
  Chromium/WebKit (CPU rasterizer), so it could not be measured directly here.
  Pixel-sampled from the user's screenshots at ~rgb(205,192,108); ruled out as a
  base-layer reveal (base is tan). Likely fixes to try: desaturate the turbulence
  (`feColorMatrix type="saturate" values="0"`), add `color-interpolation-filters:
  sRGB`, lower the displacement `scale`, or composite the displaced result back
  to source alpha. Verify on the user's machine, not headless.
- Coffee fabric is `blue_linen.jpeg` per "blue cloth" (original site used
  `sunshine.jpg`); swap if the wrong one.

## Next logical step
Resolve the `#cloth-edge` colored-fringe on the user's GPU (try desaturating the
turbulence first), confirming visually in their browser.
