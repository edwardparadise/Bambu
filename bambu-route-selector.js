'use strict';
/* BAMBU coloured interchange navigation: enhancement only.
   The operator carousel remains swipeable and functional without this guide. */
(() => {
  const rail=document.querySelector('main.r2-operators .operator-roadmap.bambu-pager-rail');
  if(!rail)return;
  const cards=[...rail.children].filter(node=>node.matches('li'));
  const controls=rail.previousElementSibling;
  if(!controls?.classList.contains('bambu-pager-controls')||cards.length!==5)return;
  const labels=['Landlord','Model','Services','Options','Deliver'];
  const descriptions=['Landlord discussion','Test the operating model','Review the building services','Refine the offer and programme','Design, build and hand over'];
  const tones=['people','commercial','delivery','design','delivery'];
  const group=document.createElement('div');
  group.className='bambu-operator-interchange';
  group.setAttribute('role','group');
  group.setAttribute('aria-label','Jump between the five operator workstreams');
  const buttons=labels.map((label,i)=>{
    const button=document.createElement('button');
    button.type='button';
    button.className='bambu-interchange-stop bambu-track-'+tones[i];
    button.dataset.bambuStep=String(i);
    button.setAttribute('aria-label','Go to workstream '+(i+1)+': '+descriptions[i]);
    button.setAttribute('aria-pressed','false');
    button.innerHTML='<span class="bambu-interchange-stop__node" aria-hidden="true">'+String(i+1).padStart(2,'0')+'</span><span class="bambu-interchange-stop__label" aria-hidden="true">'+label+'</span>';
    group.appendChild(button);
    return button;
  });
  rail.parentNode.insertBefore(group,controls);
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const index=()=>{
    const x=rail.getBoundingClientRect().left;
    let nearest=0,distance=Infinity;
    cards.forEach((card,i)=>{
      const delta=Math.abs(card.getBoundingClientRect().left-x);
      if(delta<distance){distance=delta;nearest=i;}
    });
    return nearest;
  };
  const sync=()=>{
    const active=index();
    buttons.forEach((button,i)=>{
      const selected=i===active;
      button.setAttribute('aria-pressed',String(selected));
      if(selected)button.setAttribute('aria-current','step');
      else button.removeAttribute('aria-current');
    });
    group.style.setProperty('--bambu-active-station',String(active));
  };
  buttons.forEach((button,i)=>button.addEventListener('click',()=>{
    const x=rail.scrollLeft+cards[i].getBoundingClientRect().left-rail.getBoundingClientRect().left;
    rail.scrollTo({left:x,behavior:reduced.matches?'instant':'smooth'});
    if(reduced.matches)sync();
  }));
  let scheduled=false;
  rail.addEventListener('scroll',()=>{
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;sync();});
  },{passive:true});
  window.addEventListener('resize',sync,{passive:true});
  sync();
})();
