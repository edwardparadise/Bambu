'use strict';

(() => {
  const overlay = document.querySelector('.bambu-opening');
  const artwork = overlay.querySelector('.opening-wordmark');
  const headerMark = document.querySelector('.unified-wordmark');

  if (!headerMark || matchMedia('(prefers-reduced-motion: reduce)').matches || !overlay.animate) return;
  try {
    if (sessionStorage.getItem('bambu-opening-v2')) return;
    sessionStorage.setItem('bambu-opening-v2', 'yes');
  } catch {
    return;
  }

  let timer;
  function finish() {
    clearTimeout(timer);
    overlay.hidden = true;
    headerMark.style.visibility = '';
  }

  overlay.hidden = false;
  headerMark.style.visibility = 'hidden';
  window.addEventListener('scroll', finish, { once: true, passive: true });
  window.addEventListener('pointerdown', finish, { once: true });
  window.addEventListener('keydown', finish, { once: true });
  timer = setTimeout(() => {
    const start = artwork.getBoundingClientRect();
    const end = headerMark.getBoundingClientRect();
    const markWidth = end.width * 223 / 411;
    const scale = markWidth / start.width;
    artwork.animate([
      { transform: 'translate(0, 0) scale(1)' },
      { transform: 'translate(' + (end.x + markWidth / 2 - start.x - start.width / 2) + 'px,' +
        (end.y + end.height / 2 - start.y - start.height / 2) + 'px) scale(' + scale + ')' }
    ], { duration: 540, easing: 'cubic-bezier(.25,.75,.2,1)', fill: 'forwards' });
    overlay.animate([{ backgroundColor: 'var(--limestone)' }, { backgroundColor: 'transparent' }],
      { duration: 540, fill: 'forwards' }).finished.then(finish, finish);
  }, 1950);
})();
