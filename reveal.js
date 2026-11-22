'use strict';
/* A single, gentle demonstration on first view. The visitor takes over
   permanently as soon as a control or the image is touched. */
(() => {
  const study = document.querySelector('[data-reveal]');
  if (!study) return;
  const viewport = study.querySelector('.reveal-viewport');
  const range = study.querySelector('.reveal-range');
  const label = study.querySelector('.reveal-image-label');
  const description = study.querySelector('[data-reveal-explainer]');
  const caption = study.querySelector('[data-stage-copy]');
  const buttons = [...study.querySelectorAll('[data-reveal-stage]')];
  if (!viewport || !range || !label || !description) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const stages = [
    ['01 / Sketch','Explore your brief, the possibilities and the character of the space.','01 / Bring your ideas into focus.'],
    ['02 / CAD study','Coordinate technical design, budget, programme and approval requirements.','02 / Coordinate the detail and agree the programme.'],
    ['03 / CGI','Visualise the finish, then deliver a workplace that functions on Monday morning.','03 / Deliver to an exceptional finish.']
  ];
  let position = 0, active = -1, drawFrame = 0, pointerId = null;
  let played = false, stopped = false, visible = false;
  let autoFrame = 0, delayTimer = 0, startTime = null;

  const render = () => {
    drawFrame = 0;
    study.style.setProperty('--sketch-opacity',String(Math.max(0,1-position/50)));
    study.style.setProperty('--model-opacity',String(Math.min(1,2-position/50)));
    range.value = String(position);
    const stage = Math.max(0,Math.min(2,Math.round(position/50)));
    study.classList.toggle('r2-lights-on',position===100);
    if (stage === active) return;
    active = stage;
    label.textContent = stages[stage][0];
    description.textContent = stages[stage][1];
    if (caption) {
      caption.textContent = stages[stage][2];
      if (caption.animate && !reduced.matches) caption.animate([{opacity:.45},{opacity:1}],{duration:300});
    }
    range.setAttribute('aria-valuetext', stages[stage][0].slice(5));
    buttons.forEach((button,i) => button.setAttribute('aria-pressed',String(i===stage)));
  };
  const setPosition = value => {
    position = Math.max(0,Math.min(100,Math.round(value)));
    if (!drawFrame) drawFrame = requestAnimationFrame(render);
  };
  const stopAuto = () => {
    stopped = true;
    clearTimeout(delayTimer);
    cancelAnimationFrame(autoFrame);
    study.classList.remove('is-auto-demonstrating');
  };
  const startAuto = () => {
    if (played || stopped || reduced.matches || document.hidden || !visible) return;
    played = true;
    study.classList.add('is-auto-demonstrating');
    delayTimer = setTimeout(() => {
      if (stopped || document.hidden || !visible) {
        study.classList.remove('is-auto-demonstrating');
        return;
      }
      const advance = time => {
        if (stopped || document.hidden || !visible || reduced.matches) {
          study.classList.remove('is-auto-demonstrating');
          return;
        }
        if (startTime === null) startTime = time;
        const t = Math.min(1,(time-startTime)/9300);
        const eased = t*t*(3-2*t);
        setPosition(eased*100);
        if (t < 1) autoFrame = requestAnimationFrame(advance);
        else study.classList.remove('is-auto-demonstrating');
      };
      autoFrame = requestAnimationFrame(advance);
    },650);
  };
  buttons.forEach(button => button.addEventListener('click',() => {
    stopAuto();
    setPosition(Number(button.dataset.revealStage));
  }));
  range.addEventListener('pointerdown',stopAuto,{passive:true});
  range.addEventListener('touchstart',stopAuto,{passive:true});
  range.addEventListener('input',() => {
    stopAuto();
    setPosition(Number(range.value));
  });
  const scrub = event => {
    const bounds=viewport.getBoundingClientRect();
    if (bounds.width) setPosition((event.clientX-bounds.left)*100/bounds.width);
  };
  viewport.addEventListener('pointerdown',event => {
    if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
    stopAuto();
    pointerId=event.pointerId;
    try { viewport.setPointerCapture(pointerId); } catch { /* Pointer may have ended. */ }
    scrub(event);
  });
  viewport.addEventListener('pointermove',event => {
    if (event.pointerId === pointerId) scrub(event);
  });
  const release = () => { pointerId = null; };
  viewport.addEventListener('pointerup',release);
  viewport.addEventListener('pointercancel',release);
  viewport.addEventListener('lostpointercapture',release);
  viewport.addEventListener('keydown',event => {
    const values={ArrowLeft:position-5,ArrowRight:position+5,Home:0,End:100};
    if (!Object.prototype.hasOwnProperty.call(values,event.key)) return;
    event.preventDefault();
    stopAuto();
    setPosition(values[event.key]);
  });
  range.addEventListener('keydown',stopAuto);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible=entries.some(entry => entry.isIntersecting);
      if (visible) startAuto();
    },{threshold:.3}).observe(study);
  } else {
    visible=true;
    startAuto();
  }
  document.addEventListener('visibilitychange',() => {
    if (document.hidden && played) stopAuto();
    else if (!document.hidden) startAuto();
  });
  reduced.addEventListener('change',event => { if (event.matches) stopAuto(); });
  render();
})();