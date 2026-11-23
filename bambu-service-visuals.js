'use strict';
/* Native scroll-snap remains available even if this enhancement does not run. */
(() => {
  function init() {
    document.querySelectorAll('main.bambu-service-redesign .bambu-visual-gallery').forEach(rail => {
      const controls=document.createElement('div');
      controls.className='bambu-visual-gallery-controls';
      const cue=document.createElement('span');
      cue.textContent='SWIPE TO EXPLORE';
      cue.className='bambu-visual-gallery-cue';
      function make(label,text){
        const b=document.createElement('button');
        b.type='button';b.setAttribute('aria-label',label);
        b.className='bambu-visual-gallery-arrow';b.textContent=text;
        return b;
      }
      const prev=make('Previous reference','←');
      const next=make('Next reference','→');
      controls.append(cue,prev,next);
      rail.before(controls);
      function step(dir){
        const first=rail.querySelector('article');
        if(!first)return;
        const gap=parseFloat(getComputedStyle(rail).columnGap)||0;
        const amount=first.getBoundingClientRect().width+gap;
        rail.scrollBy({left:dir*amount,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
      }
      const update=()=>{
        prev.disabled=rail.scrollLeft<6;
        next.disabled=rail.scrollLeft+rail.clientWidth>=rail.scrollWidth-6;
      };
      prev.addEventListener('click',()=>step(-1));
      next.addEventListener('click',()=>step(1));
      rail.addEventListener('keydown',e=>{
        if(e.target!==rail||!['ArrowLeft','ArrowRight'].includes(e.key))return;
        e.preventDefault();step(e.key==='ArrowRight'?1:-1);
      });
      rail.addEventListener('scroll',update,{passive:true});
      window.addEventListener('resize',update,{passive:true});
      requestAnimationFrame(update);
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();