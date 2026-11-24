'use strict';
/* One carousel, seven user-selected photos, no modal or enlargement. */
(() => {
 const page=document.querySelector('main.bambu-cs');if(!page)return;
 const rail=page.querySelector('[data-cs-rail]'), cards=[...page.querySelectorAll('[data-cs-slide]')], thumbs=[...page.querySelectorAll('[data-cs-thumb]')], prev=page.querySelector('[data-cs-prev]'), next=page.querySelector('[data-cs-next]'), count=page.querySelector('[data-cs-count]');
 if(!rail||!cards.length||!prev||!next||!count)return;
 let selected=0, frame=0;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 function active(){
   const left=rail.getBoundingClientRect().left+parseFloat(getComputedStyle(rail).paddingLeft||'0');
   let best=0,d=Infinity;cards.forEach((card,i)=>{const dist=Math.abs(card.getBoundingClientRect().left-left);if(dist<d){d=dist;best=i;}});return best;
 }
 function sync(i=active()){
   selected=i;count.textContent=String(i+1).padStart(2,'0')+' / '+String(cards.length).padStart(2,'0');
   prev.disabled=i===0;next.disabled=i===cards.length-1;
   thumbs.forEach((b,n)=>b.setAttribute('aria-current',String(n===i)));
 }
 function move(i){
   i=Math.max(0,Math.min(cards.length-1,i));
   const left=rail.getBoundingClientRect().left+parseFloat(getComputedStyle(rail).paddingLeft||'0');
   rail.scrollTo({left:rail.scrollLeft+cards[i].getBoundingClientRect().left-left,behavior:reduce.matches?'auto':'smooth'});sync(i);
 }
 prev.addEventListener('click',()=>move(selected-1));next.addEventListener('click',()=>move(selected+1));
 thumbs.forEach((b,i)=>b.addEventListener('click',()=>move(i)));
 rail.addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(()=>{frame=0;sync();});},{passive:true});
 rail.addEventListener('keydown',e=>{if(e.target!==rail)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(selected+(e.key==='ArrowRight'?1:-1));}});
 // Keep the final photo fully reachable even on wide screens.
 const pad=()=>{const w=rail.clientWidth,c=cards[cards.length-1].getBoundingClientRect().width,l=parseFloat(getComputedStyle(rail).paddingLeft||'0');rail.style.setProperty('--cs-end-pad',Math.max(l,w-c-l)+'px');};
 pad();window.addEventListener('resize',pad,{passive:true});
 sync(0);
 const anchor=location.hash.slice(1);if(anchor){const i=cards.findIndex(c=>c.id===anchor);if(i>=0)requestAnimationFrame(()=>move(i));}
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
   const photo=Math.max(108,Math.floor(available));
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
