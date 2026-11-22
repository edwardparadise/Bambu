'use strict';
(() => {
  const header = document.querySelector('body > header');
  if (!header) return;
  const root = document.documentElement;
  const measureHeader = () => root.style.setProperty('--bambu-header-height', header.offsetHeight + 'px');
  measureHeader();
  if ('ResizeObserver' in window) new ResizeObserver(measureHeader).observe(header);


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

  const launcher = document.createElement('a');
  launcher.className = 'bambu-connect-launch';
  launcher.href = 'contact.html';
  launcher.setAttribute('aria-label', 'Talk to BAMBU. Contact Ed and Joe');
  launcher.innerHTML = '<img src="assets/brand/bambu-b-blue.svg" width="64" height="64" alt=""><span>Let’s talk</span>';
  document.body.append(launcher);

  // Dock the existing native <details> hamburger at top right once the header
  // scrolls away. No duplicate button or separate menu is ever created.
  const nativeMenu = header.querySelector('.mobile-nav');
  if (nativeMenu) {
    const summary = nativeMenu.querySelector(':scope > summary');
    let spacer = null;
    let savedScrollY = 0;
    let queued = false;

    const release = () => {
      if (!header.classList.contains('bambu-floating-header')) return;
      header.classList.remove('bambu-floating-header');
      root.classList.remove('bambu-floating-navigation-open');
      spacer?.remove();
      spacer = null;
      scrollTo({ top: savedScrollY, behavior: 'instant' });
    };

    const update = () => {
      queued = false;
      const elevated = header.classList.contains('bambu-floating-header');
      const dock = !elevated && header.getBoundingClientRect().bottom <= -6;
      root.classList.toggle('bambu-menu-docked', dock);
      position.hidden = scrollY < 260 || nativeMenu.open;
    };
    const requestUpdate = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(update);
    };

    // Elevate the original header only while its native menu is open, so the
    // real BAMBU wordmark and X remain visible and the page keeps its place.
    summary?.addEventListener('click', () => {
      if (nativeMenu.open || !root.classList.contains('bambu-menu-docked')) return;
      savedScrollY = scrollY;
      spacer = document.createElement('div');
      spacer.className = 'bambu-floating-header-spacer';
      spacer.style.height = header.getBoundingClientRect().height + 'px';
      header.before(spacer);
      header.classList.add('bambu-floating-header');
      root.classList.remove('bambu-menu-docked');
      root.classList.add('bambu-floating-navigation-open');
    });

    nativeMenu.addEventListener('toggle', () => {
      if (!nativeMenu.open) release();
      requestUpdate();
    });
    addEventListener('scroll', requestUpdate, { passive: true });
    addEventListener('resize', requestUpdate, { passive: true });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(requestUpdate, { threshold: 0 }).observe(header);
    }
    requestUpdate();
  }

  // An account-specific widget path enables the shared live inbox. Until then,
  // the B icon remains an ordinary, working link to the contact page.
  fetch('chat-config.json').then(response => {
    if (!response.ok) throw new Error('Chat configuration unavailable');
    return response.json();
  }).then(config => {
    if (!config.enabled || !/^[a-f0-9]{24}\/[a-zA-Z0-9]+$/.test(config.tawkWidgetPath || '')) return;
    launcher.href = 'https://tawk.to/chat/' + config.tawkWidgetPath;
    launcher.setAttribute('aria-label', 'Open BAMBU live chat');
    let loading = false;
    let ready = false;
    launcher.addEventListener('click', event => {
      if (ready) { event.preventDefault(); window.Tawk_API.showWidget(); window.Tawk_API.maximize(); return; }
      // A second click still opens the direct inbox if an extension blocks the embed.
      if (loading) return;
      event.preventDefault();
      loading = true;
      launcher.setAttribute('aria-label', 'Loading BAMBU live chat. Select again to open directly');
      const api = window.Tawk_API = window.Tawk_API || {};
      api.onLoad = () => { ready = true; api.showWidget(); api.maximize(); };
      api.onChatMaximized = () => { launcher.hidden = true; };
      api.onChatMinimized = () => { api.hideWidget(); launcher.hidden = false; launcher.focus(); };
      api.onChatHidden = () => { launcher.hidden = false; };
      window.Tawk_LoadStart = new Date();
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://embed.tawk.to/' + config.tawkWidgetPath;
      script.charset = 'UTF-8';
      script.crossOrigin = 'anonymous';
      script.onerror = () => { loading = false; launcher.setAttribute('aria-label', 'Open BAMBU chat directly'); };
      document.body.append(script);
    });
  }).catch(() => { /* Keep the contact destination when configuration cannot load. */ });
})();
