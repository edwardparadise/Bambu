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
    const subject = 'BAMBU project enquiry' + (get('location') ? ' – ' + get('location') : '');
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
    window.location.href = 'mailto:ed@bambuinteriors.co.uk?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  });
  const copyButton = document.getElementById('copy-enquiry');
  const help = document.getElementById('enquiry-help');
  if (copyButton) copyButton.addEventListener('click', async () => {
    if (!enquiry.reportValidity()) return;
    const { subject, body } = enquiryDetails();
    const message = 'To: ed@bambuinteriors.co.uk\nSubject: ' + subject + '\n\n' + body;
    try {
      await navigator.clipboard.writeText(message);
      if (help) help.textContent = 'Enquiry details copied. Paste them into an email to ed@bambuinteriors.co.uk and send it yourself.';
    } catch {
      if (help) help.textContent = 'Copy was unavailable in this browser. Please email ed@bambuinteriors.co.uk directly.';
    }
  });
}

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
  link.setAttribute('aria-label', 'Expertise: explore our approach and services');
});
document.querySelectorAll('.nav-submenu a[href="material-innovation.html"], .mobile-expertise a[href="material-innovation.html"]').forEach(link => {
  link.textContent = 'Materials & sustainability';
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


// Keyboard-accessible desktop expertise flyout, without changing the link destination.
document.querySelectorAll('.desktop-nav .nav-dropdown').forEach(dropdown => {
  const trigger = dropdown.querySelector(':scope > a');
  const panel = dropdown.querySelector('.nav-submenu');
  if (!trigger || !panel) return;
  const close = () => {
    dropdown.classList.remove('keyboard-open');
    trigger.setAttribute('aria-expanded', 'false');
  };
  trigger.setAttribute('aria-haspopup', 'true');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      dropdown.classList.add('keyboard-open');
      trigger.setAttribute('aria-expanded', 'true');
      panel.querySelector('a')?.focus();
    } else if (event.key === 'Escape') close();
  });
  dropdown.addEventListener('focusout', event => {
    if (!dropdown.contains(event.relatedTarget)) close();
  });
  dropdown.addEventListener('keydown', event => {
    if (event.key === 'Escape') { close(); trigger.focus(); }
  });
  dropdown.addEventListener('pointerenter', () => trigger.setAttribute('aria-expanded', 'true'));
  dropdown.addEventListener('pointerleave', close);
});

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
