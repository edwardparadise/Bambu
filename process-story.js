(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-process-reel]').forEach(reel => {
    const frames = [...reel.querySelectorAll('.process-frame')];
    const selectors = [...reel.querySelectorAll('[data-reel-slide]')];
    const toggle = reel.querySelector('[data-reel-toggle]');
    let current = 0;
    let paused = reduced.matches;
    let inView = false;
    let timer;
    const stop = () => window.clearTimeout(timer);
    const schedule = () => {
      stop();
      if (!paused && inView && !document.hidden && !reel.matches(':hover, :focus-within')) {
        timer = window.setTimeout(() => show((current + 1) % frames.length), 6000);
      }
    };
    const show = index => {
      current = index;
      frames.forEach((frame, i) => { frame.hidden = i !== index; });
      selectors.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
      schedule();
    };
    const updateToggle = () => {
      toggle.textContent = paused ? 'Play' : 'Pause';
      toggle.setAttribute('aria-pressed', String(paused));
      toggle.setAttribute('aria-label', paused ? 'Play the process sequence' : 'Pause the process sequence');
    };
    selectors.forEach((button, i) => button.addEventListener('click', () => show(i)));
    toggle.addEventListener('click', () => { paused = !paused; updateToggle(); schedule(); });
    reel.addEventListener('mouseenter', stop);
    reel.addEventListener('mouseleave', schedule);
    reel.addEventListener('focusin', stop);
    reel.addEventListener('focusout', () => window.setTimeout(schedule, 0));
    document.addEventListener('visibilitychange', schedule);
    reduced.addEventListener('change', event => { if (event.matches) { paused = true; updateToggle(); schedule(); } });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => { inView = entries[0].isIntersecting; schedule(); }, { threshold: .1 }).observe(reel);
    } else { inView = true; }
    reel.classList.add('is-enhanced');
    updateToggle();
    show(0);
  });
  const openLinkedPhase = () => {
    if (!location.hash.startsWith('#phase-')) return;
    const details = document.getElementById(location.hash.slice(1))?.querySelector('details');
    if (details) details.open = true;
  };
  openLinkedPhase();
  window.addEventListener('hashchange', openLinkedPhase);
})();
