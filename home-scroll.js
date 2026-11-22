'use strict';
/* The homepage has one deliberate scroll destination, with no layout shift. */
(() => {
 const cue=document.querySelector('.bambu-home .bambu-wayfinding__link');
 if(!cue)return;
 const target=document.querySelector(cue.getAttribute('href'));
 if(!target)return;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 cue.addEventListener('click',event=>{
   event.preventDefault();
   history.pushState(null,'',cue.getAttribute('href'));
   target.setAttribute('tabindex','-1');
   target.scrollIntoView({behavior:reduce.matches?'instant':'smooth',block:'start'});
   target.focus({preventScroll:true});
 });
})();
