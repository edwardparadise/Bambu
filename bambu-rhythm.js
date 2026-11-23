'use strict';
/* BAMBU editorial rhythm: different navigation for different content.
   All original content is present when JavaScript is unavailable. */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const motion = reduceMotion ? 'auto' : 'smooth';
  const makeButton=(text,cls,label)=>{
    const b=document.createElement('button');
    b.type='button';b.className=cls;b.textContent=text;
    if(label)b.setAttribute('aria-label',label);
    return b;
  };
  function enhanceStages(sectionSelector,listSelector,label){
    const section=document.querySelector(sectionSelector);
    const list=section?.querySelector(listSelector);
    if(!list)return;
    const items=[...list.children].filter(el=>el.tagName==='LI');
    if(items.length<2)return;
    const tabs=document.createElement('div');
    tabs.className='bambu-rhythm-tabs';
    tabs.setAttribute('role','group');
    tabs.setAttribute('aria-label',label+' stages');
    const tabsArray=items.map((el,i)=>{
      const heading=el.querySelector('h3')?.textContent?.trim()||'Stage '+(i+1);
      const b=makeButton(String(i+1).padStart(2,'0'),'bambu-rhythm-tab',label+': '+heading);
      b.setAttribute('aria-pressed','false');
      b.addEventListener('click',()=>show(i));
      b.addEventListener('keydown',ev=>{
        if(!['ArrowLeft','ArrowRight','Home','End'].includes(ev.key))return;
        ev.preventDefault();
        const to=ev.key==='Home'?0:ev.key==='End'?items.length-1:(i+(ev.key==='ArrowRight'?1:-1)+items.length)%items.length;
        show(to);tabsArray[to].focus();
      });
      tabs.append(b);return b;
    });
    const controls=document.createElement('div');
    controls.className='bambu-rhythm-stage-controls';
    const prev=makeButton('←','bambu-rhythm-arrow','Previous '+label+' stage');
    const next=makeButton('→','bambu-rhythm-arrow','Next '+label+' stage');
    const position=document.createElement('span');
    position.className='bambu-rhythm-position';
    position.setAttribute('aria-live','polite');
    controls.append(prev,position,next);
    let active=0;
    function show(i){
      active=Math.max(0,Math.min(items.length-1,i));
      items.forEach((item,j)=>{item.hidden=j!==active;});
      tabsArray.forEach((button,j)=>{button.setAttribute('aria-pressed',String(j===active));});
      prev.disabled=active===0;next.disabled=active===items.length-1;
      position.textContent=String(active+1).padStart(2,'0')+' / '+String(items.length).padStart(2,'0');
      const b=tabsArray[active],left=b.offsetLeft-tabs.offsetLeft-(tabs.clientWidth-b.offsetWidth)/2;
      tabs.scrollTo({left:Math.max(0,left),behavior:motion});
    }
    prev.addEventListener('click',()=>show(active-1));
    next.addEventListener('click',()=>show(active+1));
    list.before(tabs);
    list.after(controls);
    list.classList.add('bambu-rhythm-stages');
    section.classList.add('bambu-rhythm-enhanced');
    show(0);
  }
  function enhanceAccordion(){
    const old=document.querySelector('main.innovation-page .scheme-guide dl');
    if(!old)return;
    const rows=[...old.children].filter(el=>el.querySelector('dt,dd'));
    if(!rows.length)return;
    const accordion=document.createElement('div');
    accordion.className='bambu-rhythm-accordion';
    rows.forEach((row,i)=>{
      const dt=row.querySelector('dt'),dd=row.querySelector('dd');
      if(!dt||!dd)return;
      const title=dt.textContent.trim();
      const a=dt.querySelector('a');
      const detail=document.createElement('details');
      detail.className='bambu-rhythm-disclosure';
      if(i===0)detail.open=true;
      const summary=document.createElement('summary');
      const name=document.createElement('strong');name.textContent=title;
      const indicator=document.createElement('span');
      indicator.className='bambu-rhythm-disclosure-icon';
      indicator.setAttribute('aria-hidden','true');
      indicator.textContent='+';
      summary.append(name,indicator);
      const content=document.createElement('div');content.className='bambu-rhythm-disclosure-content';
      content.append(dd);
      if(a){
        a.textContent='View official assessment guidance ↗';
        a.className='bambu-rhythm-official-link';
        a.rel='noopener noreferrer';
        content.append(a);
      }
      detail.append(summary,content);
      accordion.append(detail);
    });
    old.replaceWith(accordion);
  }
  function enhanceRail(selector,label){
    const rail=document.querySelector(selector);
    if(!rail||rail.children.length<2)return;
    rail.classList.add('bambu-rhythm-rail');
    rail.setAttribute('role','region');
    rail.setAttribute('aria-label',label+' — swipe or use arrows to browse');
    rail.tabIndex=0;
    const controls=document.createElement('div');
    controls.className='bambu-rhythm-rail-controls';
    const title=document.createElement('span');title.className='bambu-rhythm-rail-cue';title.textContent='EXPLORE / SWIPE';
    const prev=makeButton('←','bambu-rhythm-arrow','Previous '+label);
    const next=makeButton('→','bambu-rhythm-arrow','Next '+label);
    controls.append(title,prev,next);
    rail.before(controls);
    function move(dir){
      const first=rail.firstElementChild;
      if(!first)return;
      const gap=parseFloat(getComputedStyle(rail).columnGap)||0;
      rail.scrollBy({left:dir*(first.getBoundingClientRect().width+gap),behavior:motion});
    }
    prev.addEventListener('click',()=>move(-1));
    next.addEventListener('click',()=>move(1));
    rail.addEventListener('keydown',ev=>{
      if(ev.target!==rail||!['ArrowLeft','ArrowRight'].includes(ev.key))return;
      ev.preventDefault();move(ev.key==='ArrowRight'?1:-1);
    });
    const update=()=>{
      prev.disabled=rail.scrollLeft<5;
      next.disabled=rail.scrollLeft+rail.clientWidth>=rail.scrollWidth-5;
    };
    rail.addEventListener('scroll',update,{passive:true});
    window.addEventListener('resize',update,{passive:true});
    requestAnimationFrame(update);
  }
  function init(){
    enhanceStages('main.innovation-page .materials-selection-process','.bambu-journey-steps','Specification');
    enhanceStages('main.commercial-fit-out-page .fitout-process','.fitout-sequence','Fit-out');
    enhanceAccordion();
    enhanceRail('main.approach-redesign .approach-service-grid','BAMBU services');
    enhanceRail('main.innovation-page .r2-responsibility-grid','Responsible design principles');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();