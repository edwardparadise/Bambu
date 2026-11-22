'use strict';
/* One gallery per vertical case study. Only real project photos should replace
   the labelled slots. Expanders work with both touch and keyboard. */
(() => {
  const cases = [...document.querySelectorAll('.bambu-case-study')];
  const setOpen = (entry, open) => {
    const button = entry.querySelector('[data-bambu-case-toggle]');
    const gallery = entry.querySelector('.bambu-case-study__gallery');
    if (!button || !gallery) return;
    gallery.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
    button.firstChild.textContent = open ? 'Close project gallery ' : 'View project gallery ';
    if (open) dispatchEvent(new Event('resize'));
  };
  for (const entry of cases) {
    const button = entry.querySelector('[data-bambu-case-toggle]');
    if (!button) continue;
    button.addEventListener('click', () => {
      const opening = button.getAttribute('aria-expanded') !== 'true';
      for (const item of cases) if (item !== entry) setOpen(item, false);
      setOpen(entry, opening);
    });
  }
  const openFromHash = () => {
    const id = decodeURIComponent(location.hash.slice(1));
    const entry = cases.find(item => item.id === id);
    if (entry) {
      for (const item of cases) if (item !== entry) setOpen(item, false);
      setOpen(entry, true);
    }
  };
  addEventListener('hashchange', openFromHash);
  openFromHash();
})();