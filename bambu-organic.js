'use strict';
/* BAMBU / organic edge detailing.
   Keep the architectural sketches clear: folded forms live only at panel
   edges, never as ribbons over drawings or text. */
(() => {
  const motifs = [
    ['main.bambu-home > .bambu-home-services', 'home-services'],
    ['main.bambu-services-page > .services-hero', 'services'],
    ['main.bambu-company-page > .bambu-company-hero', 'about'],
    ['main[data-study="contact"] > section.intro:first-of-type', 'contact']
  ];
  for (const [selector, name] of motifs) {
    const section = document.querySelector(selector);
    if (!section || section.querySelector(':scope > .bambu-organic-mark')) continue;
    const mark = document.createElement('span');
    mark.className = 'bambu-organic-mark bambu-organic-mark--' + name;
    mark.setAttribute('aria-hidden', 'true');
    section.append(mark);
  }
  document.querySelectorAll(
    'main.bambu-home .bambu-four-capabilities > a, main.bambu-services-page .bambu-four-capability-grid > a'
  ).forEach(card => {
    if (card.querySelector(':scope > .bambu-organic-card-detail')) return;
    const edge = document.createElement('span');
    edge.className = 'bambu-organic-card-detail';
    edge.setAttribute('aria-hidden', 'true');
    card.append(edge);
  });
})();
