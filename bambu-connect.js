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
  position.innerHTML = '<svg class="bambu-utility-icon" viewBox="0 0 32 32" width="32" height="32" aria-hidden="true" style="display:block;width:26px;height:26px;flex:none;pointer-events:none;overflow:visible" fill="none" stroke="#B89B68" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 26V6M7 15l9-9 9 9"/></svg>';
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
    const summary=nativeMenu.querySelector('summary');
    if(summary){
      const renderIcon=()=>{summary.innerHTML=nativeMenu.open?'<svg class="bambu-utility-icon" viewBox="0 0 32 32" width="32" height="32" aria-hidden="true" style="display:block;width:26px;height:26px;flex:none;pointer-events:none;overflow:visible" fill="none" stroke="#B89B68" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7l18 18M25 7L7 25"/></svg>':'<svg class="bambu-utility-icon" viewBox="0 0 32 32" width="32" height="32" aria-hidden="true" style="display:block;width:26px;height:26px;flex:none;pointer-events:none;overflow:visible" fill="none" stroke="#B89B68" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8H27M5 16H27M5 24H27"/></svg>';summary.setAttribute('aria-label',nativeMenu.open?'Close menu':'Open menu');};
      renderIcon();nativeMenu.addEventListener('toggle',renderIcon);
    }

    let queued = false;
    let routeVisible = false;
    const update = () => {
      queued = false;
      root.classList.toggle('bambu-menu-docked', header.getBoundingClientRect().bottom <= -6);
      // On the connected-route diagrams the back-to-top button obscured the
      // final legend label; leave this space clear while the route is visible.
      position.hidden = scrollY < 260 || nativeMenu.open || routeVisible;
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
    const route=document.querySelector('.occupier-route,.approach-process');
    if(route && 'IntersectionObserver' in window){
      new IntersectionObserver(entries=>{
        routeVisible=entries.some(entry=>entry.isIntersecting);
        requestUpdate();
      },{threshold:0.03}).observe(route);
    }
  }

  // Dock the same arrow into the footer rather than cover legal links.
  // It stays a single accessible control and retains its back-to-top action.
  const footer = document.querySelector('footer.site-footer');
  const footerBottom = footer?.querySelector('.footer-bottom');
  if (footer && footerBottom && 'IntersectionObserver' in window) {
    // Reserve a consistent space so the page never jumps as the arrow docks.
    const slot = document.createElement('span');
    slot.className = 'bambu-footer-arrow-slot';
    slot.setAttribute('aria-hidden','true');
    footerBottom.appendChild(slot);
    let docked = false;
    const observer = new IntersectionObserver(entries => {
      const visible = entries[0]?.isIntersecting;
      if (visible === docked) return;
      docked = visible;
      if (visible) {
        slot.remove();
        footerBottom.appendChild(position);
        position.classList.add('is-in-footer');
      } else {
        document.body.appendChild(position);
        position.classList.remove('is-in-footer');
        footerBottom.appendChild(slot);
      }
    }, {threshold:0.01});
    observer.observe(footer);
  }
})();

/* One independent icon treatment, loaded by the shared utility script. */
(()=>{const style=document.createElement('style');style.textContent=`
html body > header .mobile-nav > summary > svg.bambu-utility-icon,html body .page-position > svg.bambu-utility-icon{display:block!important;visibility:visible!important;opacity:1!important;width:26px!important;height:26px!important;position:relative!important;inset:auto!important;transform:none!important;z-index:5!important;stroke:#B89B68!important;fill:none!important}
html body > header .mobile-nav > summary > svg.bambu-utility-icon path,html body .page-position > svg.bambu-utility-icon path{display:block!important;visibility:visible!important;opacity:1!important;stroke:#B89B68!important;fill:none!important;stroke-width:2!important}
html.bambu-menu-docked body > header .mobile-nav > summary,html body a.page-position:not([hidden]),html body footer.site-footer .footer-bottom a.page-position.is-in-footer:not([hidden]){display:grid!important;place-items:center!important;box-sizing:border-box!important;border:1px solid #B89B68!important;border-radius:27%!important;background:#202123!important;box-shadow:none!important;outline:none!important;padding:0!important}
html body a.page-position::before,html body a.page-position::after,html body > header .mobile-nav > summary::before,html body > header .mobile-nav > summary::after{content:none!important;display:none!important}
html body a.page-position:focus-visible,html body > header .mobile-nav > summary:focus-visible{outline:2px solid #00B9EB!important;outline-offset:3px!important}
`;document.head.append(style)})();
