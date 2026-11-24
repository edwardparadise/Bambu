'use strict';
/* BAMBU Case Studies | Lightweight accessible carousel and project gallery.
   All project scopes and images are authored in HTML; no fabricated images. */
(() => {
  const page=document.querySelector('main.bambu-cs');
  if(!page)return;
  const rail=page.querySelector('[data-cs-rail]');
  const cards=[...page.querySelectorAll('[data-cs-open]')];
  const prev=page.querySelector('[data-cs-prev]');
  const next=page.querySelector('[data-cs-next]');
  const counter=page.querySelector('[data-cs-count]');
  const modal=document.getElementById('bambu-cs-dialog');
  const panels=[...modal.querySelectorAll('[data-cs-panel]')];
  const closeButton=modal.querySelector('[data-cs-close]');
  let lastOpener=null;

  const activeCard=()=>{
    const box=rail.getBoundingClientRect();
    return cards.reduce((best,card,i)=>{
      const d=Math.abs(card.getBoundingClientRect().left-box.left);
      return d<best.distance?{index:i,distance:d}:best;
    },{index:0,distance:Infinity}).index;
  };
  const sync=()=>{
    const index=activeCard();
    counter.textContent=String(index+1).padStart(2,'0')+' / '+String(cards.length).padStart(2,'0');
    prev.disabled=index===0;
    next.disabled=index===cards.length-1;
  };
  const move=delta=>{
    const index=Math.max(0,Math.min(cards.length-1,activeCard()+delta));
    cards[index]?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest',inline:'start'});
    setTimeout(sync,370);
  };
  prev.addEventListener('click',()=>move(-1));
  next.addEventListener('click',()=>move(1));
  rail.addEventListener('scroll',()=>requestAnimationFrame(sync),{passive:true});
  rail.addEventListener('keydown',e=>{
    if(e.target!==rail)return;
    if(e.key==='ArrowRight'||e.key==='ArrowLeft'){
      e.preventDefault();move(e.key==='ArrowRight'?1:-1);
    }
  });
  sync();

  // An external building-context photograph is optional: if remote source
  // blocks hotlinking, show an authentic user-supplied interior of the building.
  page.querySelectorAll('img[data-cs-fallback]').forEach(img=>{
    img.addEventListener('error',()=>{
      const fallback=img.dataset.csFallback;
      if(fallback && !img.src.endsWith(fallback)){img.removeAttribute('data-cs-fallback');img.src=fallback;}
    });
  });
  const galleries=[...modal.querySelectorAll('[data-cs-gallery]')];
  const resetGallery=gallery=>{
    const buttons=[...gallery.querySelectorAll('[data-cs-photo]')];
    gallery.dataset.index='0';
    buttons.forEach((b,i)=>b.classList.toggle('is-current',i===0));
    const selected=buttons[0];
    const image=gallery.querySelector('[data-cs-large]');
    if(selected && image){
      image.src=selected.dataset.csPhoto;
      image.alt=selected.dataset.csAlt || '';
      image.dataset.csFallback=selected.querySelector('img')?.dataset.csFallback||image.dataset.csFallback||'';
      gallery.querySelector('[data-cs-caption]').textContent=selected.dataset.csCaption||'';
    }
    const count=gallery.querySelector('[data-cs-image-count]');
    if(count)count.textContent='01 / '+String(buttons.length).padStart(2,'0');
  };
  const changeGallery=(gallery,index)=>{
    const buttons=[...gallery.querySelectorAll('[data-cs-photo]')];
    if(!buttons.length)return;
    const n=(index+buttons.length)%buttons.length;
    const b=buttons[n],image=gallery.querySelector('[data-cs-large]');
    gallery.dataset.index=String(n);
    image.src=b.dataset.csPhoto;
    image.alt=b.dataset.csAlt||'Project photograph';
    if(image.src!==image.dataset.csFallback)image.dataset.csFallback=b.querySelector('img')?.dataset.csFallback||'';
    gallery.querySelector('[data-cs-caption]').textContent=b.dataset.csCaption||'';
    buttons.forEach((item,i)=>item.classList.toggle('is-current',i===n));
    gallery.querySelector('[data-cs-image-count]').textContent=String(n+1).padStart(2,'0')+' / '+String(buttons.length).padStart(2,'0');
    b.scrollIntoView({behavior:'smooth',block:'nearest',inline:'nearest'});
  };
  galleries.forEach(gallery=>{
    gallery.querySelectorAll('[data-cs-photo]').forEach((b,i)=>b.addEventListener('click',()=>changeGallery(gallery,i)));
    gallery.querySelector('[data-cs-photo-prev]')?.addEventListener('click',()=>changeGallery(gallery,Number(gallery.dataset.index||0)-1));
    gallery.querySelector('[data-cs-photo-next]')?.addEventListener('click',()=>changeGallery(gallery,Number(gallery.dataset.index||0)+1));
    gallery.querySelector('img[data-cs-large]')?.addEventListener('error',e=>{
      const img=e.currentTarget;
      if(img.dataset.csFallback && !img.src.endsWith(img.dataset.csFallback)){
        const fall=img.dataset.csFallback;img.dataset.csFallback='';img.src=fall;
      }
    });
  });
  const open=id=>{
    const panel=panels.find(p=>p.dataset.csPanel===id);
    if(!panel)return;
    panels.forEach(p=>p.hidden=p!==panel);
    const gallery=panel.querySelector('[data-cs-gallery]');
    if(gallery)resetGallery(gallery);
    if(typeof modal.showModal==='function'){
      if(!modal.open)modal.showModal();
      closeButton.focus();
    }else{
      modal.setAttribute('open','');
      modal.scrollIntoView({block:'start',behavior:'smooth'});
    }
    document.body.classList.add('bambu-cs-dialog-open');
  };
  const close=()=>{
    document.body.classList.remove('bambu-cs-dialog-open');
    if(typeof modal.close==='function'&&modal.open)modal.close();
    else modal.removeAttribute('open');
    lastOpener?.focus();
  };
  cards.forEach(card=>card.addEventListener('click',()=>{
    lastOpener=card;open(card.dataset.csOpen);
  }));
  closeButton.addEventListener('click',close);
  modal.addEventListener('cancel',()=>{
    document.body.classList.remove('bambu-cs-dialog-open');
    lastOpener?.focus();
  });
  modal.addEventListener('click',e=>{
    if(e.target===modal)close();
  });
  if(location.hash.startsWith('#case-')){
    const id=location.hash.slice(6);
    if(cards.some(c=>c.dataset.csOpen===id)){
      lastOpener=cards.find(c=>c.dataset.csOpen===id);
      open(id);
    }
  }
})();

/* Measure the visible viewport, including iOS in-app browsers. */
(() => {
 const opening=document.querySelector('.bambu-cs-opening');
 if(!opening)return;
 const update=()=>{
   const viewport=window.visualViewport;
   if(viewport && Math.abs(viewport.scale-1)>.03)return;
   const height=viewport?.height||window.innerHeight;
   const top=Math.max(0,opening.getBoundingClientRect().top+window.scrollY);
   opening.style.setProperty('--bambu-cs-opening-min',Math.max(0,Math.ceil(height-top)+2)+'px');
 };
 update();
 window.addEventListener('resize',update,{passive:true});
 window.visualViewport?.addEventListener('resize',update,{passive:true});
 window.addEventListener('pageshow',update);
 window.addEventListener('load',update,{once:true});
 document.fonts?.ready.then(update);
 const header=document.querySelector('body > header');
 if(header && 'ResizeObserver' in window)new ResizeObserver(update).observe(header);
})();

/* A text fallback is displayed only if a genuine sourced mark cannot load. */
document.querySelectorAll('.bambu-cs-client-logo img').forEach(img=>{
 const fallback=()=>{img.closest('li')?.classList.add('is-unavailable');img.nextElementSibling?.removeAttribute('aria-hidden');img.setAttribute('aria-hidden','true');};
 img.addEventListener('error',fallback,{once:true});
 if(img.complete&&!img.naturalWidth)fallback();
});
