'use strict';
/* Full-bleed BAMBU opening: accessible, visitor-controlled progression.
   The static default is the finished CGI; no autoplay or artificial delay. */
(() => {
  const hero=document.querySelector('.bambu-morph-hero');
  if(!hero)return;
  const range=hero.querySelector('[data-morph-range]');
  const buttons=[...hero.querySelectorAll('[data-morph-stage]')];
  const title=hero.querySelector('[data-morph-current]');
  const visual=hero.querySelector('.bambu-hero-morph');
  if(!range||buttons.length!==3||!visual)return;
  const captions=['01 / Sketch','02 / CAD study','03 / CGI'];
  let progress=100;
  const update=(value)=>{
    progress=Math.max(0,Math.min(100,Number(value)||0));
    const sketch=progress<=50?1-progress/50:0;
    const cad=progress<=50?progress/50:2-progress/50;
    const cgi=progress<=50?0:(progress-50)/50;
    hero.style.setProperty('--morph-sketch',sketch.toFixed(3));
    hero.style.setProperty('--morph-cad',cad.toFixed(3));
    hero.style.setProperty('--morph-cgi',cgi.toFixed(3));
    range.value=String(Math.round(progress));
    range.style.setProperty('--morph-progress',progress+'%');
    const stage=Math.max(0,Math.min(2,Math.round(progress/50)));
    buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===stage)));
    range.setAttribute('aria-valuetext',captions[stage].replace(/^\d+ \/ /,''));
    if(title&&title.textContent!==captions[stage])title.textContent=captions[stage];
  };
  buttons.forEach(btn=>btn.addEventListener('click',()=>{
    const p=Number(btn.dataset.morphStage);
    update(p);
  }));
  range.addEventListener('input',()=>update(range.value));
  // On desktop the photograph itself can be scrubbed horizontally.
  // Mobile retains native page scrolling; buttons and range are touch-friendly.
  let pointer=null;
  const wide=()=>matchMedia('(min-width:960px)').matches;
  visual.style.pointerEvents='auto';
  visual.addEventListener('pointerdown',e=>{
    if(!wide()||!e.isPrimary||(e.pointerType==='mouse'&&e.button!==0))return;
    const rect=visual.getBoundingClientRect();
    pointer=e.pointerId;
    try{visual.setPointerCapture(pointer)}catch{}
    update(((e.clientX-rect.left)/rect.width)*100);
  });
  visual.addEventListener('pointermove',e=>{
    if(pointer!==e.pointerId||!wide())return;
    const rect=visual.getBoundingClientRect();
    update(((e.clientX-rect.left)/rect.width)*100);
  });
  const release=()=>{pointer=null};
  visual.addEventListener('pointerup',release);
  visual.addEventListener('pointercancel',release);
  visual.addEventListener('lostpointercapture',release);
  update(100);
})();