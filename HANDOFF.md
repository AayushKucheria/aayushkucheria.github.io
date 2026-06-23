# Handoff — 2026-06-23

## Known issues / loose ends
- **Tag hover handoff:** `.tag` pendulum swing can hitch slightly when the
  pointer enters or leaves — animation vs transition on `transform`. A
  `@property --tag-angle` approach was tried in-session; worth revisiting if it
  still feels sticky.
- **Pocket / cloth-CTA edge fringe (open):** `#cloth-edge` `feTurbulence` may
  produce a faint colored fringe at filtered edges on GPU (not reproducible
  headless). Try desaturating the turbulence on the user's machine.

## Next logical step
If the Helsinki tag hover still feels sticky on enter/exit, finish the
`@property --tag-angle` settle animation.
