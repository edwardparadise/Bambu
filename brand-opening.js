'use strict';
(() => {
 const overlay=document.querySelector('.bambu-opening'), flight=overlay?.querySelector('.opening-flight'), target=document.querySelector('.masthead .unified-wordmark');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 if(!overlay||!flight||!target||document.hidden||reduced.matches||location.hash)return;
 const root=document.documentElement,listeners=new AbortController(),timers=[];
 const behind=[...document.body.children].filter(el=>el!==overlay&&!['SCRIPT','STYLE'].includes(el.tagName)), previous=behind.map(el=>el.inert);
 let complete=false,travelling=false,animation;
 const center=()=>{const width=Math.min(innerWidth*.86,1080),height=width*42/231,x=(innerWidth-width)/2,y=(innerHeight-height)/2;flight.style.width=width+'px';flight.style.transform=`translate(${x}px,${y}px)`;return{width,x,y}};
 const finish=()=>{if(complete)return;complete=true;timers.forEach(clearTimeout);listeners.abort();animation?.cancel();overlay.hidden=true;root.classList.remove('brand-revealing','intro-running','intro-travelling');behind.forEach((el,i)=>el.inert=previous[i])};
 const land=()=>{if(complete)return;travelling=true;const start=center(),box=target.getBoundingClientRect(),scale=(box.width*231/422)/start.width;root.classList.add('intro-travelling');animation=flight.animate([{transform:`translate(${start.x}px,${start.y}px) scale(1)`},{transform:`translate(${box.left}px,${box.top}px) scale(${scale})`}],{duration:1100,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'});animation.finished.then(finish).catch(()=>{})};
 behind.forEach(el=>el.inert=true);root.classList.add('brand-revealing','intro-running');overlay.hidden=false;center();requestAnimationFrame(()=>overlay.classList.add('opening-active'));
 timers.push(setTimeout(land,5100),setTimeout(finish,8000));
 overlay.querySelector('.opening-skip').addEventListener('click',finish,{signal:listeners.signal});
 addEventListener('keydown',e=>{if(e.key==='Escape')finish()},{signal:listeners.signal});
 addEventListener('resize',()=>{if(travelling)finish();else center()},{signal:listeners.signal});
 addEventListener('pagehide',finish,{once:true,signal:listeners.signal});
 reduced.addEventListener('change',e=>{if(e.matches)finish()},{signal:listeners.signal});
})();
