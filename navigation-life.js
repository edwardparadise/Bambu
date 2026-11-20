'use strict';
(() => {
  const dropdown = document.querySelector('.desktop-nav .nav-dropdown');
  const button = dropdown?.querySelector('.expertise-toggle');
  const panel = dropdown?.querySelector('.nav-submenu');
  if (!button || !panel) return;
  const desktop = matchMedia('(min-width:951px)');
  const fine = matchMedia('(hover:hover) and (pointer:fine)');
  const links = [...panel.querySelectorAll('a')];
  let leaveTimer;
  let pinned = false;
  const show = open => {
    clearTimeout(leaveTimer);
    dropdown.classList.toggle('is-open', open && desktop.matches);
    button.setAttribute('aria-expanded', String(open && desktop.matches));
    panel.inert = !open || !desktop.matches;
  };
  const close = () => { pinned = false; show(false); };
  show(false);
  button.addEventListener('click', () => {
    pinned = !pinned;
    show(pinned);
  });
  dropdown.addEventListener('pointerenter', event => {
    if (fine.matches && event.pointerType === 'mouse') show(true);
  });
  dropdown.addEventListener('pointerleave', () => {
    if (!pinned) leaveTimer = setTimeout(() => {
      if (!dropdown.contains(document.activeElement)) show(false);
    }, 180);
  });
  dropdown.addEventListener('keydown', event => {
    if (event.key === 'Escape') { close(); button.focus(); event.stopPropagation(); }
    if (event.key === 'ArrowDown' && !panel.contains(event.target)) {
      event.preventDefault(); show(true); links[0]?.focus();
    } else if (panel.contains(event.target) && ['ArrowDown','ArrowUp','Home','End'].includes(event.key)) {
      event.preventDefault();
      const index = links.indexOf(document.activeElement);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? links.length - 1 :
        (index + (event.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
      links[next]?.focus();
    }
  });
  dropdown.addEventListener('focusout', event => { if (!dropdown.contains(event.relatedTarget)) close(); });
  document.addEventListener('pointerdown', event => { if (!dropdown.contains(event.target)) close(); });
  desktop.addEventListener('change', close);
  links.forEach(link => link.addEventListener('click', close));
})();
