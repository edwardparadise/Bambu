'use strict';

// Responsive styles and sliders are linked in the HTML head to avoid late reflow.

// One master wordmark everywhere: masthead, footer and supporting brand boards.
document.querySelectorAll('header img.unified-wordmark').forEach(img=>{
  img.src='assets/brand/bambu-a1-primary.svg';
  img.width=540; img.height=155;
  img.alt='';
});
document.querySelectorAll('.site-footer .footer-brand img').forEach(img=>{
  img.src='assets/brand/bambu-a1-primary.svg';
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
    {id:'clients',name:'Who We Work With',intro:'A more considered response to every property and brief.',links:[
      ['Occupiers','tenants.html','Workplaces built around people.','practice-scope.svg'],
      ['Workspace Operators','operators.html','Flexible office spaces that work commercially.','operator-capacity.svg'],
      ['Landlords & Agents','landlords.html','Refurbishment that supports the letting.','operator-landlord-meeting.svg']]},
    {id:'services',name:'Services',intro:'From the first conversation to the final detail.',links:[
      ['Strategy & Design','workplace-design.html','Brief, test fits and joined-up design.','practice-scope.svg'],
      ['Commercial Fit-Out','commercial-fit-out.html','Well-resolved, carefully delivered spaces.','delivery-trades.svg'],
      ['Construction Management','construction-management.html','One coordinated delivery programme.','delivery-interfaces.svg'],
      ['Furniture & Finishes','furniture-ff-e.html','Materials, furniture and the finer detail.','tech-environment.svg'],
      ['AV & Technology','av-technology.html','Connected spaces ready for work.','tech-network-av.svg'],
      ['Aftercare','maintenance-aftercare.html','Support beyond practical completion.','delivery-quality.svg']]},
    {id:'approach',name:'How We Work',intro:'Understand the brief, make the decisions, deliver the detail.',links:[
      ['Our Approach','approach.html','Five connected stages from brief to handover.','practice-coordinate.svg'],
      ['Materials & Specification','material-innovation.html','Character, performance and product evidence.','tech-environment.svg'],
      ['Delivery Network','delivery-network.html','The right specialist team for the project.','practice-specialists.svg']]},
    {id:'about',name:'About BAMBU',intro:'The thinking, experience and people behind the work.',links:[
      ['Our Story & Experience','about.html','What shapes our approach and delivery.','delivery-accountability.svg'],
      ['Journal','journal.html','News, reflections and practical insight.','practice-coordinate.svg']]}
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
    (group.id==='services'?'<a class="bambu-nav-view-all" href="services.html">Explore all six services <span aria-hidden="true">↗</span></a>':'')+
    '</div></div>').join('')+
    '<a class="nav-contact" href="contact.html">Let’s talk <span aria-hidden="true">↗</span></a>';
  mobile.innerHTML='<span class="mobile-nav-kicker">BAMBU / EXPLORE</span>'+
    groups.map((group,i)=>'<details class="mobile-expertise" data-nav-group="'+group.id+'">'+
    '<summary>'+group.name+' <span aria-hidden="true">+</span></summary><div>'+
    (group.id==='services'?'<a href="services.html">Explore all services</a>':'')+
    group.links.map(entry=>'<a href="'+entry[1]+'">'+entry[0]+'</a>').join('')+
    '</div></details>').join('')+
    '<a class="bambu-mobile-contact" href="contact.html">Discuss a project <span aria-hidden="true">↗</span></a>'+
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

// Retain useful legacy footer links without reintroducing a second Experience menu.
(() => {
  document.querySelectorAll('.site-footer a[href="materials-lab.html"],.site-footer a[href^="our-work.html"]').forEach(link=>link.remove());
  document.querySelectorAll('a[href^="our-work.html"]').forEach(link=>{
    link.href='about.html#studio-and-builder';
    if(/^(Experience|Our work)$/i.test(link.textContent.trim()))link.textContent='About BAMBU';
  });
  document.querySelectorAll('.site-footer a[href="approach.html"]').forEach(link=>{
    if(link.textContent.trim()==='Expertise')link.textContent='How we work';
  });
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

// Highlight the relevant navigation family, without making the parent a false link.
const routeGroups={
  clients:['tenants','landlords','operators','landlord-refurbishment','flexible-workspace','office-relocation','office-refurbishment'],
  services:['services','workplace-design','commercial-fit-out','construction-management','furniture-ff-e','av-technology','maintenance-aftercare'],
  approach:['approach','material-innovation','delivery-network','feasibility','licence-to-alter','project-budgeting','project-programme','space-brief','fit-out-guide'],
  about:['about','journal','journal-introducing-bambu']
};
Object.entries(routeGroups).forEach(([group,pages])=>{
  if(!pages.includes(pageSlug) && !(group==='about'&&pageSlug.startsWith('journal-')))return;
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
document.querySelectorAll('a[href="operators.html"]').forEach(link=>{const text=link.textContent.trim();if(text==='Flexible workspace'||text==='For operators'||text==='Operators')link.textContent='Workspace operators'});


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

  const slug = (location.pathname.split('/').filter(Boolean).pop() || 'index').split('.html')[0];
  const onContact = slug === 'contact';
  const variations = {"index":["slate","START HERE / BAMBU","Let's make something","worth building.","If you're weighing up a building, a move or a refurbishment, we'd be happy to talk it through.","Start a conversation"],"about":["terracotta","ABOUT BAMBU / WHAT'S NEXT","Small by design.","Ready for the next brief.","From a small refresh to a complete fit-out, tell us what your space could become.","Talk to BAMBU"],"our-work":["steel","EXPERIENCE / YOUR PROJECT","Experience behind the work.","Ambition for what's next.","Tell us about your space, your goals and what good delivery would mean for you.","Discuss your project"],"tenants":["teal","FOR OCCUPIERS / LET'S TALK","Keep business moving.","We'll coordinate the fit-out.","Let's visit your space and discuss refurbishment or relocation.","Plan a workplace visit"],"landlords":["bronze","FOR PROPERTY OWNERS / THE NEXT LETTING","Make the next letting","count.","Explore test fits, targeted Cat A works and considered refurbishment.","Discuss your building"],"operators":["steel","FOR OPERATORS / THE NEXT WORKSPACE","A viable operating model.","A credible delivery plan.","Capacity, character and practical delivery for your next flexible workspace.","Discuss a potential site"],"approach":["terracotta","FROM IDEA TO DELIVERY","A clearer route","from idea to delivery.","From early feasibility to delivery, let's connect the decisions.","Start a conversation"],"contact":["teal","BAMBU / START HERE","Good projects start","with a conversation.","Tell us about your building, scope or programme. A short discussion is enough.","Email BAMBU"],"commercial-fit-out":["terracotta","FIT-OUT / NEXT STEPS","From the first brief","to the final detail.","Discuss Cat A, Cat B, refurbishment or technically demanding interior works.","Discuss your fit-out"],"workplace-design":["teal","DESIGN / BRING THE BRIEF","A considered design.","A workplace that works.","Let's explore the people, floorplate and priorities behind your brief.","Discuss workplace design"],"construction-management":["steel","DELIVERY / ONE TEAM","Many moving parts.","One coordinated plan.","Discuss the site, scope and programme and how specialists can work together.","Discuss the build"],"furniture-ff-e":["sage","FURNITURE / FINISHING TOUCHES","Character in the details.","Confidence in delivery.","Explore furniture, finishes and lead times within the wider fit-out.","Discuss FF&E"],"av-technology":["steel","TECHNOLOGY / WORKING DAY","Technology that works.","From day one.","Bring AV, data and meeting-room requirements into the design conversation.","Discuss technology"],"maintenance-aftercare":["sage","AFTERCARE / LONG TERM","Built for today.","Supported for tomorrow.","Tell us about the ongoing care or changes your space needs.","Discuss aftercare"],"material-innovation":["bronze","MATERIALS / BETTER CHOICES","Thoughtful specification.","Built to last.","Explore appropriate materials and technical products for your project.","Discuss materials"],"delivery-network":["steel","DELIVERY NETWORK / NEXT STEPS","The right specialists.","Working as one team.","Discuss the expertise your building and programme need.","Start a conversation"],"feasibility":["bronze","FEASIBILITY / FIRST CONVERSATION","Before you commit,","explore what's possible.","A quick review of the building and brief can reveal better options.","Discuss feasibility"],"licence-to-alter":["terracotta","APPROVALS / START EARLY","Plan the approvals.","Protect the programme.","Talk through landlord requirements and technical submissions.","Discuss approvals"],"project-budgeting":["bronze","BUDGET / COMMERCIAL CLARITY","Better decisions","start with a clear budget.","Let's discuss scope and the assumptions that affect the costs.","Discuss your budget"],"journal":["terracotta","IDEAS / INTO PRACTICE","An idea worth exploring?","Let's bring it to life.","Share the brief, building or question you're working through.","Start a conversation"]};
  const closing = document.querySelector('main .relaunch-final, main .about-outro, main .exp-next, main .approach-outro, main .operator-last-word, main .about-end, main .end-cta');
  const page = variations[slug];
  footer.dataset.bambuTone = page?.[0] || 'slate';
  const invitation = document.createElement('div');
  invitation.className = 'bambu-footer-invite';
  invitation.setAttribute('aria-labelledby', 'bambu-footer-invite-title');
  invitation.innerHTML = '<div class="bambu-footer-invite__inner wrap"><div class="bambu-footer-invite__headline"><p class="bambu-footer-invite__kicker"></p><h2 id="bambu-footer-invite-title"><span class="bambu-footer-invite__first"></span> <span class="bambu-footer-invite__accent"></span></h2><p class="bambu-footer-invite__description"></p></div><div class="bambu-footer-invite__actions"><a class="bambu-footer-invite__cta"><span></span><span aria-hidden="true">↗</span></a><a class="bambu-footer-invite__email" href="mailto:ed@bambuinteriors.co.uk">ed@bambuinteriors.co.uk</a></div></div>';
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

  // A deliberate two- or three-link footer, tailored to the current page.
  // The invitation above is the main contact action, not another long menu.
  const pageLinks = {
    index: [['What we do','approach.html'],['About BAMBU','about.html']],
    about: [['Our approach','approach.html'],['Who we work with','index.html#bambu-approach']],
    tenants: [['Workplace design','workplace-design.html'],['Feasibility','feasibility.html']],
    landlords: [['Building feasibility','feasibility.html'],['Licence to Alter','licence-to-alter.html']],
    operators: [['Commercial fit-out','commercial-fit-out.html'],['FF&E','furniture-ff-e.html']],
    contact: [['How we work','approach.html'],['Project planning guide','fit-out-guide.html']],
    approach: [['For occupiers','tenants.html'],['For landlords','landlords.html']],
    'material-innovation': [['Workplace design','workplace-design.html'],['Contact BAMBU','contact.html']],
    journal: [['About BAMBU','about.html'],['Our approach','approach.html']]
  };
  const brandLine=footer.querySelector('.footer-brand p');
  if (brandLine) brandLine.textContent='Commercial interiors. London and across the UK.';
  const links = pageLinks[slug] || [['About BAMBU','about.html'],['Our approach','approach.html']];
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
  if (onContact) invitation.querySelector('.bambu-footer-invite__email')?.remove();
})();

// Keep the tab's interface colour aligned with BAMBU warm graphite.
(() => {
 const theme=document.querySelector('meta[name="theme-color"]');
 if(theme) theme.content='#202123';
})();

/* BAMBU 2026 illustration edit: retain original pencil sketches, then quietly
   extend the relevant page sequences. No logos or identity changes. */
(() => {
  const page=(location.pathname.split('/').pop()||'index.html').replace(/\.html$/,'');
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
