'use strict';
/* A single editorial homepage cue and native anchored scrolling. */
(() => {
 const cue=document.querySelector('.bambu-home .bambu-wayfinding__link');
 if(!cue)return;
 const target=document.querySelector(cue.getAttribute('href'));
 if(!target)return;
 cue.addEventListener('click',()=>{
   target.setAttribute('tabindex','-1');
   requestAnimationFrame(()=>target.focus({preventScroll:true}));
 });
})();
