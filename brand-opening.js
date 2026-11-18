'use strict';

(() => {
  const overlay = document.querySelector('.bambu-opening');
  if (!overlay || document.hidden || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  try {
    if (localStorage.getItem('bambu-intro-seen')) return;
    localStorage.setItem('bambu-intro-seen', '1');
  } catch {
    return;
  }

  const listeners = new AbortController();
  const finish = () => {
    clearTimeout(timer);
    listeners.abort();
    overlay.classList.add('opening-exit');
    setTimeout(() => { overlay.hidden = true; }, 250);
  };
  const timer = setTimeout(finish, 2250);
  overlay.hidden = false;
  requestAnimationFrame(() => overlay.classList.add('opening-active'));
  for (const type of ['keydown', 'pointerdown', 'scroll', 'pagehide']) {
    window.addEventListener(type, finish, {once: true, passive: true, signal: listeners.signal});
  }
})();
