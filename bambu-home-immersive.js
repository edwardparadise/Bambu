'use strict';
(() => {
 const root=document.querySelector('[data-bambu-hero-interactive]');
 if(!root)return;
 const range=root.querySelector('[data-bambu-hero-range]'), thumb=root.querySelector('[data-bambu-hero-thumb]'), stageLabel=root.querySelector('[data-hero-stage-label]'), world=root.querySelector('[data-bambu-hero-scrub]'), buttons=[...root.querySelectorAll('[data-bambu-hero-stage]')], wrap=range?.closest('.bambu-hero-range-wrap'), hit=wrap?.querySelector('[data-bambu-hero-hit]');
 if(!range||!thumb||!stageLabel||!world||!hit||buttons.length!==3)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const labels=['Sketch','CAD study','CGI'];
 let value=100, demoFrame=0, demoTimer=0, interrupted=false, touchId=null, pointerId=null, lastStage=-1;
 function draw(next=value){
  value=Math.min(100,Math.max(0,Number(next)||0));
  root.style.setProperty('--hero-sketch',Math.max(0,1-value/50).toFixed(4));
  root.style.setProperty('--hero-cad',(value<=50?value/50:Math.max(0,2-value/50)).toFixed(4));
  root.style.setProperty('--hero-position',value.toFixed(2));
  thumb.style.left='calc('+value.toFixed(2)+'% + '+(20-.4*value).toFixed(2)+'px)';
  thumb.style.setProperty('--bambu-b-rotation',(value*3.6).toFixed(1)+'deg');
  range.value=String(Math.round(value));
  const s=value<25?0:value<75?1:2;
  if(s!==lastStage){
   lastStage=s;buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(s===i)));
   stageLabel.textContent=['01 / SKETCH','02 / CAD','03 / CGI'][s];
   range.setAttribute('aria-valuetext',labels[s]);root.dataset.currentVisual=['sketch','cad','cgi'][s];
  }
 }
 function stop(){
  interrupted=true;clearTimeout(demoTimer);cancelAnimationFrame(demoFrame);demoFrame=0;
 }
 function select(x){stop();draw(x);}
 function fromX(x){const box=hit.getBoundingClientRect();if(box.width>40)draw((x-box.left-20)*100/(box.width-40));}
 function release(){touchId=null;pointerId=null;wrap.classList.remove('is-dragging');}
 // A dedicated HTML surface (not a native range thumb) receives the first touch.
 hit.addEventListener('touchstart',e=>{
  if(touchId!==null||!e.changedTouches.length)return;
  e.preventDefault();stop();const t=e.changedTouches[0];touchId=t.identifier;wrap.classList.add('is-dragging');fromX(t.clientX);
 },{passive:false});
 hit.addEventListener('touchmove',e=>{
  const t=[...e.changedTouches].find(t=>t.identifier===touchId);if(!t)return;
  e.preventDefault();fromX(t.clientX);
 },{passive:false});
 for(const kind of ['touchend','touchcancel'])hit.addEventListener(kind,e=>{
  const t=[...e.changedTouches].find(t=>t.identifier===touchId);if(!t)return;
  if(e.cancelable)e.preventDefault();if(kind==='touchend')fromX(t.clientX);release();
 },{passive:false});
 hit.addEventListener('pointerdown',e=>{
  if(e.pointerType==='touch'||!e.isPrimary||e.button!==0)return;
  e.preventDefault();stop();pointerId=e.pointerId;wrap.classList.add('is-dragging');
  try{hit.setPointerCapture(e.pointerId);}catch{}fromX(e.clientX);
 });
 window.addEventListener('pointermove',e=>{if(pointerId===e.pointerId&&pointerId!==null){e.preventDefault();fromX(e.clientX);}},{passive:false});
 for(const kind of ['pointerup','pointercancel'])window.addEventListener(kind,e=>{if(pointerId!==null&&pointerId===e.pointerId){if(kind==='pointerup')fromX(e.clientX);release();}});
 hit.addEventListener('lostpointercapture',e=>{if(pointerId===e.pointerId)release();});
 range.addEventListener('focus',stop);range.addEventListener('input',()=>select(range.value));
 buttons.forEach(b=>b.addEventListener('click',()=>select(Number(b.dataset.bambuHeroStage))));
 let worldPointer=null;
 world.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'||!e.isPrimary||e.button!==0)return;stop();worldPointer=e.pointerId;try{world.setPointerCapture(e.pointerId);}catch{}const b=world.getBoundingClientRect();if(b.width)draw((e.clientX-b.left)*100/b.width);});
 world.addEventListener('pointermove',e=>{if(worldPointer!==e.pointerId)return;const b=world.getBoundingClientRect();if(b.width)draw((e.clientX-b.left)*100/b.width);});
 for(const kind of ['pointerup','pointercancel','lostpointercapture'])world.addEventListener(kind,()=>{worldPointer=null;});
 draw(100);
 // Show one short, interruptible demonstration after the brand-opening overlay is gone.
 function startDemo(){
  if(interrupted||reduced.matches||document.hidden||!hit.getClientRects().length)return;
  if(document.documentElement.classList.contains('intro-running')){demoTimer=setTimeout(startDemo,100);return;}
  let seen=false;try{seen=sessionStorage.getItem('bambu-slider-demo-v3')==='1';}catch{}
  if(seen)return;
  try{sessionStorage.setItem('bambu-slider-demo-v3','1');}catch{}
  const begin=performance.now(), ease=t=>t*t*(3-2*t);
  function frame(now){
   if(interrupted||document.hidden||reduced.matches){stop();return;}
   const elapsed=now-begin;
   if(elapsed<1100)draw(100*(1-ease(elapsed/1100)));
   else if(elapsed<1550)draw(0);
   else if(elapsed<3200)draw(100*ease((elapsed-1550)/1650));
   else {draw(100);demoFrame=0;return;}
   demoFrame=requestAnimationFrame(frame);
  }
  demoFrame=requestAnimationFrame(frame);
 }
 function schedule(){demoTimer=setTimeout(startDemo,400);}
 if(document.readyState==='complete')schedule();else window.addEventListener('load',schedule,{once:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
 window.addEventListener('pagehide',stop,{once:true});
})();
