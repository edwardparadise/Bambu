'use strict';
/* Five-stage route: one station at a time, with a short introductory tour.
   Any user interaction permanently hands control to the visitor. */
(() => {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  for (const controls of document.querySelectorAll('[data-process-controls]')) {
    const rail=document.getElementById(controls.dataset.processControls);
    if (!rail) continue;
    const prev=controls.querySelector('[data-process-prev]');
    const next=controls.querySelector('[data-process-next]');
    const counter=controls.querySelector('[data-process-counter]');
    const stations=[...rail.querySelectorAll('.tube-stations > li')];
    if (stations.length < 2) continue;
    let timer=0, autoStarted=false, autoStopped=false, visible=false, autoScrolling=false;
    const index=() => {
      const width=rail.clientWidth||1;
      return Math.max(0,Math.min(stations.length-1,Math.round(rail.scrollLeft/width)));
    };
    const update=() => {
      const i=index();
      if (prev) prev.disabled=i===0;
      if (next) next.disabled=i===stations.length-1;
      if (counter) counter.textContent=String(i+1).padStart(2,'0')+' / '+String(stations.length).padStart(2,'0');
    };
    const moveTo=i => {
      rail.scrollTo({
        left:Math.max(0,Math.min(stations.length-1,i))*rail.clientWidth,
        behavior:reduced.matches?'instant':'smooth'
      });
    };
    const stopAuto=() => {
      autoStopped=true;
      clearTimeout(timer);
      controls.classList.remove('bambu-route-touring');
    };
    const move=direction => {
      stopAuto();
      moveTo(index()+direction);
    };
    prev?.addEventListener('click',() => move(-1));
    next?.addEventListener('click',() => move(1));
    // Horizontal swipe, taps, wheel, keyboard and focus all stop the tour.
    rail.addEventListener('pointerdown',stopAuto,{passive:true});
    rail.addEventListener('touchstart',stopAuto,{passive:true});
    rail.addEventListener('wheel',stopAuto,{passive:true});
    rail.addEventListener('keydown',stopAuto);
    rail.addEventListener('focusin',stopAuto);
    controls.addEventListener('focusin',stopAuto);
    const nextStop=() => {
      clearTimeout(timer);
      if (autoStopped || !visible || document.hidden || reduced.matches) return;
      const current=index();
      if (current >= stations.length-1) {
        controls.classList.remove('bambu-route-touring');
        return;
      }
      timer=setTimeout(() => {
        if (autoStopped || !visible || document.hidden) return;
        autoScrolling=true;
        moveTo(index()+1);
        timer=setTimeout(() => {
          autoScrolling=false;
          if (!autoStopped) nextStop();
        },950);
      },4300);
    };
    const begin=() => {
      if (!visible || autoStarted || autoStopped || reduced.matches || document.hidden) return;
      autoStarted=true;
      controls.classList.add('bambu-route-touring');
      nextStop();
    };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        visible=entries.some(entry => entry.isIntersecting);
        if (visible) begin();
        else if (autoStarted) stopAuto();
      },{threshold:.38}).observe(rail);
    } else {
      visible=true;
      begin();
    }
    document.addEventListener('visibilitychange',() => {
      if (document.hidden && autoStarted) stopAuto();
      else begin();
    });
    reduced.addEventListener('change',event => { if (event.matches) stopAuto(); });
    let queued=false;
    rail.addEventListener('scroll',() => {
      if (queued) return;
      queued=true;
      requestAnimationFrame(() => {
        queued=false;
        update();
      });
    },{passive:true});
    // A fully-visible route follows just the rail; no whole-page scrolling.
    if ('ResizeObserver' in window) new ResizeObserver(update).observe(rail);
    update();
  }
})();