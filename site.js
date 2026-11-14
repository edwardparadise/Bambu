'use strict';

const comparison = document.querySelector('.comparison');
const controls = document.querySelector('.compare-controls');

if (comparison && controls) {
  const slider = controls.querySelector('input');
  const update = () => {
    const sketch = Number(slider.value);
    comparison.style.setProperty('--reveal', sketch + '%');
    slider.setAttribute('aria-valuetext', sketch + '% sketch, ' + (100 - sketch) + '% render');
  };
  slider.addEventListener('input', update);
  for (const choice of controls.querySelectorAll('[data-position]')) {
    choice.addEventListener('click', () => {
      slider.value = choice.dataset.position;
      update();
    });
  }
  controls.hidden = false;
  update();

  let pointer = null;
  const move = event => {
    const bounds = comparison.getBoundingClientRect();
    slider.value = Math.round(100 * (event.clientX - bounds.left) / bounds.width);
    update();
  };
  comparison.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    pointer = event.pointerId;
    comparison.setPointerCapture(pointer);
    move(event);
  });
  comparison.addEventListener('pointermove', event => {
    if (event.pointerId === pointer) move(event);
  });
  comparison.addEventListener('lostpointercapture', () => { pointer = null; });
  comparison.style.touchAction = 'pan-y';
}
