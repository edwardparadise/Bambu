'use strict';
(() => {
  const cue = document.querySelector('.home-scroll-cue');
  if (!cue) return;
  const target = document.querySelector(cue.getAttribute('href'));
  let queued = false;
  const update = () => {
    const dismissed = scrollY > 48;
    cue.classList.toggle('is-dismissed', dismissed);
    cue.tabIndex = dismissed ? -1 : 0;
    cue.setAttribute('aria-hidden', String(dismissed));
    queued = false;
  };
  const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('pageshow', schedule);
  cue.addEventListener('click', () => {
    if (!target) return;
    target.setAttribute('tabindex', '-1');
    requestAnimationFrame(() => target.focus({preventScroll:true}));
  });
  update();
})();
