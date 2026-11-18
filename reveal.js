'use strict';

(() => {
  const study = document.querySelector('[data-reveal]');
  if (!study) return;

  const viewport = study.querySelector('.reveal-viewport');
  const range = study.querySelector('.reveal-range');
  const label = study.querySelector('.reveal-image-label');
  const caption = study.querySelector('[data-reveal-explainer]');
  const buttons = Array.from(study.querySelectorAll('[data-reveal-stage]'));
  const stages = [
    ['01 / Sketch', 'A line drawing picks out the reception counter, shared table and glazing.'],
    ['02 / Model study', 'A tonal drawing separates the main volumes in the same view.'],
    ['03 / CGI', 'The CGI adds timber, upholstery and lighting to the composition.']
  ];
  let activeStage = -1;
  let position = Number(range.value);
  let pointerId = null;
  let frame = 0;

  function draw() {
    frame = 0;
    study.style.setProperty('--sketch-opacity', String(Math.max(0, 1 - position / 50)));
    study.style.setProperty('--model-opacity', String(Math.min(1, 2 - position / 50)));
    range.value = String(position);
    const next = Math.round(position / 50);
    if (next === activeStage) return;
    activeStage = next;
    const [name, description] = stages[next];
    label.textContent = name;
    caption.textContent = description;
    range.setAttribute('aria-valuetext', name.slice(5));
    buttons.forEach((button, index) => button.setAttribute('aria-pressed', String(index === next)));
  }

  function setPosition(next) {
    position = Math.round(Math.min(100, Math.max(0, next)));
    if (!frame) frame = requestAnimationFrame(draw);
  }

  buttons.forEach(button => {
    button.addEventListener('click', () => setPosition(Number(button.dataset.revealStage)));
  });
  range.addEventListener('input', () => setPosition(Number(range.value)));

  function scrub(event) {
    const rect = viewport.getBoundingClientRect();
    if (rect.width) setPosition((event.clientX - rect.left) * 100 / rect.width);
  }

  viewport.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    pointerId = event.pointerId;
    viewport.setPointerCapture(pointerId);
    scrub(event);
  });
  viewport.addEventListener('pointermove', event => {
    if (event.pointerId === pointerId) scrub(event);
  });
  viewport.addEventListener('lostpointercapture', () => { pointerId = null; });
  viewport.addEventListener('keydown', event => {
    const shortcuts = { ArrowLeft: position - 5, ArrowRight: position + 5, Home: 0, End: 100 };
    if (!Object.hasOwn(shortcuts, event.key)) return;
    event.preventDefault();
    setPosition(shortcuts[event.key]);
  });
  draw();
})();
