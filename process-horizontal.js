'use strict';
/* BAMBU five-stage route: native scroll-snap, one viewport per station. */
(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 for(const controls of document.querySelectorAll('[data-process-controls]')){
   const rail=document.getElementById(controls.dataset.processControls);
   if(!rail)continue;
   const prev=controls.querySelector('[data-process-prev]');
   const next=controls.querySelector('[data-process-next]');
   const counter=controls.querySelector('[data-process-counter]');
   const stations=[...rail.querySelectorAll('.tube-stations > li')];
   if(!stations.length)continue;
   const index=()=>{
     const width=rail.clientWidth||1;
     return Math.max(0,Math.min(stations.length-1,Math.round(rail.scrollLeft/width)));
   };
   const update=()=>{
     const i=index();
     if(prev)prev.disabled=i===0;
     if(next)next.disabled=i===stations.length-1;
     if(counter)counter.textContent=String(i+1).padStart(2,'0')+' / '+String(stations.length).padStart(2,'0');
   };
   const move=direction=>{
     const i=Math.max(0,Math.min(stations.length-1,index()+direction));
     rail.scrollTo({left:i*rail.clientWidth,behavior:reduced.matches?'instant':'smooth'});
   };
   prev?.addEventListener('click',()=>move(-1));
   next?.addEventListener('click',()=>move(1));
   let queued=false;
   rail.addEventListener('scroll',()=>{
     if(queued)return;
     queued=true;
     requestAnimationFrame(()=>{queued=false;update();});
   },{passive:true});
   if('ResizeObserver' in window)new ResizeObserver(update).observe(rail);
   update();
 }
})();