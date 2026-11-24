'use strict';
/* Full-bleed BAMBU idea-to-image experience.
   Same interior camera viewpoint at all three stages. The finished CGI
   appears immediately; the visitor can scrub or select any stage. */
(() => {
  const root = document.querySelector('[data-bambu-hero-interactive]');
  if (!root) return;
  const range = root.querySelector('[data-bambu-hero-range]');
  const stageLabel = root.querySelector('[data-hero-stage-label]');
  const thumb = root.querySelector('[data-bambu-hero-thumb]');
  const world = root.querySelector('[data-bambu-hero-scrub]');
  const buttons = [...root.querySelectorAll('[data-bambu-hero-stage]')];
  if (!range || !world || !stageLabel || !thumb || buttons.length !== 3) return;

  const stages = [
    ['01 / SKETCH', 'Sketch'],
    ['02 / CAD', 'CAD study'],
    ['03 / CGI', 'CGI']
  ];
  let position = 100;
  let pending = false;
  let activePointer = null;

  const draw = () => {
    pending = false;
    const sketch = Math.max(0, 1 - position / 50);
    const cad = position <= 50 ? position / 50 : Math.max(0, 2 - position / 50);
    root.style.setProperty('--hero-sketch', sketch.toFixed(4));
    root.style.setProperty('--hero-cad', cad.toFixed(4));
    root.style.setProperty('--hero-position', position.toFixed(1));
    // The same open-cut B as the BAMBU wordmark replaces the conventional dot.
    // Its angle follows slider position: rightwards = clockwise; leftwards =
    // anticlockwise. Position uses the native range thumb's usable track span.
    const width = range.getBoundingClientRect().width;
    if (width > 0) {
      const half = 20;
      thumb.style.left = (half + Math.max(0, width - half * 2) * position / 100).toFixed(2) + 'px';
    }
    thumb.style.setProperty('--bambu-b-rotation', (position * 3.6).toFixed(1) + 'deg');

    range.value = String(position);
    const which = position < 25 ? 0 : position < 75 ? 1 : 2;
    buttons.forEach((b,i) => b.setAttribute('aria-pressed', String(i === which)));
    stageLabel.textContent = stages[which][0];
    range.setAttribute('aria-valuetext', stages[which][1]);
    root.dataset.currentVisual = ['sketch','cad','cgi'][which];
  };
  const setPosition = value => {
    position = Math.min(100,Math.max(0,Number(value) || 0));
    if (!pending) {
      pending = true;
      requestAnimationFrame(draw);
    }
  };

  buttons.forEach(b => b.addEventListener('click', () => {
    setPosition(Number(b.dataset.bambuHeroStage));
  }));
  range.addEventListener('input', () => setPosition(range.value));
  const wrap = range.closest('.bambu-hero-range-wrap');
  range.addEventListener('pointerdown', () => wrap?.classList.add('is-dragging'));
  for (const event of ['pointerup', 'pointercancel', 'blur', 'lostpointercapture']) {
    range.addEventListener(event, () => wrap?.classList.remove('is-dragging'));
  }
  addEventListener('resize', draw, {passive:true});


  const scrub = e => {
    const box = world.getBoundingClientRect();
    if (box.width) setPosition((e.clientX - box.left) * 100 / box.width);
  };
  world.addEventListener('pointerdown', e => {
    if (!e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0)) return;
    activePointer = e.pointerId;
    try { world.setPointerCapture(e.pointerId); } catch { /* no capture support */ }
    scrub(e);
  });
  world.addEventListener('pointermove', e => {
    if (activePointer === e.pointerId) scrub(e);
  });
  const release = () => { activePointer = null; };
  world.addEventListener('pointerup', release);
  world.addEventListener('pointercancel', release);
  world.addEventListener('lostpointercapture', release);
  draw();
})();