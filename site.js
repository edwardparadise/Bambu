'use strict';

// Responsive styles and sliders are linked in the HTML head to avoid late reflow.

// One master wordmark everywhere: masthead, footer and supporting brand boards.
document.querySelectorAll('header img.unified-wordmark').forEach(img=>{
  img.src='assets/brand/bambu-a1-primary.svg?v=20261125rounded';
  img.width=540; img.height=155;
  img.alt='';
});
document.querySelectorAll('.site-footer .footer-brand img').forEach(img=>{
  img.src='assets/brand/bambu-a1-primary.svg?v=20261125rounded';
  img.width=540; img.height=155;
  img.alt='BAMBU Interiors';
});


// BAMBU navigation v3: identical information architecture across every page.
// Built before event handlers attach, so all groups work on touch and keyboard.
(() => {
  const desktop=document.querySelector('header .desktop-nav');
  const mobile=document.querySelector('header .mobile-nav > nav');
  if(!desktop || !mobile) return;
  const groups=[
    {id:'clients',name:'Who we work with',intro:'A more considered response to every property and brief.',links:[
      ['Occupiers','tenants','Workplaces built around people.','practice-scope.svg'],
      ['Workspace Operators','operators','Flexible office spaces that work commercially.','operator-capacity.svg'],
      ['Landlords & Agents','landlords','Refurbishment that supports the letting.','operator-landlord-meeting.svg']]},
    {id:'services',name:'Our services',intro:'Six connected capabilities, from first brief through to handover.',links:[
      ['Strategy & Design','workplace-design','Briefs, test fits and technical design.','practice-scope.svg'],
      ['Commercial Fit-Out','commercial-fit-out','New workplaces and upgrades to existing offices.','delivery-trades.svg'],
      ['Construction Management','construction-management','Commercial control and accountable coordination.','practice-coordinate.svg'],
      ['Furniture & Finishes','furniture-ff-e','Workstations, breakout furniture and FF&E.','practice-scope.svg'],
      ['AV & Technology','av-technology','Connected meeting rooms and integrated systems.','tech-network-av.svg'],
      ['Aftercare','maintenance-aftercare','Support beyond practical completion.','practice-specialists.svg']]},
    {id:'approach',name:'How we work',intro:'Understand the brief, make the decisions, deliver the detail.',links:[
      ['Our Approach','approach','Five connected stages from brief to handover.','practice-coordinate.svg'],
      ['Materials & Specification','material-innovation','Character, performance and product evidence.','tech-environment.svg'],
      ['Delivery Network','delivery-network','The right specialist team for the project.','practice-specialists.svg']]},
    {id:'about',name:'About us',intro:'The thinking, experience and people behind the work.',links:[
      ['About the Studio','about','The people, thinking and experience behind BAMBU.','delivery-accountability.svg']]}
  ];
  // Editorial text navigation: no decorative image tiles or faux-thumbnail boxes.
  const link=(entry)=>'<a class="bambu-nav-link" href="'+entry[1]+'"><span class="bambu-nav-link__copy"><strong>'+entry[0]+'</strong><small>'+entry[2]+'</small></span><span class="bambu-nav-link__arrow" aria-hidden="true">↗</span></a>';
  desktop.innerHTML=groups.map(group=>
    '<div class="nav-dropdown bambu-nav-group" data-nav-group="'+group.id+'">'+
    '<button class="nav-group-toggle" type="button" aria-expanded="false" aria-controls="bambu-menu-'+group.id+'">'+
    group.name+' <span aria-hidden="true">⌄</span></button>'+
    '<div class="nav-submenu bambu-nav-panel" id="bambu-menu-'+group.id+'" aria-label="'+group.name+'">'+
    '<div class="bambu-nav-panel__intro"><p class="kicker">BAMBU / '+group.name+'</p><strong>'+group.intro+'</strong></div>'+
    '<div class="bambu-nav-panel__links">'+group.links.map(link).join('')+'</div>'+
    (group.id==='services'?'<a class="bambu-nav-view-all" href="services">Explore all capabilities <span aria-hidden="true">↗</span></a>':'')+
    '</div></div>').join('')+

    '<a class="bambu-nav-cases" href="case-studies">Our experience <span aria-hidden="true">↗</span></a>'+
    '<a class="bambu-nav-cases bambu-nav-journal" href="/journal">Journal <span aria-hidden="true">↗</span></a>'+
    '<a class="nav-contact" href="contact">Get in touch <span aria-hidden="true">↗</span></a>';
  mobile.innerHTML='<span class="mobile-nav-kicker">BAMBU / EXPLORE</span>'+
    groups.map((group,i)=>'<details class="mobile-expertise" data-nav-group="'+group.id+'">'+
    '<summary>'+group.name+' <span aria-hidden="true">+</span></summary><div>'+
    (group.id==='services'?'<a href="services">Explore all services</a>':'')+
    group.links.map(entry=>'<a href="'+entry[1]+'">'+entry[0]+'</a>').join('')+
    '</div></details>').join('')+

    '<a class="bambu-mobile-cases" href="case-studies">Our experience <span aria-hidden="true">↗</span></a>'+
    '<a class="bambu-mobile-cases bambu-mobile-journal" href="/journal">Journal <span aria-hidden="true">↗</span></a>'+
    '<a class="bambu-mobile-contact" href="contact">Get in touch <span aria-hidden="true">↗</span></a>'+
    '<span class="mobile-nav-footer">GOOD SPACES START WITH A CONVERSATION.</span>';

  const dropdowns=[...desktop.querySelectorAll('.bambu-nav-group')];
  const isDesktop=matchMedia('(min-width:951px)');
  let closeTimer=0;
  let pinnedGroup=null;
  const closeAll=(except=null)=>{
    dropdowns.forEach(group=>{
      if(group===except)return;
      group.classList.remove('is-open');
      const button=group.querySelector('.nav-group-toggle');
      const panel=group.querySelector('.bambu-nav-panel');
      button?.setAttribute('aria-expanded','false');
      if(panel)panel.inert=true;
    });
  };
  const show=group=>{
    if(!isDesktop.matches)return;
    clearTimeout(closeTimer);
    closeAll(group);
    group.classList.add('is-open');
    group.querySelector('.nav-group-toggle')?.setAttribute('aria-expanded','true');
    const panel=group.querySelector('.bambu-nav-panel');
    if(panel)panel.inert=false;
  };
  closeAll();
  dropdowns.forEach(group=>{
    const toggle=group.querySelector('.nav-group-toggle');
    const panel=group.querySelector('.bambu-nav-panel');
    const links=[...panel.querySelectorAll('a')];
    toggle.addEventListener('click',()=>{
      if(pinnedGroup===group){pinnedGroup=null;closeAll();}
      else{pinnedGroup=group;show(group);}
    });
    group.addEventListener('pointerover',event=>{
      if(event.pointerType==='mouse' && pinnedGroup!==group){pinnedGroup=null;show(group);}
    });
    group.addEventListener('pointerleave',()=>{
      if(pinnedGroup!==group)closeTimer=setTimeout(()=>{
        if(!group.contains(document.activeElement))closeAll();
      },220);
    });
    group.addEventListener('focusout',event=>{
      if(!group.contains(event.relatedTarget) && pinnedGroup!==group)closeTimer=setTimeout(()=>closeAll(),160);
    });
    group.addEventListener('keydown',event=>{
      if(event.key==='Escape'){
        pinnedGroup=null;closeAll();toggle.focus();event.stopPropagation();return;
      }
      if(event.key==='ArrowDown'&&!panel.contains(event.target)){
        event.preventDefault();show(group);links[0]?.focus();return;
      }
      if(panel.contains(event.target)&&['ArrowDown','ArrowUp','Home','End'].includes(event.key)){
        event.preventDefault();
        const i=links.indexOf(document.activeElement);
        const next=event.key==='Home'?0:event.key==='End'?links.length-1:
          (i+(event.key==='ArrowDown'?1:-1)+links.length)%links.length;
        links[next]?.focus();
      }
    });
    links.forEach(link=>link.addEventListener('click',()=>{pinnedGroup=null;closeAll();}));
  });
  document.addEventListener('pointerdown',event=>{
    if(!desktop.contains(event.target)){pinnedGroup=null;closeAll();}
  });
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'){pinnedGroup=null;closeAll();}
  });
  isDesktop.addEventListener('change',()=>{pinnedGroup=null;closeAll();});

  document.documentElement.classList.add('bambu-navigation-ready');
})();


// Close the mobile menu after selecting a destination or tapping outside it.
const mobileNav = document.querySelector('.mobile-nav');
if (mobileNav) {
  const summary = mobileNav.querySelector('summary');
  const syncMenuLabel = () => {
    if (!summary) return;
    summary.setAttribute('aria-label', mobileNav.open ? 'Close menu' : 'Open menu');
    summary.setAttribute('aria-expanded', String(mobileNav.open));
  };
  // Do not draw the keyboard focus ring around Home after an ordinary touch.
  // Only move focus into the menu when it was opened with a keyboard.
  let openedWithKeyboard = false;
  summary?.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') openedWithKeyboard = true;
  });
  summary?.addEventListener('pointerdown', () => { openedWithKeyboard = false; });
  mobileNav.addEventListener('toggle', () => {
    syncMenuLabel();
    if (mobileNav.open && openedWithKeyboard) {
      mobileNav.querySelector('nav a')?.focus({ preventScroll: true });
    }
    openedWithKeyboard = false;
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
  // Do not close the mobile details menu before cross-page navigation.
  // Closing it while Safari is still displaying the old page causes a jump
  // towards the summary control before the next document appears.
  mobileNav.querySelectorAll('nav a[href]').forEach(link => link.addEventListener('click', () => {
    const next = new URL(link.href, location.href);
    const current = new URL(location.href);
    if (next.pathname === current.pathname && next.search === current.search && next.hash) mobileNav.open = false;
  }));
  addEventListener('pagehide', () => { mobileNav.open = false; });
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
  try{const notes=sessionStorage.getItem('bambu-planning-enquiry');if(notes){const brief=enquiry.querySelector('textarea[name="brief"]');if(brief&&!brief.value)brief.value=notes;sessionStorage.removeItem('bambu-planning-enquiry');}}catch(_){}
  const typeSelect = enquiry.querySelector('select[name="type"]');
  if (projectType && typeSelect && Array.from(typeSelect.options).some(option => option.value === projectType)) {
    typeSelect.value = projectType;
    if(projectType)typeSelect.closest('details')?.setAttribute('open','');
  }
  const choices=[...enquiry.querySelectorAll('[data-project-choice]')];
  const syncChoices=()=>choices.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.projectChoice===typeSelect?.value)));
  choices.forEach(b=>b.addEventListener('click',()=>{if(typeSelect){typeSelect.value=typeSelect.value===b.dataset.projectChoice?'':b.dataset.projectChoice;syncChoices();}}));
  typeSelect?.addEventListener('change',syncChoices);syncChoices();
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
    window.location.href = 'mailto:ed@bambuinteriors.co.uk?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  });
  const copyButton = document.getElementById('copy-enquiry');
  const help = document.getElementById('enquiry-help');
  if (copyButton) copyButton.addEventListener('click', async () => {
    if (!enquiry.reportValidity()) return;
    const { subject, body } = enquiryDetails();
    const message = 'Subject: ' + subject + '\n\n' + body;
    try {
      await navigator.clipboard.writeText(message);
      if (help) help.textContent = 'Enquiry summary copied.';
    } catch {
      if (help) help.textContent = 'Copy was unavailable. Use Prepare your enquiry instead.';
    }
  });
}

// Retain useful legacy footer links without reintroducing a second Experience menu.
(() => {
  // The unpublished Materials Lab is not a public navigation destination.
  document.querySelectorAll('.site-footer a[href="materials-lab"]').forEach(link=>link.remove());
  document.querySelectorAll('.site-footer a[href="approach"]').forEach(link=>{
    if(link.textContent.trim()==='Expertise')link.textContent='How we work';
  });
})();

// Keep the copyright year current without relying on a server.
document.querySelectorAll('[data-year]').forEach(node => { node.textContent = String(new Date().getFullYear()); });

// Legal trading disclosure: retain the registered name until the name change is effective.
document.querySelectorAll('.site-footer .footer-bottom').forEach(footer => {
  if (footer.querySelector('.bambu-company-registration')) return;
  const copyright = footer.querySelector('[data-year]')?.parentElement;
  const legal = document.createElement('small');
  legal.className = 'bambu-company-registration';
  legal.textContent = 'BAMBU Interiors is a trading name of The Paradise Projects Ltd. Company no. 14007611.';
  legal.style.cssText = 'display:block;margin-top:.4rem;font-size:.8rem;line-height:1.5;overflow-wrap:anywhere';
  if (copyright) copyright.append(legal); else footer.prepend(legal);
});

const pageName = location.pathname.split('/').filter(Boolean).pop() || 'index';
const pageSlug = pageName.replace(/\.html$/, '');
document.querySelectorAll('header nav a[href]').forEach(link => {
  const slug = new URL(link.href).pathname.replace(/^\/|\.html$/g, '') || 'index';
  if (slug === pageSlug) link.setAttribute('aria-current', 'page');
  else if (slug === 'journal' && pageSlug.startsWith('journal-')) { link.setAttribute('aria-current', 'location'); link.classList.add('is-current'); }
});

// Highlight the relevant navigation family, without making the parent a false link.
const routeGroups={
  clients:['tenants','landlords','operators','flexible-workspace','office-relocation'],
  services:['services','workplace-design','commercial-fit-out','landlord-refurbishment','office-refurbishment','construction-management','furniture-ff-e','av-technology','maintenance-aftercare'],
  approach:['approach','material-innovation','delivery-network','feasibility','licence-to-alter','project-budgeting','project-programme','space-brief','fit-out-guide'],
  about:['about']
};
Object.entries(routeGroups).forEach(([group,pages])=>{
  if(!pages.includes(pageSlug))return;
  document.querySelectorAll('[data-nav-group="'+group+'"] > .nav-group-toggle').forEach(button=>button.classList.add('is-current'));
  document.querySelectorAll('.mobile-expertise[data-nav-group="'+group+'"] > summary').forEach(summary=>summary.classList.add('is-current'));
});

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
document.querySelectorAll('a[href="operators"]').forEach(link=>{const text=link.textContent.trim();if(text==='Flexible workspace'||text==='For operators'||text==='Operators')link.textContent='Workspace operators'});


// BAMBU navigation interaction refinement: clearer destinations and touch feedback.
(() => {
  const menu = document.querySelector('body > header .mobile-nav');
  if (!menu) return;
  const kicker = menu.querySelector('.mobile-nav-kicker');
  const footer = menu.querySelector('.mobile-nav-footer');
  if (kicker) kicker.textContent = 'EXPLORE BAMBU';
  if (footer) footer.textContent = 'GOOD SPACES START WITH A CONVERSATION.';

  menu.querySelectorAll('.mobile-expertise').forEach(group=>{
    const toggle=group.querySelector('summary');
    const glyph=toggle?.querySelector('span');
    const name=toggle?.textContent.trim().replace(/[+−]$/,'').trim()||'section';
    const sync=()=>{
      if(glyph)glyph.textContent=group.open?'−':'+';
      toggle?.setAttribute('aria-expanded',String(group.open));
      toggle?.setAttribute('aria-label',(group.open?'Collapse ':'Expand ')+name);
    };
    group.addEventListener('toggle',sync);
    sync();
  });

  // Immediate touch response; the existing aria-current marker persists on the destination page.
  const choices = [...menu.querySelectorAll('nav > a, .mobile-expertise > summary, .mobile-expertise > div a')];
  const clearPressed = () => choices.forEach(choice => choice.classList.remove('bambu-menu-pressed'));
  choices.forEach(choice => {
    choice.addEventListener('pointerdown', () => {
      clearPressed();
      choice.classList.add('bambu-menu-pressed');
    });
    choice.addEventListener('pointercancel', () => choice.classList.remove('bambu-menu-pressed'));
  });
  menu.addEventListener('toggle', () => { if (!menu.open) clearPressed(); });
})();

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
    banner.innerHTML = '<div class="bambu-consent-copy"><strong>Cookie choices</strong>' +
      '<p>Optional analytics help us improve the website. ' +
      '<a href="privacy">Privacy &amp; cookies</a>.</p></div>' +
      '<div class="bambu-consent-actions"><button type="button" data-consent="rejected">Reject optional</button>' +
      '<button type="button" data-consent="accepted">Accept analytics</button></div>';
    banner.addEventListener('click', event => {
      const button = event.target.closest('[data-consent]');
      if (button) choose(button.dataset.consent);
    });
    if (matchMedia('(max-width:600px)').matches) { const main=document.querySelector('main'); if(main) main.before(banner); else document.body.prepend(banner); } else document.body.appendChild(banner);
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
      '.bambu-analytics-consent{position:fixed;z-index:2147483640;bottom:14px;left:auto;right:14px;width:min(560px,calc(100% - 28px));max-width:none;margin:0;background:#f5f3ee;color:#212124;border:1px solid #b9b2a7;border-radius:8px;box-shadow:0 5px 22px #0003;padding:12px 14px;display:flex;gap:14px;align-items:center;justify-content:space-between;box-sizing:border-box;font:12px/1.4 system-ui,-apple-system,sans-serif}',
      '.bambu-analytics-consent strong{font-weight:700;letter-spacing:.01em}',
      '.bambu-analytics-consent p{margin:3px 0 0;max-width:290px}',
      '.bambu-analytics-consent a{color:#194d81;text-decoration:underline}',
      '.bambu-consent-actions{display:flex;gap:6px;flex-direction:row;flex-shrink:0}',
      '.bambu-consent-actions button{cursor:pointer;border:1px solid #545254;border-radius:99px;background:transparent;color:#212124;min-height:44px;padding:7px 10px;font:600 11px/1.3 system-ui,-apple-system,sans-serif;white-space:nowrap}',
      '.bambu-consent-actions button[data-consent="accepted"]{background:transparent;color:#212124;border-color:#545254}',
      '.bambu-consent-actions button:focus-visible,.bambu-analytics-consent a:focus-visible{outline:3px solid #ec9d54;outline-offset:2px}',
      '.site-footer .footer-bottom .bambu-cookie-settings{margin-left:12px}',
      '@media(max-width:600px){.bambu-analytics-consent{position:relative;bottom:auto;left:auto;right:auto;width:100%;display:flex;flex-wrap:wrap;justify-content:space-between;gap:4px;padding:6px 12px;border-radius:0;border:0;border-bottom:1px solid #b9b2a7;box-shadow:none;font-size:11px}.bambu-consent-copy{flex:1 1 100%}.bambu-consent-copy strong{display:inline}.bambu-consent-copy p{display:inline;margin-left:5px;max-width:none}.bambu-consent-actions{flex:1 1 100%;margin-top:0}.bambu-consent-actions button{flex:1;min-height:44px;padding:4px 8px}}'
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

  const slug = (location.pathname.split('/').filter(Boolean).pop() || 'index').split('.html')[0];
  const onContact = slug === 'contact';
  const variations = {"index":["slate","START HERE / BAMBU","Let's make something","worth building.","If you're weighing up a building, a move or a refurbishment, we'd be happy to talk it through.","Start a conversation"],"about":["terracotta","ABOUT BAMBU / WHAT'S NEXT","Small by design.","Ready for the next brief.","From a small refresh to a complete fit-out, tell us what your space could become.","Talk to BAMBU"],"our-work":["steel","EXPERIENCE / YOUR PROJECT","Experience behind the work.","Ambition for what's next.","Tell us about your space, your goals and what good delivery would mean for you.","Discuss your project"],"tenants":["teal","FOR OCCUPIERS / LET'S TALK","Keep business moving.","We'll coordinate the fit-out.","Let's visit your space and discuss refurbishment or relocation.","Plan a workplace visit"],"landlords":["bronze","FOR PROPERTY OWNERS / THE NEXT LETTING","Make the next letting","count.","Explore test fits, targeted Cat A works and considered refurbishment.","Discuss your building"],"operators":["steel","FOR OPERATORS / THE NEXT WORKSPACE","A viable operating model.","A credible delivery plan.","Capacity, character and practical delivery for your next flexible workspace.","Discuss a potential site"],"approach":["terracotta","FROM IDEA TO DELIVERY","A clearer route","from idea to delivery.","From early feasibility to delivery, let's connect the decisions.","Start a conversation"],"contact":["teal","BAMBU / START HERE","Good projects start","with a conversation.","Tell us about your building, scope or programme. A short discussion is enough.","Email BAMBU"],"commercial-fit-out":["terracotta","FIT-OUT / NEXT STEPS","From the first brief","to the final detail.","Discuss Cat A, Cat B, refurbishment or technically demanding interior works.","Discuss your fit-out"],"workplace-design":["teal","DESIGN / BRING THE BRIEF","A considered design.","A workplace that works.","Let's explore the people, floorplate and priorities behind your brief.","Discuss workplace design"],"construction-management":["steel","DELIVERY / ONE TEAM","Many moving parts.","One coordinated plan.","Discuss the site, scope and programme and how specialists can work together.","Discuss the build"],"furniture-ff-e":["sage","FURNITURE / FINISHING TOUCHES","Character in the details.","Confidence in delivery.","Explore furniture, finishes and lead times within the wider fit-out.","Discuss FF&E"],"av-technology":["steel","TECHNOLOGY / WORKING DAY","Technology that works.","From day one.","Bring AV, data and meeting-room requirements into the design conversation.","Discuss technology"],"maintenance-aftercare":["sage","AFTERCARE / LONG TERM","Built for today.","Supported for tomorrow.","Tell us about the ongoing care or changes your space needs.","Discuss aftercare"],"material-innovation":["bronze","MATERIALS / BETTER CHOICES","Thoughtful specification.","Built to last.","Explore appropriate materials and technical products for your project.","Discuss materials"],"delivery-network":["steel","DELIVERY NETWORK / NEXT STEPS","The right specialists.","Working as one team.","Discuss the expertise your building and programme need.","Start a conversation"],"feasibility":["bronze","FEASIBILITY / FIRST CONVERSATION","Before you commit,","explore what's possible.","A quick review of the building and brief can reveal better options.","Discuss feasibility"],"licence-to-alter":["terracotta","APPROVALS / START EARLY","Plan the approvals.","Protect the programme.","Talk through landlord requirements and technical submissions.","Discuss approvals"],"project-budgeting":["bronze","BUDGET / COMMERCIAL CLARITY","Better decisions","start with a clear budget.","Let's discuss scope and the assumptions that affect the costs.","Discuss your budget"],"journal":["terracotta","IDEAS / INTO PRACTICE","An idea worth exploring?","Let's bring it to life.","Share the brief, building or question you're working through.","Start a conversation"]};
  const closing = document.querySelector('main .relaunch-final, main .about-outro, main .exp-next, main .approach-outro, main .operator-last-word, main .about-end, main .end-cta');
  const page = variations[slug];
  footer.dataset.bambuTone = page?.[0] || 'slate';
  const invitation = document.createElement('div');
  invitation.className = 'bambu-footer-invite';
  invitation.setAttribute('aria-labelledby', 'bambu-footer-invite-title');
  invitation.innerHTML = '<div class="bambu-footer-invite__inner wrap"><div class="bambu-footer-invite__headline"><p class="bambu-footer-invite__kicker"></p><h2 id="bambu-footer-invite-title"><span class="bambu-footer-invite__first"></span> <span class="bambu-footer-invite__accent"></span></h2><p class="bambu-footer-invite__description"></p></div><div class="bambu-footer-invite__actions"><a class="bambu-footer-invite__cta"><span></span><span aria-hidden="true">↗</span></a></div></div>';
  invitation.querySelector('.bambu-footer-invite__kicker').textContent = page?.[1] || closing?.querySelector('.kicker')?.textContent.trim() || 'BAMBU / START A CONVERSATION';
  invitation.querySelector('.bambu-footer-invite__first').textContent = page?.[2] || closing?.querySelector('h2')?.textContent.trim() || "Let's make something worth building.";
  const accent = invitation.querySelector('.bambu-footer-invite__accent');
  accent.textContent = page?.[3] || '';
  if (!accent.textContent) accent.hidden = true;
  invitation.querySelector('.bambu-footer-invite__description').textContent = page?.[4] || closing?.querySelector('p:not(.kicker)')?.textContent.trim() || 'Tell us about your space and what you want to achieve.';
  const action = invitation.querySelector('.bambu-footer-invite__cta');
  action.href = onContact ? '#project-enquiry' : (closing?.querySelector('a.cta')?.getAttribute('href') || 'contact');
  const audienceActions={tenants:['Discuss your workplace','Office refurbishment'],landlords:['Discuss your property','Landlord refurbishment'],operators:['Discuss a potential site','Flexible workspace']};
  const audience=audienceActions[slug];
  if(audience){action.href='contact?type='+encodeURIComponent(audience[1]);}
  action.firstElementChild.textContent = onContact ? 'Email BAMBU' : audience?.[0] || 'Get in touch';
  footer.insertBefore(invitation, footer.firstChild);
  // A single strong concluding invitation, not a second sales block after an explicit project invitation.
  const lastPanel=document.querySelector('main .bambu-audit-panel:last-child');
  if(lastPanel){const link=lastPanel.querySelector(':scope > a');if(link&&new URL(link.href).pathname === '/contact'){link.remove();if(!lastPanel.querySelector('.bambu-audit-grid,.bambu-audit-programme,details')&&/NEXT STEP|YOUR BRIEF/.test(lastPanel.querySelector('.kicker')?.textContent||''))lastPanel.remove();}}
  if(onContact){invitation.hidden=true;}
  // Shared footer: unframed invitation and a three-pulse arrow cue on every page.
  action.classList.add('bambu-visit-link');
  const circle=action.lastElementChild;
  const arrow=document.createElement('i');
  arrow.className='bambu-visit-arrow';
  arrow.textContent=circle.textContent;
  circle.replaceChildren(arrow);
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
    const pulse=()=>action.classList.add('bambu-visit-cue');
    if('IntersectionObserver' in window){
      const observer=new IntersectionObserver(entries=>{
        if(entries.some(entry=>entry.isIntersecting)){pulse();observer.disconnect();}
      },{threshold:.6});
      observer.observe(action);
    }else pulse();
  }

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

  // A deliberate two- or three-link footer, tailored to the current page.
  // The invitation above is the main contact action, not another long menu.
  const pageLinks = {
    index: [['Our services','services'],['About us','about'],['Journal','/journal']],
    about: [['How we work','approach'],['Who we work with','/#bambu-approach']],
    tenants: [['Workplace design','workplace-design'],['Feasibility','feasibility']],
    landlords: [['Building feasibility','feasibility'],['Licence to Alter','licence-to-alter']],
    operators: [['Commercial fit-out','commercial-fit-out'],['FF&E','furniture-ff-e']],
    contact: [['Our services','services'],['How we work','approach']],
    approach: [['For occupiers','tenants'],['For landlords','landlords']],
    'material-innovation': [['Workplace design','workplace-design'],['Contact BAMBU','contact']],
    journal: [['Our services','services'],['About us','about']]
  };
  const brandLine=footer.querySelector('.footer-brand p');
  if (brandLine) brandLine.textContent='Commercial interiors. London and across the UK.';
  // The London correspondence address is separate from the statutory registered office.
  const brand = footer.querySelector('.footer-brand');
  if (brand && !brand.querySelector('.bambu-office-address')) {
    const address = document.createElement('address');
    address.className = 'bambu-office-address';
    address.style.cssText = 'font-style:normal;font-size:.875rem;line-height:1.6;margin-top:.75rem';
    address.textContent = 'London office: 811–813 Wandsworth Road, London SW8 3JH';
    brand.append(address);
  }
  const links = pageLinks[slug] || [['About us','about'],['How we work','approach']];
  const footerColumns = footer.querySelector('.footer-top');
  if (footerColumns) {
    footerColumns.querySelectorAll(':scope > div:not(.footer-brand)').forEach(column => column.remove());
    const curated = document.createElement('div');
    curated.className = 'bambu-footer-curated';
    const heading = document.createElement('strong');
    heading.textContent = 'Explore next';
    curated.append(heading);
    links.forEach(([label, href]) => {
      const link = document.createElement('a');
      link.href = href;
      link.textContent = label;
      curated.append(link);
    });
    footerColumns.append(curated);
  }
  footer.querySelector('.footer-bottom > a[href="#main"]')?.remove();
  if (onContact) invitation.remove();
})();

// Keep the tab's interface colour aligned with BAMBU warm graphite.
(() => {
 const theme=document.querySelector('meta[name="theme-color"]');
 if(theme) theme.content='#202123';
})();

/* BAMBU 2026 illustration edit: retain original pencil sketches, then quietly
   extend the relevant page sequences. No logos or identity changes. */
(() => {
  const page=(location.pathname.split('/').pop()||'/').replace(/\.html$/,'');
  const sequences={
    'tenants':[
      'assets/studies/bambu-unique/tenants-study-03.svg',
      'assets/process/bambu/materials-selection.webp',
      'assets/studies/bambu-unique/tenants-phasing.svg'
    ],
    'landlords':[
      'assets/studies/bambu-unique/landlords-study-02.svg',
      'assets/studies/bambu-unique/landlords-study-03.svg',
      'assets/studies/bambu-unique/landlords-cad.svg'
    ],
    'operators':[
      'assets/studies/bambu-unique/operators-study-03.svg',
      'assets/studies/bambu-unique/operators-study-04.svg',
      'assets/studies/bambu-unique/operators-study-05.svg'
    ],
    'approach':[
      'assets/studies/bambu-unique/approach-study-03.svg',
      'assets/studies/bambu-unique/approach-study-04.svg',
      'assets/studies/bambu-unique/approach-coordination.svg'
    ],
    'material-innovation':[
      'assets/studies/bambu-unique/material-innovation-study-03.svg',
      'assets/studies/bambu-unique/material-palette-a.svg',
      'assets/studies/bambu-unique/material-palette-b.svg'
    ],
    'delivery-network':[
      'assets/studies/bambu-unique/delivery-network-study-03.svg',
      'assets/process/bambu/finished-workplace.webp',
      'assets/studies/bambu-unique/delivery-interface.svg'
    ],
    'contact':[
      'assets/studies/bambu-unique/contact-study-01.svg',
      'assets/studies/bambu-unique/contact-study-02.svg',
      'assets/studies/bambu-unique/contact-study-03.svg',
      'assets/studies/bambu-unique/contact-meeting-room.svg',
      'assets/studies/bambu-unique/contact-reception.svg'
    ]
  };
  const extra=sequences[page];
  if(!extra)return;
  const main=document.querySelector('main#main');
  const frame=page==='contact'?
    main?.querySelector('.bambu-contact-drawing'):
    main?.querySelector('section.expertise-opening .expertise-scene.sketch-story');
  if(!frame || frame.querySelectorAll('img').length < 1)return;
  const existing=new Set([...frame.querySelectorAll('img')].map(x=>x.getAttribute('src')));
  extra.forEach((src) => {
    if(existing.has(src))return;
    const img=document.createElement('img');
    img.src=src; img.alt=''; img.decoding='async'; img.loading='lazy';
    img.width=src.endsWith('.webp')?1448:1440;
    img.height=src.endsWith('.webp')?1086:900;
    img.setAttribute('data-bambu-additional-sketch','');
    img.addEventListener('error',()=>{
      img.remove();
      // If a new file cannot be loaded, keep the original three-frame artwork
      // rather than spending time on a blank transition.
      frame.classList.remove('bambu-sketch-six');
      frame.querySelectorAll('img').forEach(x=>x.style.removeProperty('--bambu-sketch-index'));
    },{once:true});
    frame.append(img);existing.add(src);
  });
  const items=[...frame.querySelectorAll('img')];
  if(items.length!==6)return;
  items.forEach((img,i)=>{
    img.style.setProperty('--bambu-sketch-index',String(i));
    img.setAttribute('aria-hidden','true');
  });
  frame.classList.add('bambu-sketch-six');
  frame.setAttribute('data-bambu-sketch-count',String(items.length));
})();

'use strict';
/* BAMBU illustration and annotation refinement.
   Labels are visual drafting marks only, never substitute for the page copy. */
(() => {
  const zones = [
    ['main.r2-operators .operator-intelligence', ['MEMBER', 'LAYOUT', 'SERVICES', 'OPERATIONS']],
    ['main.bambu-company-page .bambu-company-principles', ['CLIENT', 'DESIGN', 'COST', 'DELIVERY']],
    ['main.innovation-page .r2-responsibility', ['REUSE', 'MATERIALS', 'PEOPLE', 'OPERATION']],
    ['main.r2-tenants .occupier-tech', ['BRIEF', 'TECHNOLOGY', 'APPROVALS', 'HANDOVER']],
    ['main[data-study="delivery-network"] .bambu-editorial-journey', ['SCOPE', 'SPECIALISTS', 'COORDINATION', 'DELIVERY']]
  ];
  for(const [selector, words] of zones){
    const section=document.querySelector(selector);
    if(!section || section.querySelector('.bambu-studio-annotations'))continue;
    const notes=document.createElement('div');
    notes.className='bambu-studio-annotations';
    notes.setAttribute('aria-hidden','true');
    words.forEach(label=>{
      const span=document.createElement('span'),dot=document.createElement('i');
      dot.setAttribute('aria-hidden','true');
      span.append(dot,document.createTextNode(label));
      notes.append(span);
    });
    section.append(notes);
  }
  const principles=document.querySelector('main.bambu-company-page .bambu-company-principles__heading');
  if(principles && !principles.querySelector('.bambu-slider-cue')){
    const p=document.createElement('p');
    p.className='bambu-slider-cue';
    p.textContent='Explore the four principles using the arrows.';
    principles.append(p);
  }
})();

/* Equal top-level mobile menu typography, regardless of link type or active state. */
(() => {
 const nav=document.querySelector('body > header .mobile-nav > nav');
 if(!nav)return;
 nav.querySelectorAll(':scope > a, :scope > .mobile-expertise > summary').forEach(row=>{
 const rules={'font-family':'inherit','font-size':'clamp(1.2rem, 5vw, 1.65rem)','font-weight':'560','line-height':'1.2','letter-spacing':'-.025em','text-size-adjust':'100%','-webkit-text-size-adjust':'100%','min-height':'72px','box-sizing':'border-box'};
 Object.entries(rules).forEach(([property,value])=>row.style.setProperty(property,value,'important'));
 });
})();

// Keep the approved B icon consistent on every page, including cached HTML.
document.querySelectorAll('link[rel~="icon"]').forEach(link=>{link.href="/assets/brand/bambu-b-blue.svg?v=20261125rounded";link.type="image/svg+xml";link.removeAttribute("sizes");});

// Keep personal addresses out of the rendered site; enquiries use the contact form.
document.querySelectorAll('a[href^="mailto:"]').forEach(a=>{if(/(?:ed|joe)@bambuinteriors\.co\.uk/i.test(a.getAttribute('href'))){a.href='/contact#project-enquiry';a.textContent='Start an enquiry';}});
