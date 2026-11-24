'use strict';
(() => {
 const rail=document.querySelector('[data-cs-rail]');if(!rail)return;
 const cards=[...rail.querySelectorAll('[data-cs-slide]')], prev=document.querySelector('[data-cs-prev]'),next=document.querySelector('[data-cs-next]'),count=document.querySelector('[data-cs-count]');
 const client=document.querySelector('[data-cs-client]');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const behavior=()=>reduced.matches?'auto':'smooth';
 let selected=0, pending=null, settle=0;
 function origin(){return rail.getBoundingClientRect().left+parseFloat(getComputedStyle(rail).paddingLeft||'0');}
 function active(){let best=0,d=Infinity;cards.forEach((c,i)=>{const x=Math.abs(c.getBoundingClientRect().left-origin());if(x<d){best=i;d=x;}});return best;}
 function sync(i){selected=i;if(client)client.textContent=cards[i].querySelector('.bambu-cs-project-name')?.textContent||'';count.textContent=String(i+1).padStart(2,'0')+' / '+String(cards.length).padStart(2,'0');prev.disabled=i===0;next.disabled=i===cards.length-1;}
 function move(i){i=Math.max(0,Math.min(cards.length-1,i));pending=i;sync(i);rail.scrollTo({left:rail.scrollLeft+cards[i].getBoundingClientRect().left-origin(),behavior:behavior()});clearTimeout(settle);settle=setTimeout(()=>{pending=null;sync(active());},500);}
 function pad(){const w=rail.clientWidth,c=cards.at(-1).getBoundingClientRect().width,l=parseFloat(getComputedStyle(rail).paddingLeft||'0');rail.style.setProperty('--cs-end-pad',Math.max(l,w-c-l)+'px');}
 prev.addEventListener('click',()=>move(selected-1));next.addEventListener('click',()=>move(selected+1));
 rail.addEventListener('scroll',()=>{if(pending===null)sync(active());clearTimeout(settle);settle=setTimeout(()=>{pending=null;sync(active());},150);},{passive:true});
 rail.addEventListener('pointerdown',()=>{pending=null;},{passive:true});
 rail.addEventListener('keydown',e=>{if(e.target!==rail)return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();move(selected+(e.key==='ArrowRight'?1:-1));}});
 pad();window.addEventListener('resize',pad,{passive:true});sync(0);
 const anchor=location.hash.slice(1);const target=cards.findIndex(c=>c.id===anchor);if(target>=0)requestAnimationFrame(()=>move(target));
 cards.forEach(card=>{
  const track=card.querySelector('[data-photo-track]'),photos=[...track.querySelectorAll('[data-photo-index]')],thumbs=[...card.querySelectorAll('[data-photo-thumb]')],back=card.querySelector('[data-photo-prev]'),forward=card.querySelector('[data-photo-next]'),counter=card.querySelector('[data-photo-count]');
  if(photos.length<2)return;
  let index=0;
  function show(i){index=i;counter.textContent=(i+1)+' / '+photos.length;thumbs.forEach((b,n)=>b.setAttribute('aria-current',String(i===n)));}
  function go(i){i=(i+photos.length)%photos.length;track.scrollTo({left:i*track.clientWidth,behavior:behavior()});show(i);}
  back.addEventListener('click',()=>go(index-1));forward.addEventListener('click',()=>go(index+1));
  thumbs.forEach((b,i)=>b.addEventListener('click',()=>go(i)));
  track.addEventListener('scroll',()=>show(Math.max(0,Math.min(photos.length-1,Math.round(track.scrollLeft/Math.max(1,track.clientWidth))))),{passive:true});
  track.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();go(index+(e.key==='ArrowRight'?1:-1));}});
  window.addEventListener('resize',()=>track.scrollTo({left:index*track.clientWidth,behavior:'instant'}),{passive:true});
  show(0);
 });
})();
/* Fit the entire opening at the top of the page, then allocate unused space
   to the photo instead of leaving a blank region. Never resize on scroll alone. */
(() => {
 const opening=document.querySelector('.bambu-cs-opening');
 if(!opening)return;
 const media=opening.querySelector('.bambu-cs-card__media');
 const mobile=matchMedia('(max-width:800px)');
 let previousWidth=0,frame=0;
 const update=()=>{
   frame=0;
   const viewport=window.visualViewport;
   if(viewport && Math.abs(viewport.scale-1)>.03)return;
   const width=document.documentElement.clientWidth;
   // Safari changes viewport height when its bars collapse on scroll.
   // Keep the initial composition stable until returning to the top or rotating.
   if(window.scrollY>8 && width===previousWidth)return;
   previousWidth=width;
   const height=viewport?.height||window.innerHeight;
   const top=Math.max(0,opening.getBoundingClientRect().top+window.scrollY);
   const target=Math.max(0,Math.floor(height-top)+1);
   opening.style.removeProperty('--bambu-cs-photo-height');
   if(!mobile.matches||!media){opening.style.setProperty('--bambu-cs-opening-min',target+'px');return;}
   opening.style.setProperty('--bambu-cs-opening-min','0px');
   const baseline=media.getBoundingClientRect().height;
   const natural=opening.getBoundingClientRect().height;
   const available=baseline+target-natural;
   const minimum=Math.max(260,Math.min(440,width*.88));
   const photo=Math.max(minimum,Math.floor(available));
   opening.style.setProperty('--bambu-cs-photo-height',photo+'px');
   opening.style.setProperty('--bambu-cs-opening-min',target+'px');
 };
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
 update();
 window.addEventListener('resize',schedule,{passive:true});
 window.visualViewport?.addEventListener('resize',schedule,{passive:true});
 window.addEventListener('pageshow',schedule);
 window.addEventListener('load',schedule,{once:true});
 document.fonts?.ready.then(schedule);
 const header=document.querySelector('body > header');
 if(header && 'ResizeObserver' in window)new ResizeObserver(schedule).observe(header);
})();

/* A text fallback is displayed only if a genuine sourced mark cannot load. */
document.querySelectorAll('.bambu-cs-client-logo img').forEach(img=>{
 const fallback=()=>{img.closest('li')?.classList.add('is-unavailable');img.nextElementSibling?.removeAttribute('aria-hidden');img.setAttribute('aria-hidden','true');};
 img.addEventListener('error',fallback,{once:true});
 if(img.complete&&!img.naturalWidth)fallback();
});
