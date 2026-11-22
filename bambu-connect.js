'use strict';
(() => {
  const header = document.querySelector('body > header');
  if (!header) return;
  const root = document.documentElement;
  const measureHeader = () => root.style.setProperty('--bambu-header-height', header.offsetHeight + 'px');
  measureHeader();
  if ('ResizeObserver' in window) new ResizeObserver(measureHeader).observe(header);

  // One quiet square and circular construction line behind the wordmark.
  if (!header.querySelector('.bambu-header-geometry')) {
    const geometry = document.createElement('span');
    geometry.className = 'bambu-header-geometry';
    geometry.setAttribute('aria-hidden', 'true');
    header.append(geometry);
  }


  // A small architectural back-to-top control replaces the tall page tracker.
  // It only appears once the visitor has moved meaningfully down the page.
  if (!header.id) header.id = 'bambu-page-top';
  const position = document.createElement('a');
  position.className = 'page-position';
  position.href = '#bambu-page-top';
  position.title = 'Back to top';
  position.setAttribute('aria-label', 'Back to top');
  position.innerHTML = '<span class="page-position-ring" aria-hidden="true"><span>↑</span></span>';
  position.hidden = true;
  document.body.append(position);

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  position.addEventListener('click', event => {
    event.preventDefault();
    scrollTo({ top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  });

  // Dock this single native <details> hamburger at the top-right after the
  // masthead leaves view. Its existing navigation panel opens over the page:
  // neither the masthead nor the visitor's scroll position is ever moved.
  const nativeMenu = header.querySelector('.mobile-nav');
  if (nativeMenu) {
    let queued = false;
    const update = () => {
      queued = false;
      root.classList.toggle('bambu-menu-docked', header.getBoundingClientRect().bottom <= -6);
      position.hidden = scrollY < 260 || nativeMenu.open;
    };
    const requestUpdate = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(update);
    };
    nativeMenu.addEventListener('toggle', requestUpdate);
    addEventListener('scroll', requestUpdate, { passive:true });
    addEventListener('resize', requestUpdate, { passive:true });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(requestUpdate, {threshold:0}).observe(header);
    }
    requestUpdate();
  }

  // The matching upward arrow is the single floating control.
})();
