'use strict';
/* Progressive, accessible carousel controls for native horizontal scroll rails.
   Swiping, trackpads, scrollbars and keyboard scrolling work without this script. */
(() => {
  for (const controls of document.querySelectorAll('[data-bambu-controls]')) {
    const rail = document.getElementById(controls.dataset.bambuControls);
    if (!rail) continue;
    const prev = controls.querySelector('[data-bambu-prev]');
    const next = controls.querySelector('[data-bambu-next]');
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      const max = Math.max(0, rail.scrollWidth - rail.clientWidth);
      if (prev) prev.disabled = rail.scrollLeft <= 4;
      if (next) next.disabled = rail.scrollLeft >= max - 4;
    };
    const move = direction => {
      const card = rail.querySelector('.bambu-rail-card');
      if (!card) return;
      const gap = parseFloat(getComputedStyle(rail).columnGap) || 0;
      const step = card.getBoundingClientRect().width + gap;
      rail.scrollBy({ left: direction * step, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    };
    prev?.addEventListener('click', () => move(-1));
    next?.addEventListener('click', () => move(1));
    rail.addEventListener('scroll', update, { passive:true });
    window.addEventListener('resize', update, { passive:true });
    if ('ResizeObserver' in window) new ResizeObserver(update).observe(rail);
    for (const img of rail.querySelectorAll('img')) img.addEventListener('load', update, { once:true });
    update();
  }
})();
