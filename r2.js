'use strict';(()=>{const el=document.querySelector('.r2-audience-grid');if(!el)return;if(!('IntersectionObserver' in window)){el.classList.add('r2-inview');return}const ob=new IntersectionObserver(e=>{if(e.some(x=>x.isIntersecting)){el.classList.add('r2-inview');ob.disconnect()}},{threshold:.3});ob.observe(el)})();
const phaseMap = document.querySelector('.r2-tube');
if (phaseMap && matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const phases = [...phaseMap.querySelectorAll('details')];
  for (const phase of phases) {
    phase.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'mouse') return;
      for (const item of phases) item.open = item === phase;
    });
  }
}
