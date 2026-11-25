'use strict';
(() => {
  const overlay = document.querySelector('.bambu-opening');
  const drawing = overlay?.querySelector('.opening-flight');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (!overlay || !drawing || document.hidden || reduced.matches || location.hash) return;
  // Replay the brand introduction on every homepage load, regardless of previous visits.
  const root = document.documentElement;
  const listeners = new AbortController(), timers = [];
  const behind = [...document.body.children].filter(el => el !== overlay && !['SCRIPT','STYLE'].includes(el.tagName));
  const previous = behind.map(el => el.inert);
  let complete = false, reveal;
  const center = () => {
    const width = innerWidth * .84, height = width * 155 / 540;
    drawing.style.width = width + 'px';
    drawing.style.transform = `translate(${(innerWidth-width)/2}px,${(innerHeight-height)/2}px)`;
  };
  const finish = () => {
    if (complete) return;
    complete = true;
    timers.forEach(clearTimeout);
    listeners.abort();
    overlay.hidden = true;
    root.classList.remove('brand-revealing','intro-running','intro-revealing');
    behind.forEach((el,i) => { el.inert = previous[i]; });
    reveal?.cancel();
  };
  const revealSite = () => {
    if (complete) return;
    root.classList.add('intro-revealing');
    reveal = overlay.animate([{opacity:1},{opacity:0}], {
      duration: 260, easing: 'cubic-bezier(.33,0,.67,1)', fill: 'forwards'
    });
    reveal.finished.then(finish).catch(() => {});
  };
  behind.forEach(el => { el.inert = true; });
  root.classList.add('brand-revealing','intro-running');
  overlay.hidden = false;
  center();
  requestAnimationFrame(() => overlay.classList.add('opening-active'));
  timers.push(setTimeout(revealSite, 2360), setTimeout(finish, 3450));
  overlay.querySelector('.opening-skip').addEventListener('click', finish, {signal:listeners.signal});
  addEventListener('keydown', e => { if (e.key === 'Escape') finish(); }, {signal:listeners.signal});
  addEventListener('resize', center, {signal:listeners.signal});
  addEventListener('pagehide', finish, {once:true,signal:listeners.signal});
  reduced.addEventListener('change', e => { if (e.matches) finish(); }, {signal:listeners.signal});
})();
