'use strict';

// Close the mobile menu after selecting a destination or tapping outside it.
const mobileNav = document.querySelector('.mobile-nav');
if (mobileNav) {
  const summary = mobileNav.querySelector('summary');
  const syncMenuLabel = () => {
    if (!summary) return;
    summary.setAttribute('aria-label', mobileNav.open ? 'Close menu' : 'Open menu');
    summary.setAttribute('aria-expanded', String(mobileNav.open));
  };
  mobileNav.addEventListener('toggle', () => {
    syncMenuLabel();
    if (mobileNav.open) mobileNav.querySelector('nav a')?.focus({ preventScroll:true });
  });
  mobileNav.addEventListener('keydown', event => {
    if (!mobileNav.open || event.key !== 'Tab') return;
    const focusable = [...mobileNav.querySelectorAll('summary, a[href], button:not([disabled])')]
      .filter(element => element.getClientRects().length);
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  });
  mobileNav.querySelectorAll('nav a').forEach(link => link.addEventListener('click', () => { mobileNav.open = false; }));
  document.addEventListener('pointerdown', event => { if (mobileNav.open && !mobileNav.contains(event.target)) mobileNav.open = false; });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && mobileNav.open) { mobileNav.open = false; summary?.focus(); } });
  window.addEventListener('resize', () => {
    if (window.matchMedia('(min-width: 951px)').matches && mobileNav.open) mobileNav.open = false;
  }, { passive: true });
  syncMenuLabel();
}

// Compose a project enquiry locally. No backend, tracking or form submission.
const enquiry = document.getElementById('project-enquiry');
if (enquiry) {
  // Audience CTAs may preselect a project category, but never transmit form data.
  const projectType = new URLSearchParams(location.search).get('type');
  const typeSelect = enquiry.querySelector('select[name="type"]');
  if (projectType && typeSelect && Array.from(typeSelect.options).some(option => option.value === projectType)) {
    typeSelect.value = projectType;
  }
  const enquiryDetails = () => {
    const values = new FormData(enquiry);
    const get = key => String(values.get(key) || '').trim();
    const subject = 'BAMBU project enquiry' + (get('location') ? ': ' + get('location') : '');
    const body = [
      'Hello BAMBU,', '', 'I would like to discuss a project.', '',
      'Name: ' + get('name'), 'Email: ' + get('email'),
      'Project type: ' + (get('type') || 'To be discussed'),
      'Location: ' + (get('location') || 'To be confirmed'),
      'Approximate floor area: ' + (get('area') || 'To be confirmed'),
      'Target programme: ' + (get('programme') || 'To be discussed'),
      'Indicative budget: ' + (get('budget') || 'Not yet established'),
      'Project stage: ' + (get('stage') || 'To be discussed'), '',
      'Project brief:', get('brief') || 'To be discussed', '', 'Kind regards,', get('name')
    ].join('\n');
    return { subject, body };
  };
  enquiry.addEventListener('submit', event => {
    event.preventDefault();
    if (!enquiry.reportValidity()) return;
    const { subject, body } = enquiryDetails();
    window.location.href = 'mailto:ed@bambuinteriors.co.uk,joe@bambuinteriors.co.uk?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  });
  const copyButton = document.getElementById('copy-enquiry');
  const help = document.getElementById('enquiry-help');
  if (copyButton) copyButton.addEventListener('click', async () => {
    if (!enquiry.reportValidity()) return;
    const { subject, body } = enquiryDetails();
    const message = 'To: ed@bambuinteriors.co.uk, joe@bambuinteriors.co.uk\nSubject: ' + subject + '\n\n' + body;
    try {
      await navigator.clipboard.writeText(message);
      if (help) help.textContent = 'Enquiry details copied. Paste them into an email to ed@bambuinteriors.co.uk and joe@bambuinteriors.co.uk and send it yourself.';
    } catch {
      if (help) help.textContent = 'Copy was unavailable in this browser. Please email ed@bambuinteriors.co.uk and joe@bambuinteriors.co.uk directly.';
    }
  });
}

// A focused primary journey: service, experience, people and contact.
// Journal stays accessible from the footer. Materials Lab is deliberately held
// back until documented, licensed manufacturer installation imagery is secured.
(() => {
  document.querySelectorAll(
    'header .desktop-nav > a[href="journal.html"], header .desktop-nav > a[href="materials-lab.html"], ' +
    'header .mobile-nav > nav > a[href="journal.html"], header .mobile-nav > nav > a[href="materials-lab.html"]'
  ).forEach(link => link.remove());
  document.querySelectorAll('.desktop-nav .nav-dropdown > a[href="approach.html"]').forEach(link => {
    link.textContent = 'What we do';
    link.setAttribute('aria-label', 'What we do: services, sectors and our approach');
  });
  document.querySelectorAll('.mobile-nav .mobile-expertise > summary').forEach(summary => {
    for (const node of summary.childNodes) {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.includes('Expertise')) {
        node.textContent = node.textContent.replace('Expertise', 'What we do');
      }
    }
  });
  document.querySelectorAll('.site-footer a[href="materials-lab.html"]').forEach(link => link.remove());
})();

// Keep the copyright year current without relying on a server.
document.querySelectorAll('[data-year]').forEach(node => { node.textContent = String(new Date().getFullYear()); });

const pageName = location.pathname.split('/').filter(Boolean).pop() || 'index';
const pageSlug = pageName.replace(/\.html$/, '');
document.querySelectorAll('header nav a[href]').forEach(link => {
  const slug = link.getAttribute('href').replace(/\.html$/, '');
  if (slug === pageSlug) link.setAttribute('aria-current', 'page');
  else if (slug === 'journal' && pageSlug.startsWith('journal-')) link.setAttribute('aria-current', 'location');
});

// Keep the shared navigation consistent on every specialist and editorial page.
// Expertise leads to the overall approach, not the occupier-only landing page.
document.querySelectorAll('.desktop-nav .nav-dropdown > a').forEach(link => {
  link.href = 'approach.html';
  link.setAttribute('aria-label', 'What we do: services, sectors and our approach');
});
document.querySelectorAll('.nav-submenu a[href="material-innovation.html"], .mobile-expertise a[href="material-innovation.html"]').forEach(link => {
  const label = link.querySelector('span');
  if (label) label.textContent = 'Materials & specification';
  else link.textContent = 'Materials & specification';
});
document.querySelectorAll('.site-footer a').forEach(link => {
  if (link.textContent.trim() === 'Expertise') link.href = 'approach.html';
});

// Mark the group as the current section on the specialist pages, without
// misrepresenting its overview link as the current individual document.
const expertiseRoutes = new Set([
  'approach', 'tenants', 'landlords', 'operators', 'material-innovation',
  'delivery-network', 'commercial-fit-out', 'construction-management',
  'workplace-design', 'office-relocation', 'office-refurbishment',
  'landlord-refurbishment', 'flexible-workspace', 'furniture-ff-e',
  'av-technology', 'maintenance-aftercare', 'licence-to-alter',
  'feasibility', 'project-budgeting', 'project-programme'
]);
if (expertiseRoutes.has(pageSlug)) {
  document.querySelectorAll('.desktop-nav .nav-dropdown > a').forEach(link => {
    if (pageSlug !== 'approach') link.setAttribute('aria-current', 'location');
  });
  document.querySelectorAll('.mobile-expertise > summary').forEach(summary => {
    summary.classList.add('is-current');
  });
}

// Measure the actual header rather than assuming a fixed phone or tablet height.
const siteHeader = document.querySelector('body > header');
if (siteHeader && mobileNav) {
  const syncHeaderHeight = () => {
    const bottom = Math.max(0, Math.round(siteHeader.getBoundingClientRect().bottom));
    document.documentElement.style.setProperty('--bambu-menu-top', bottom + 'px');
  };
  syncHeaderHeight();
  window.addEventListener('resize', syncHeaderHeight, { passive:true });
  mobileNav.addEventListener('toggle', syncHeaderHeight);
}


// A sticky header should never obscure the destination of an in-page link.
const focusHashTarget = () => {
  if (!location.hash) return;
  const id = decodeURIComponent(location.hash.slice(1));
  const target = document.getElementById(id);
  if (target && !target.hasAttribute('tabindex') && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(target.tagName)) {
    target.setAttribute('tabindex', '-1');
  }
};
window.addEventListener('hashchange', focusHashTarget);
focusHashTarget();

// Native lazy loading is supported in current browsers. Ensure imagery below
// the opening viewport is not fetched eagerly when markup lacks an explicit hint.
document.querySelectorAll('main img:not([loading])').forEach(img => {
  const top = img.getBoundingClientRect().top;
  if (top > window.innerHeight * 1.5) img.loading = 'lazy';
  img.decoding = 'async';
});

// Remove purely decorative mobile page indexes from the DOM and screenreader order.
document.querySelectorAll('.mobile-nav > nav > a > small, .mobile-nav .mobile-expertise > summary > small').forEach(index => index.remove());
document.querySelectorAll('.mobile-nav .mobile-expertise > summary > span').forEach(icon => icon.setAttribute('aria-hidden','true'));

// R2: consistent workspace operator language throughout shared navigation.
document.querySelectorAll('a[href="operators.html"]').forEach(link=>{const text=link.textContent.trim();if(text==='Flexible workspace'||text==='For operators'||text==='Operators')link.textContent='Workspace operators'});


// BAMBU analytics: explicit UK visitor consent before loading Google Analytics 4.
// GA4 is never requested until the visitor actively accepts optional analytics.
(() => {
  const key = 'bambu-analytics-consent-v1';
  const measurementId = 'G-KR7H49KVEQ';
  let banner = null;
  let loaded = false;

  function preference() {
    try { return window.localStorage.getItem(key); } catch (_) { return null; }
  }
  function remember(value) {
    try { window.localStorage.setItem(key, value); } catch (_) {}
  }
  function enableAnalytics() {
    if (loaded || document.querySelector('script[data-bambu-analytics]')) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', measurementId, { send_page_view: true });
    const script = document.createElement('script');
    script.async = true;
    script.dataset.bambuAnalytics = 'true';
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
    document.head.appendChild(script);
  }
  function closeBanner() {
    if (banner) banner.remove();
    banner = null;
  }
  function choose(value) {
    const previous = preference();
    remember(value);
    closeBanner();
    if (value === 'accepted') enableAnalytics();
    // Reload to stop the previously loaded tracking library on withdrawal.
    if (value === 'rejected' && (previous === 'accepted' || loaded)) window.location.reload();
  }
  function showChoices() {
    if (banner) return;
    banner = document.createElement('section');
    banner.className = 'bambu-analytics-consent';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Optional analytics cookies');
    banner.innerHTML = '<div class="bambu-consent-copy"><strong>Help us improve BAMBU.</strong>' +
      '<p>We use optional Google Analytics cookies to understand visits to this website. ' +
      'You can accept or reject them. <a href="privacy.html">Privacy &amp; cookies</a>.</p></div>' +
      '<div class="bambu-consent-actions"><button type="button" data-consent="rejected">Reject optional</button>' +
      '<button type="button" data-consent="accepted">Accept analytics</button></div>';
    banner.addEventListener('click', event => {
      const button = event.target.closest('[data-consent]');
      if (button) choose(button.dataset.consent);
    });
    document.body.appendChild(banner);
  }
  function addFooterControl() {
    const foot = document.querySelector('.site-footer .footer-bottom');
    if (!foot || foot.querySelector('.bambu-cookie-settings')) return;
    const link = document.createElement('a');
    link.href = '#cookie-choices';
    link.className = 'bambu-cookie-settings';
    link.textContent = 'Cookie choices';
    link.addEventListener('click', event => {
      event.preventDefault();
      showChoices();
    });
    foot.appendChild(link);
  }
  function addStyle() {
    if (document.getElementById('bambu-consent-style')) return;
    const style = document.createElement('style');
    style.id = 'bambu-consent-style';
    style.textContent = [
      '.bambu-analytics-consent{position:fixed;z-index:2147483640;bottom:18px;left:18px;right:18px;max-width:660px;margin:auto;background:#f5f3ee;color:#212124;border:1px solid #aaa39b;border-radius:14px;box-shadow:0 12px 44px #0004;padding:18px 20px;display:flex;gap:24px;align-items:center;justify-content:space-between;box-sizing:border-box;font:14px/1.5 system-ui,-apple-system,sans-serif}',
      '.bambu-analytics-consent strong{font-weight:700;letter-spacing:.01em}',
      '.bambu-analytics-consent p{margin:6px 0 0;max-width:385px}',
      '.bambu-analytics-consent a{color:#194d81;text-decoration:underline}',
      '.bambu-consent-actions{display:flex;gap:7px;flex-direction:column;flex-shrink:0}',
      '.bambu-consent-actions button{cursor:pointer;border:1px solid #545254;border-radius:99px;background:transparent;color:#212124;padding:9px 14px;font:600 12px/1.3 system-ui,-apple-system,sans-serif;white-space:nowrap}',
      '.bambu-consent-actions button[data-consent="accepted"]{background:#255da2;color:white;border-color:#255da2}',
      '.bambu-consent-actions button:focus-visible,.bambu-analytics-consent a:focus-visible{outline:3px solid #ec9d54;outline-offset:2px}',
      '.site-footer .footer-bottom .bambu-cookie-settings{margin-left:12px}',
      '@media(max-width:600px){.bambu-analytics-consent{bottom:10px;left:10px;right:10px;display:block;padding:16px}.bambu-consent-actions{flex-direction:row;flex-wrap:wrap;margin-top:12px}.bambu-consent-actions button{flex:1}}'
    ].join('');
    document.head.appendChild(style);
  }
  function init() {
    addStyle();
    addFooterControl();
    const choice = preference();
    if (choice === 'accepted') enableAnalytics();
    else if (choice !== 'rejected') showChoices();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();


/* Sitewide compact footer invitation.
   Preserve educational page content. Consolidate only repeated sales CTAs
   so that visitors see one consistent next step, in the footer itself. */
(() => {
  const footer = document.querySelector('footer.site-footer');
  if (!footer || footer.querySelector('.bambu-footer-invite')) return;

  const onContact = /(?:^|\\/)contact(?:\\.html)?\\/?$/.test(window.location.pathname);
  const slug = (location.pathname.split('/').pop() || 'index').replace(/\\.html$/, '');
  const variations = {"index":["slate","START HERE / BAMBU","Let's make something","worth building.","If you're weighing up a building, a move or a refurbishment, we'd be happy to talk it through.","Start a conversation"],"about":["terracotta","ABOUT BAMBU / WHAT'S NEXT","Small by design.","Ready for the next brief.","From a small refresh to a complete fit-out, tell us what your space could become.","Talk to BAMBU"],"our-work":["steel","EXPERIENCE / YOUR PROJECT","Experience behind the work.","Ambition for what's next.","Tell us about your space, your goals and what good delivery would mean for you.","Discuss your project"],"tenants":["teal","FOR OCCUPIERS / LET'S TALK","Keep business moving.","We'll coordinate the fit-out.","Let's visit your space and discuss refurbishment or relocation.","Plan a workplace visit"],"landlords":["bronze","FOR PROPERTY OWNERS / THE NEXT LETTING","Make the next letting","count.","Explore test fits, targeted Cat A works and considered refurbishment.","Discuss your building"],"operators":["steel","FOR OPERATORS / THE NEXT WORKSPACE","A viable operating model.","A credible delivery plan.","Capacity, character and practical delivery for your next flexible workspace.","Discuss a potential site"],"approach":["terracotta","FROM IDEA TO DELIVERY","A clearer route","from idea to delivery.","From early feasibility to delivery, let's connect the decisions.","Start a conversation"],"contact":["teal","BAMBU / START HERE","Good projects start","with a conversation.","Tell us about your building, scope or programme. A short discussion is enough.","Email BAMBU"],"commercial-fit-out":["terracotta","FIT-OUT / NEXT STEPS","From the first brief","to the final detail.","Discuss Cat A, Cat B, refurbishment or technically demanding interior works.","Discuss your fit-out"],"workplace-design":["teal","DESIGN / BRING THE BRIEF","A considered design.","A workplace that works.","Let's explore the people, floorplate and priorities behind your brief.","Discuss workplace design"],"construction-management":["steel","DELIVERY / ONE TEAM","Many moving parts.","One coordinated plan.","Discuss the site, scope and programme and how specialists can work together.","Discuss the build"],"furniture-ff-e":["sage","FURNITURE / FINISHING TOUCHES","Character in the details.","Confidence in delivery.","Explore furniture, finishes and lead times within the wider fit-out.","Discuss FF&E"],"av-technology":["steel","TECHNOLOGY / WORKING DAY","Technology that works.","From day one.","Bring AV, data and meeting-room requirements into the design conversation.","Discuss technology"],"maintenance-aftercare":["sage","AFTERCARE / LONG TERM","Built for today.","Supported for tomorrow.","Tell us about the ongoing care or changes your space needs.","Discuss aftercare"],"material-innovation":["bronze","MATERIALS / BETTER CHOICES","Thoughtful specification.","Built to last.","Explore appropriate materials and technical products for your project.","Discuss materials"],"delivery-network":["steel","DELIVERY NETWORK / NEXT STEPS","The right specialists.","Working as one team.","Discuss the expertise your building and programme need.","Start a conversation"],"feasibility":["bronze","FEASIBILITY / FIRST CONVERSATION","Before you commit,","explore what's possible.","A quick review of the building and brief can reveal better options.","Discuss feasibility"],"licence-to-alter":["terracotta","APPROVALS / START EARLY","Plan the approvals.","Protect the programme.","Talk through landlord requirements and technical submissions.","Discuss approvals"],"project-budgeting":["bronze","BUDGET / COMMERCIAL CLARITY","Better decisions","start with a clear budget.","Let's discuss scope and the assumptions that affect the costs.","Discuss your budget"],"journal":["terracotta","IDEAS / INTO PRACTICE","An idea worth exploring?","Let's bring it to life.","Share the brief, building or question you're working through.","Start a conversation"]};
  const closing = document.querySelector('main .relaunch-final, main .about-outro, main .exp-next, main .approach-outro, main .operator-last-word, main .about-end, main .end-cta');
  const page = variations[slug];
  footer.dataset.bambuTone = page?.[0] || 'slate';
  const invitation = document.createElement('div');
  invitation.className = 'bambu-footer-invite';
  invitation.setAttribute('aria-labelledby', 'bambu-footer-invite-title');
  invitation.innerHTML = '<div class="bambu-footer-invite__inner wrap"><div class="bambu-footer-invite__headline"><p class="bambu-footer-invite__kicker"></p><h2 id="bambu-footer-invite-title"><span class="bambu-footer-invite__first"></span><span class="bambu-footer-invite__accent"></span></h2><p class="bambu-footer-invite__description"></p></div><div class="bambu-footer-invite__actions"><a class="bambu-footer-invite__cta"><span></span><span aria-hidden="true">↗</span></a><a class="bambu-footer-invite__email" href="mailto:ed@bambuinteriors.co.uk">ed@bambuinteriors.co.uk</a></div></div>';
  invitation.querySelector('.bambu-footer-invite__kicker').textContent = page?.[1] || closing?.querySelector('.kicker')?.textContent.trim() || 'BAMBU / START A CONVERSATION';
  invitation.querySelector('.bambu-footer-invite__first').textContent = page?.[2] || closing?.querySelector('h2')?.textContent.trim() || "Let's make something worth building.";
  const accent = invitation.querySelector('.bambu-footer-invite__accent');
  accent.textContent = page?.[3] || '';
  if (!accent.textContent) accent.hidden = true;
  invitation.querySelector('.bambu-footer-invite__description').textContent = page?.[4] || closing?.querySelector('p:not(.kicker)')?.textContent.trim() || 'Tell us about your space and what you want to achieve.';
  const action = invitation.querySelector('.bambu-footer-invite__cta');
  action.href = onContact ? 'mailto:ed@bambuinteriors.co.uk?subject=BAMBU%20project%20discussion' : (closing?.querySelector('a.cta')?.getAttribute('href') || 'contact.html');
  action.firstElementChild.textContent = onContact ? 'Email BAMBU' : page?.[5] || closing?.querySelector('a.cta')?.textContent.trim() || 'Start a conversation';
  footer.insertBefore(invitation, footer.firstChild);

  // Remove only standalone, recurring contact panels. Leave project notes,
  // educational diagrams, resources and decision-making frameworks intact.
  const repeatSelectors = [
    'main .relaunch-final',
    'main .about-outro',
    'main .exp-next',
    'main .approach-outro',
    'main .operator-last-word',
    'main .about-end',
    'main .end-cta'
  ];
  document.querySelectorAll(repeatSelectors.join(',')).forEach(section => section.remove());
  document.querySelectorAll('main section.editorial-panel').forEach(section => {
    const title = (section.querySelector('h2,h3')?.textContent || '').trim();
    if (/^(discuss your brief|start a conversation|have a particular material in mind\?|discuss a project)$/i.test(title)) {
      section.remove();
    }
  });

  const footerColumns = footer.querySelector('.footer-top');
  if (footerColumns) {
    const last = footerColumns.lastElementChild;
    if (last?.querySelector('strong')?.textContent.trim().toLowerCase() === 'get in touch') {
      last.remove(); // The new invitation already provides contact and email.
    }
    footerColumns.querySelectorAll('a[href="index.html#design-reveal"]').forEach(link => {
      link.href = 'approach.html';
      link.textContent = 'How we work';
    });
  }
})();
