'use strict';
/* Accessible native scroll-snap technical gallery for the Occupiers page. */
(() => {
  const rail=document.getElementById('occupier-tech-rail');
  if (!rail) return;
  const cards=[...rail.querySelectorAll('.occupier-tech-card')];
  const controls=document.querySelector('.occupier-tech__controls');
  const prev=controls?.querySelector('[data-occupier-tech-prev]');
  const next=controls?.querySelector('[data-occupier-tech-next]');
  const current=controls?.querySelector('[data-occupier-tech-current]');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  if (!cards.length) return;
  let queued=false;
  const update=()=>{
    const viewport=rail.getBoundingClientRect();
    const inset=parseFloat(getComputedStyle(rail).paddingLeft)||0;
    const anchor=viewport.left+inset;
    let active=0,closest=Infinity;
    cards.forEach((card,i)=>{
      const distance=Math.abs(card.getBoundingClientRect().left-anchor);
      if(distance<closest){closest=distance;active=i;}
    });
    if(current) current.textContent=String(active+1).padStart(2,'0');
    const remaining=Math.max(0,rail.scrollWidth-rail.clientWidth);
    if(prev) prev.disabled=rail.scrollLeft<=3;
    if(next) next.disabled=rail.scrollLeft>=remaining-3;
    queued=false;
  };
  const requestUpdate=()=>{
    if(queued)return;
    queued=true;
    requestAnimationFrame(update);
  };
  const move=direction=>{
    const viewport=rail.getBoundingClientRect();
    const inset=parseFloat(getComputedStyle(rail).paddingLeft)||0;
    const anchor=viewport.left+inset;
    const offsets=cards.map(card=>card.getBoundingClientRect().left-anchor);
    let active=0,closest=Infinity;
    offsets.forEach((left,i)=>{
      const distance=Math.abs(left);
      if(distance<closest){closest=distance;active=i;}
    });
    const target=cards[Math.min(cards.length-1,Math.max(0,active+direction))];
    if(!target)return;
    const desired=rail.scrollLeft+target.getBoundingClientRect().left-anchor;
    rail.scrollTo({left:desired,behavior:reduced.matches?'auto':'smooth'});
  };
  prev?.addEventListener('click',()=>move(-1));
  next?.addEventListener('click',()=>move(1));
  rail.addEventListener('keydown',event=>{
    if(event.key!=='ArrowLeft'&&event.key!=='ArrowRight')return;
    event.preventDefault();
    move(event.key==='ArrowRight'?1:-1);
  });
  rail.addEventListener('scroll',requestUpdate,{passive:true});
  addEventListener('resize',requestUpdate,{passive:true});
  if('ResizeObserver' in window)new ResizeObserver(requestUpdate).observe(rail);
  update();
})();