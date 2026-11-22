'use strict';
/* BAMBU: accessible, single-card horizontal stories and precise mobile stations. */
(() => {
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const stories=[
    {selector:'.bambu-company-principles__grid',name:'How we work'},
    {selector:'main[data-study="delivery-network"] .about-articles',name:'Delivery principles'},
    {selector:'.operator-roadmap',name:'Operator stages'}
  ];
  const setupStory=({selector,name})=>{
    const rail=document.querySelector(selector);
    if(!rail||rail.dataset.bambuPager)return;
    const cards=[...rail.children].filter(el=>el.matches('article,li'));
    if(cards.length<2)return;
    rail.dataset.bambuPager='true';
    rail.classList.add('bambu-pager-rail');
    rail.setAttribute('role','region');
    rail.setAttribute('aria-label',name+' carousel');
    rail.setAttribute('tabindex','0');
    const controls=document.createElement('div');
    controls.className='bambu-pager-controls';
    controls.setAttribute('role','group');
    controls.setAttribute('aria-label','Browse '+name.toLowerCase());
    controls.innerHTML='<span class="bambu-pager-count" aria-live="polite">01 / '+String(cards.length).padStart(2,'0')+'</span><div class="bambu-pager-arrows"><button type="button" data-bambu-story-prev aria-label="Previous slide">←</button><button type="button" data-bambu-story-next aria-label="Next slide">→</button></div>';
    rail.parentNode.insertBefore(controls,rail);
    const prev=controls.querySelector('[data-bambu-story-prev]');
    const next=controls.querySelector('[data-bambu-story-next]');
    const count=controls.querySelector('.bambu-pager-count');
    const active=()=>{
      const x=rail.getBoundingClientRect().left;
      let selected=0,smallest=Infinity;
      cards.forEach((c,i)=>{
        const distance=Math.abs(c.getBoundingClientRect().left-x);
        if(distance<smallest){smallest=distance;selected=i;}
      });
      return selected;
    };
    const update=()=>{
      const index=active();
      count.textContent=String(index+1).padStart(2,'0')+' / '+String(cards.length).padStart(2,'0');
      prev.disabled=index===0;
      next.disabled=index===cards.length-1;
    };
    const go=(i)=>{
      const card=cards[Math.max(0,Math.min(cards.length-1,i))];
      if(!card)return;
      const x=rail.scrollLeft+card.getBoundingClientRect().left-rail.getBoundingClientRect().left;
      rail.scrollTo({left:x,behavior:motion.matches?'instant':'smooth'});
    };
    prev.addEventListener('click',()=>go(active()-1));
    next.addEventListener('click',()=>go(active()+1));
    rail.addEventListener('keydown',e=>{
      if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight')return;
      e.preventDefault();go(active()+(e.key==='ArrowRight'?1:-1));
    });
    let queued=false;
    rail.addEventListener('scroll',()=>{
      if(queued)return;
      queued=true;requestAnimationFrame(()=>{queued=false;update();});
    },{passive:true});
    if('ResizeObserver' in window)new ResizeObserver(update).observe(rail);
    update();
  };
  stories.forEach(setupStory);

  /* Keep each tube station exactly as wide as its visible rail, not a guessed
     percentage of a particular iPhone model. */
  const route=document.getElementById('occupier-phases-rail');
  if(route){
    const size=()=>{
      route.style.setProperty('--bambu-station-width',Math.max(220,route.clientWidth)+'px');
    };
    size();
    if('ResizeObserver' in window)new ResizeObserver(size).observe(route);
    route.addEventListener('keydown',e=>{
      if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight')return;
      e.preventDefault();
      route.scrollBy({left:(e.key==='ArrowRight'?1:-1)*route.clientWidth,behavior:motion.matches?'instant':'smooth'});
    });
  }

})();
