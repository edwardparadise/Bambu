'use strict';
(() => {
  const header = document.querySelector('body > header');
  if (!header) return;
  const root = document.documentElement;
  const measureHeader = () => root.style.setProperty('--bambu-header-height', header.offsetHeight + 'px');
  measureHeader();
  if ('ResizeObserver' in window) new ResizeObserver(measureHeader).observe(header);

  const position = document.createElement('a');
  position.className = 'page-position';
  position.href = '#main';
  position.setAttribute('aria-label', 'Page position. Back to top');
  position.innerHTML = '<span class="page-position-track" aria-hidden="true"><span class="page-position-thumb"></span></span>';
  document.body.append(position);
  let queued = false;
  const updatePosition = () => {
    const range = Math.max(0, root.scrollHeight - innerHeight);
    const progress = range ? Math.min(1, Math.max(0, scrollY / range)) : 0;
    // Pixel offsets keep the thumb fully inside its track at both ends.
    const track = position.firstElementChild;
    const travel = Math.max(0, track.clientHeight - track.firstElementChild.clientHeight);
    track.firstElementChild.style.top = progress * travel + 'px';
    queued = false;
  };
  const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(updatePosition); } };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(document.body);
  updatePosition();

  const launcher = document.createElement('a');
  launcher.className = 'bambu-connect-launch';
  launcher.href = 'contact.html';
  launcher.setAttribute('aria-label', 'Talk to BAMBU. Contact Ed and Joe');
  launcher.innerHTML = '<img src="assets/brand/bambu-b-blue.svg" width="64" height="64" alt=""><span>Let’s talk</span>';
  document.body.append(launcher);

  // The floating three-bar control opens the *same* menu used in the masthead.
  // Re-use the real wordmark, submenu, close icon and navigation, rather than
  // mounting a second imitation menu. A temporary spacer preserves page flow.
  const nativeMenu = header.querySelector('.mobile-nav');
  if (nativeMenu && !document.querySelector('.bambu-quick-menu-toggle')) {
    const menuToggle = document.createElement('button');
    menuToggle.type = 'button';
    menuToggle.className = 'bambu-quick-menu-toggle';
    menuToggle.setAttribute('aria-label', 'Open site navigation');
    menuToggle.setAttribute('aria-controls', 'bambu-native-menu');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.innerHTML = '<span aria-hidden="true"><i></i><i></i><i></i></span>';
    // Only offer the shortcut when the original masthead has left the viewport.
    menuToggle.hidden = true;
    nativeMenu.querySelector(':scope > nav')?.setAttribute('id', 'bambu-native-menu');
    document.body.append(menuToggle);

    let visibilityQueued = false;
    const syncMenuVisibility = () => {
      menuToggle.hidden = header.classList.contains('bambu-floating-header')
        || nativeMenu.open
        || header.getBoundingClientRect().bottom > 1;
      visibilityQueued = false;
    };
    const requestMenuVisibility = () => {
      if (visibilityQueued) return;
      visibilityQueued = true;
      requestAnimationFrame(syncMenuVisibility);
    };
    addEventListener('scroll', requestMenuVisibility, {passive:true});
    addEventListener('resize', requestMenuVisibility, {passive:true});
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(requestMenuVisibility, {threshold:0}).observe(header);
    }
    requestMenuVisibility();

    let spacer = null;
    let savedScrollY = 0;
    const release = () => {
      if (!header.classList.contains('bambu-floating-header')) return;
      header.classList.remove('bambu-floating-header');
      root.classList.remove('bambu-floating-navigation-open');
      spacer?.remove();
      spacer = null;
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open site navigation');
      // Closing via the masthead's own X must return to the same reading position.
      scrollTo(0, savedScrollY);
      syncMenuVisibility();
      if (!menuToggle.hidden) menuToggle.focus({ preventScroll: true });
    };
    menuToggle.addEventListener('click', () => {
      if (header.classList.contains('bambu-floating-header')) {
        nativeMenu.open = false;
        release();
        return;
      }
      savedScrollY = scrollY;
      spacer = document.createElement('div');
      spacer.className = 'bambu-floating-header-spacer';
      spacer.style.height = header.getBoundingClientRect().height + 'px';
      header.before(spacer);
      header.classList.add('bambu-floating-header');
      root.classList.add('bambu-floating-navigation-open');
      nativeMenu.open = true;
      menuToggle.setAttribute('aria-expanded', 'true');
      menuToggle.setAttribute('aria-label', 'Close site navigation');
      nativeMenu.querySelector(':scope > summary')?.focus({ preventScroll: true });
    });
    nativeMenu.addEventListener('toggle', () => {
      if (!nativeMenu.open) release();
      requestMenuVisibility();
    });
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || !header.classList.contains('bambu-floating-header')) return;
      event.preventDefault();
      nativeMenu.open = false;
      release();
    });
    nativeMenu.querySelector(':scope > nav')?.addEventListener('click', event => {
      if (event.target === event.currentTarget && header.classList.contains('bambu-floating-header')) {
        nativeMenu.open = false;
        release();
      }
    });
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
