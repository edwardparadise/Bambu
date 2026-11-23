'use strict';
/* BAMBU organic visual language: vector decorations only.
   No text, controls, positioning or site-navigation logic is replaced. */
(() => {
  const motifs = [
    ['main.bambu-home > .relaunch-hero', 'hero'],
    ['main.bambu-home > .bambu-home-services', 'home-services'],
    ['main.bambu-services-page > .services-hero', 'services'],
    ['main.bambu-company-page > .bambu-company-hero', 'about'],
    ['main.approach-redesign > .approach-intro', 'approach'],
    ['main[data-study="contact"] > section.intro:first-of-type', 'contact'],
    ['main[data-study="contact"] > .bambu-contact-enquiry', 'enquiry'],
    ['main[data-study="working-with-bambu"] > .bambu-delivery-route', 'journey'],
    ['main.r2-tenants > .occupier-tech', 'technology'],
    ['main.r2-landlords > .bambu-landlord-services', 'landlord'],
    ['main.r2-operators > .operator-roadmap-section', 'operator'],
    ['main > section.intro.expertise-opening:first-of-type', 'expertise'],
    ['footer.site-footer > .bambu-footer-invite', 'footer']
  ];
  motifs.forEach(([selector, type]) => {
    const section = document.querySelector(selector);
    if (!section || section.querySelector(':scope > .bambu-organic-mark')) return;
    // Decorative graphics are off the accessibility tree and never intercept links.
    const mark = document.createElement('span');
    mark.className = 'bambu-organic-mark bambu-organic-mark--' + type;
    mark.setAttribute('aria-hidden', 'true');
    section.appendChild(mark);
  });
  document.querySelectorAll(
    'main.bambu-home .bambu-four-capabilities > a, main.bambu-services-page .bambu-four-capability-grid > a'
  ).forEach(card => {
    if (card.querySelector(':scope > .bambu-organic-card-detail')) return;
    const detail = document.createElement('span');
    detail.className = 'bambu-organic-card-detail';
    detail.setAttribute('aria-hidden', 'true');
    card.appendChild(detail);
  });
})();
