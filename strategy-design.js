const strategyProcess = document.querySelector('[data-strategy-process]');
if (strategyProcess) {
  const rail = strategyProcess.querySelector('.strategy-rail');
  const tabs = [...rail.querySelectorAll('button')];
  const panels = tabs.map(tab => document.getElementById(`strategy-stage-${tab.dataset.stage}`));

  function selectStage(selected, focus = false) {
    tabs.forEach((tab, index) => {
      const active = index === selected;
      tab.setAttribute('aria-selected', active);
      tab.tabIndex = active ? 0 : -1;
      panels[index].toggleAttribute('data-inactive', !active);
      panels[index].inert = !active;
      panels[index].setAttribute('aria-hidden', String(!active));
    });
    if (focus) tabs[selected].focus();
  }

  rail.setAttribute('role', 'tablist');
  rail.setAttribute('aria-label', 'Strategy and design stages');
  tabs.forEach((tab, index) => {
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panels[index].id);
    panels[index].setAttribute('role', 'tabpanel');
    panels[index].setAttribute('aria-labelledby', tab.id);
    panels[index].tabIndex = 0;
    tab.addEventListener('click', () => selectStage(index));
    tab.addEventListener('pointerenter', event => {
      // Hover switches the preview unless keyboard focus is already in the process.
      const focused = document.activeElement;
      const preserveFocus = strategyProcess.contains(focused) &&
        (focused.matches(':focus-visible') || focused.closest('[role="tabpanel"]'));
      if (event.pointerType === 'mouse' && !preserveFocus) selectStage(index);
    });
    tab.addEventListener('keydown', event => {
      const target = {
        ArrowRight: (index + 1) % tabs.length,
        ArrowLeft: (index + tabs.length - 1) % tabs.length,
        Home: 0,
        End: tabs.length - 1,
      }[event.key];
      if (target === undefined) return;
      event.preventDefault();
      selectStage(target, true);
    });
  });
  strategyProcess.querySelector('.strategy-panels').classList.add('is-enhanced');
  selectStage(0);
  rail.hidden = false;
}
