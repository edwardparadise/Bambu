(() => {
  const scene = document.querySelector('.home-scene');
  const toggle = scene?.querySelector('[data-colour-toggle]');
  if (!toggle) return;
  let paused = false;
  toggle.addEventListener('click', () => {
    paused = !paused;
    scene.classList.toggle('sketch-paused', paused);
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.textContent = paused ? 'Play colours' : 'Pause colours';
  });
})();
