'use strict';
(() => {
 const root=document.querySelector('[data-bambu-hero-interactive]');
 if(!root)return;
 const range=root.querySelector('[data-bambu-hero-range]'), thumb=root.querySelector('[data-bambu-hero-thumb]'), stageLabel=root.querySelector('[data-hero-stage-label]'), world=root.querySelector('[data-bambu-hero-scrub]'), buttons=[...root.querySelectorAll('[data-bambu-hero-stage]')], wrap=range?.closest('.bambu-hero-range-wrap'), hit=wrap?.querySelector('[data-bambu-hero-hit]');
 if(!range||!thumb||!stageLabel||!world||!hit||buttons.length!==3)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const labels=['Sketch','CAD study','CGI'];
 const logo=document.querySelector('header img.unified-wordmark');
 // The standalone SVG spans 86 design units; the header master spans 540.
 let iconSize=32;
 function measureIcon(){const w=logo?.getBoundingClientRect().width;iconSize=w>0?w*86/540:32;wrap.style.setProperty('--bambu-b-size',iconSize.toFixed(3)+'px');}
 let value=100, demoFrame=0, demoTimer=0, interrupted=false, touchId=null, pointerId=null, lastStage=-1;
 function draw(next=value){
  value=Math.min(100,Math.max(0,Number(next)||0));
  root.style.setProperty('--hero-sketch',Math.max(0,1-value/50).toFixed(4));
  root.style.setProperty('--hero-cad',(value<=50?value/50:Math.max(0,2-value/50)).toFixed(4));
  root.style.setProperty('--hero-position',value.toFixed(2));
  const half=iconSize/2;
  const center='calc('+value.toFixed(2)+'% + '+(half-iconSize*value/100).toFixed(3)+'px)';
  wrap.style.setProperty('--bambu-b-center',center);
  thumb.style.left=center;
  // Restore the original full revolution over the slider travel. The icon
  // is upright at both endpoints; the rail stays masked behind its rotation.
  const angle=reduced.matches?0:value*3.6;
  const radians=angle*Math.PI/180;
  const extent=half*(Math.abs(Math.cos(radians))+Math.abs(Math.sin(radians)));
  const width=wrap.clientWidth;
  const available=Math.min(half+(width-iconSize)*value/100,half+(width-iconSize)*(100-value)/100);
  const scale=width>iconSize?Math.min(1,available/extent):1;
  thumb.style.setProperty('--bambu-b-rotation',angle.toFixed(1)+'deg');
  thumb.style.setProperty('--bambu-b-scale',scale.toFixed(4));
  wrap.style.setProperty('--bambu-b-gap-left',(extent*scale+1).toFixed(2)+'px');
  wrap.style.setProperty('--bambu-b-gap-right',(extent*scale+1).toFixed(2)+'px');
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
 function fromX(x){const box=hit.getBoundingClientRect();if(box.width>iconSize)draw((x-box.left-iconSize/2)*100/(box.width-iconSize));}
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
 measureIcon();draw(100);
 const resize=()=>{measureIcon();draw(value);};
 if(logo&&typeof ResizeObserver==='function'){const ro=new ResizeObserver(resize);ro.observe(logo);}
 window.addEventListener('resize',resize,{passive:true});
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

(() => {
  const word = document.querySelector('[data-home-character]');
  if (!word) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const words = ['character', 'life', 'warmth', 'purpose', 'light', 'clarity', 'texture', 'energy', 'balance', 'flexibility'];
  let index = 0;
  let interval;
  let fade;
  function updateRotation() {
    window.clearInterval(interval);
    window.clearTimeout(fade);
    word.classList.remove('is-fading');
    if (motion.matches) {
      index = 0;
      word.textContent = words[index];
      return;
    }
    if (document.hidden) return;
    interval = window.setInterval(() => {
      word.classList.add('is-fading');
      fade = window.setTimeout(() => {
        index = (index + 1) % words.length;
        word.textContent = words[index];
        word.classList.remove('is-fading');
      }, 200);
    }, 4200);
  }
  motion.addEventListener('change', updateRotation);
  document.addEventListener('visibilitychange', updateRotation);
  updateRotation();
})();
