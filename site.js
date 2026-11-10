'use strict';

const slider = document.getElementById('reveal');
const comparison = document.getElementById('comparison');
function updateComparison() {
  const sketch = Number(slider.value);
  comparison.style.setProperty('--split', sketch + '%');
  slider.setAttribute('aria-valuetext', sketch + '% concept sketch, ' + (100 - sketch) + '% finished render');
}
slider.addEventListener('input', updateComparison);
updateComparison();
slider.hidden = false;
document.getElementById('comparison-help').hidden = false;
comparison.classList.add('interactive');

// Align the visual divider with the pointer across the entire image.
let activePointer = null;
function moveDivider(event) {
  const bounds = comparison.getBoundingClientRect();
  slider.value = Math.round(100 * (event.clientX - bounds.left) / bounds.width);
  updateComparison();
}
slider.addEventListener('pointerdown', (event) => {
  if (!event.isPrimary || event.button !== 0) return;
  event.preventDefault();
  slider.focus({preventScroll: true});
  activePointer = event.pointerId;
  slider.setPointerCapture(activePointer);
  moveDivider(event);
});
slider.addEventListener('pointermove', (event) => {
  if (event.pointerId === activePointer) moveDivider(event);
});
slider.addEventListener('lostpointercapture', () => { activePointer = null; });
