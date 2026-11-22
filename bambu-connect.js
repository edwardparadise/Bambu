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

  // Persistent access to the existing mobile navigation, even when the header
  // has scrolled away. The independent menu is generated from the actual
  // header links so the two navigations cannot drift out of sync.
  const headerMenu = header.querySelector('.mobile-nav > nav');
  if (headerMenu && !document.querySelector('.bambu-quick-menu-toggle')) {
    const menuToggle = document.createElement('button');
    menuToggle.type = 'button';
    menuToggle.className = 'bambu-quick-menu-toggle';
    menuToggle.setAttribute('aria-label', 'Open site navigation');
    menuToggle.setAttribute('aria-haspopup', 'dialog');
    menuToggle.setAttribute('aria-controls', 'bambu-quick-menu-dialog');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.innerHTML = '<span aria-hidden="true"><i></i><i></i><i></i></span>';
    document.body.append(menuToggle);

    const dialog = document.createElement('dialog');
    dialog.id = 'bambu-quick-menu-dialog';
    dialog.className = 'bambu-quick-menu-dialog';
    dialog.setAttribute('aria-labelledby', 'bambu-quick-menu-heading');

    const dialogHead = document.createElement('div');
    dialogHead.className = 'bambu-quick-menu-head';
    dialogHead.innerHTML = '<span id="bambu-quick-menu-heading">BAMBU <em>INTERIORS</em></span><button type="button" class="bambu-quick-menu-close" aria-label="Close navigation">×</button>';
    const menuCopy = headerMenu.cloneNode(true);
    menuCopy.className = 'bambu-quick-menu-nav';
    menuCopy.setAttribute('aria-label', 'Site navigation');
    // Skip the duplicated footer slogan: the modal is a compact navigation.
    menuCopy.querySelector('.mobile-nav-footer')?.remove();
    dialog.append(dialogHead, menuCopy);
    document.body.append(dialog);

    const closeMenu = () => { if (dialog.open) dialog.close(); };
    menuToggle.addEventListener('click', () => {
      const headerDetails = header.querySelector('.mobile-nav');
      if (headerDetails) headerDetails.open = false;
      dialog.showModal();
      document.documentElement.classList.add('bambu-quick-menu-open');
      menuToggle.setAttribute('aria-expanded', 'true');
      menuToggle.setAttribute('aria-label', 'Close site navigation');
      dialog.querySelector('.bambu-quick-menu-close')?.focus({preventScroll:true});
    });
    dialog.querySelector('.bambu-quick-menu-close')?.addEventListener('click', closeMenu);
    dialog.addEventListener('click', event => {
      if (event.target === dialog) closeMenu();
    });
    dialog.addEventListener('close', () => {
      document.documentElement.classList.remove('bambu-quick-menu-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open site navigation');
      menuToggle.focus({preventScroll:true});
    });
    menuCopy.querySelectorAll('a[href]').forEach(link => link.addEventListener('click', closeMenu));
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
