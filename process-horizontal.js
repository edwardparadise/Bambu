'use strict';
/* Native horizontal tracks; buttons are optional enhancements. */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  for (const controls of document.querySelectorAll('[data-process-controls]')) {
    const rail = document.getElementById(controls.dataset.processControls);
    if (!rail) continue;
    const previous = controls.querySelector('[data-process-prev]');
    const next = controls.querySelector('[data-process-next]');
    const phase = rail.querySelector('.tube-stations > li');
    if (!phase) continue;
    const update = () => {
      const max = Math.max(0, rail.scrollWidth - rail.clientWidth);
      if (previous) previous.disabled = rail.scrollLeft <= 4;
      if (next) next.disabled = rail.scrollLeft >= max - 4;
    };
    const move = direction => {
      const step = phase.getBoundingClientRect().width;
      rail.scrollBy({left:direction * step, behavior:reduced.matches?'auto':'smooth'});
    };
    previous?.addEventListener('click', () => move(-1));
    next?.addEventListener('click', () => move(1));
    rail.addEventListener('scroll', update, {passive:true});
    addEventListener('resize', update, {passive:true});
    if ('ResizeObserver' in window) new ResizeObserver(update).observe(rail);
    update();
  }
})();
