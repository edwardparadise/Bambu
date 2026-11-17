'use strict';

(() => {
  const overlay = document.querySelector('.bambu-opening');
  const artwork = overlay?.querySelector('.opening-wordmark');
  const headerMark = document.querySelector('.unified-wordmark');
  if (!overlay || !artwork || !headerMark) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const key = 'bambu-opening-seen-v3';
  try {
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, 'yes');
  } catch {
    // If storage is unavailable, avoid repeatedly delaying visitors.
    return;
  }

  let completed = false;
  let handoffTimer;
  let finishTimer;
  let markAnimation;
  let overlayAnimation;
  let contentAnimation;
  const main = document.querySelector('main');

  function finish() {
    if (completed) return;
    completed = true;
    clearTimeout(handoffTimer);
    clearTimeout(finishTimer);
    markAnimation?.cancel();
    overlayAnimation?.cancel();
    contentAnimation?.cancel();
    overlay.hidden = true;
    headerMark.style.visibility = '';
    overlay.removeEventListener('pointerdown', finish);
    window.removeEventListener('keydown', onKey);
    window.removeEventListener('scroll', finish);
  }
  function onKey(event) {
    if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') finish();
  }

  overlay.hidden = false;
  headerMark.style.visibility = 'hidden';
  overlay.addEventListener('pointerdown', finish, { passive: true });
  window.addEventListener('keydown', onKey);
  window.addEventListener('scroll', finish, { passive: true });

  // 0–1.95s: pencil, ink, blue and Interiors. 1.95–2.5s: logo handoff.
  handoffTimer = window.setTimeout(() => {
    if (completed) return;
    if (!artwork.animate) { finish(); return; }
    const start = artwork.getBoundingClientRect();
    const end = headerMark.getBoundingClientRect();
    if (!start.width || !end.width) { finish(); return; }
    const scale = end.width / start.width;
    const dx = end.left + end.width / 2 - (start.left + start.width / 2);
    const dy = end.top + end.height / 2 - (start.top + start.height / 2);
    const timing = { duration: 550, easing: 'cubic-bezier(.25,.75,.2,1)', fill: 'forwards' };
    markAnimation = artwork.animate([
      { transform: 'translate(0px, 0px) scale(1)' },
      { transform: `translate(${dx}px, ${dy}px) scale(${scale})` }
    ], timing);
    overlayAnimation = overlay.animate([
      { backgroundColor: '#F4F3EE' },
      { backgroundColor: 'rgba(244,243,238,0)' }
    ], timing);
    if (main?.animate) {
      contentAnimation = main.animate([
        { opacity: .45, transform: 'translateY(14px)' },
        { opacity: 1, transform: 'translateY(0px)' }
      ], timing);
    }
    markAnimation.finished.then(finish, finish);
  }, 1950);
  finishTimer = window.setTimeout(finish, 2800);
})();
