// Native details works without JavaScript; delegation also covers /write rerenders.
const transitions = new WeakMap();
document.addEventListener('click', event => {
  const summary = event.target.closest?.('.fold > summary');
  if (!summary || event.target.closest('a')) return;
  if (summary.isContentEditable) { event.preventDefault(); return; }
  const fold = summary.parentElement;
  const panel = fold.querySelector(':scope > .fold-panel');
  if (!panel) return;
  event.preventDefault();
  const previous = transitions.get(fold);
  const opening = previous ? !previous.opening : !fold.open;
  const from = fold.open ? panel.getBoundingClientRect().height : 0;
  previous?.animation.cancel();
  panel.inert = !opening;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    fold.open = opening;
    transitions.delete(fold);
    return;
  }
  fold.open = true;
  const to = opening ? panel.getBoundingClientRect().height : 0;
  const animation = panel.animate([{ height: `${from}px` }, { height: `${to}px` }], {
    duration: 260, easing: 'ease',
  });
  const state = { animation, opening };
  transitions.set(fold, state);
  animation.finished.then(() => {
    if (transitions.get(fold) !== state) return;
    fold.open = opening;
    transitions.delete(fold);
  }).catch(() => {});
});
