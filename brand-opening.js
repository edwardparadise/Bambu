'use strict';
(() => {
  const overlay = document.querySelector('.bambu-opening');
  const flight = overlay?.querySelector('.opening-flight');
  const target = document.querySelector('.masthead .unified-wordmark');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (!overlay || !flight || !target || document.hidden || reduced.matches || location.hash) return;
  const svg = flight.querySelector('svg');
  const ns = 'http://www.w3.org/2000/svg';
  const defs = document.createElementNS(ns, 'defs');
  defs.innerHTML = '<filter id="intro-graphite-grain" x="-5%" y="-10%" width="110%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="1" seed="8" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale=".28" xChannelSelector="R" yChannelSelector="G"/></filter><pattern id="intro-charcoal-ink" patternUnits="userSpaceOnUse" width="2" height="2"><rect width="2" height="2" fill="#353638"/><circle cx="0.704" cy="0.860" r="0.045" fill="#f4f3ee" opacity="0.32"/><circle cx="1.025" cy="0.785" r="0.027" fill="#f4f3ee" opacity="0.35"/><circle cx="0.047" cy="0.205" r="0.037" fill="#f4f3ee" opacity="0.54"/><circle cx="0.963" cy="1.093" r="0.066" fill="#f4f3ee" opacity="0.51"/><circle cx="1.135" cy="0.460" r="0.049" fill="#f4f3ee" opacity="0.33"/><circle cx="1.916" cy="0.067" r="0.042" fill="#f4f3ee" opacity="0.44"/><circle cx="1.202" cy="1.116" r="0.059" fill="#f4f3ee" opacity="0.28"/><circle cx="1.681" cy="1.830" r="0.027" fill="#f4f3ee" opacity="0.32"/><circle cx="0.726" cy="0.767" r="0.049" fill="#f4f3ee" opacity="0.29"/><circle cx="1.298" cy="1.762" r="0.067" fill="#f4f3ee" opacity="0.50"/><circle cx="0.437" cy="1.488" r="0.060" fill="#f4f3ee" opacity="0.41"/><circle cx="1.350" cy="0.573" r="0.060" fill="#f4f3ee" opacity="0.28"/><circle cx="1.111" cy="0.523" r="0.049" fill="#f4f3ee" opacity="0.21"/><circle cx="0.624" cy="1.559" r="0.037" fill="#f4f3ee" opacity="0.46"/><circle cx="1.599" cy="1.213" r="0.053" fill="#f4f3ee" opacity="0.27"/><circle cx="0.971" cy="1.925" r="0.069" fill="#f4f3ee" opacity="0.40"/><circle cx="0.888" cy="1.962" r="0.050" fill="#f4f3ee" opacity="0.48"/><circle cx="0.166" cy="0.531" r="0.062" fill="#f4f3ee" opacity="0.39"/><circle cx="1.565" cy="0.871" r="0.066" fill="#f4f3ee" opacity="0.21"/><circle cx="0.530" cy="1.289" r="0.048" fill="#f4f3ee" opacity="0.44"/><circle cx="0.944" cy="1.416" r="0.061" fill="#f4f3ee" opacity="0.31"/><circle cx="0.044" cy="0.486" r="0.041" fill="#f4f3ee" opacity="0.55"/><circle cx="1.916" cy="1.384" r="0.033" fill="#f4f3ee" opacity="0.52"/><circle cx="0.256" cy="0.273" r="0.060" fill="#f4f3ee" opacity="0.32"/></pattern><pattern id="intro-blue-ink" patternUnits="userSpaceOnUse" width="2" height="2"><rect width="2" height="2" fill="#00b9eb"/><circle cx="0.704" cy="0.860" r="0.045" fill="#f4f3ee" opacity="0.32"/><circle cx="1.025" cy="0.785" r="0.027" fill="#f4f3ee" opacity="0.35"/><circle cx="0.047" cy="0.205" r="0.037" fill="#f4f3ee" opacity="0.54"/><circle cx="0.963" cy="1.093" r="0.066" fill="#f4f3ee" opacity="0.51"/><circle cx="1.135" cy="0.460" r="0.049" fill="#f4f3ee" opacity="0.33"/><circle cx="1.916" cy="0.067" r="0.042" fill="#f4f3ee" opacity="0.44"/><circle cx="1.202" cy="1.116" r="0.059" fill="#f4f3ee" opacity="0.28"/><circle cx="1.681" cy="1.830" r="0.027" fill="#f4f3ee" opacity="0.32"/><circle cx="0.726" cy="0.767" r="0.049" fill="#f4f3ee" opacity="0.29"/><circle cx="1.298" cy="1.762" r="0.067" fill="#f4f3ee" opacity="0.50"/><circle cx="0.437" cy="1.488" r="0.060" fill="#f4f3ee" opacity="0.41"/><circle cx="1.350" cy="0.573" r="0.060" fill="#f4f3ee" opacity="0.28"/><circle cx="1.111" cy="0.523" r="0.049" fill="#f4f3ee" opacity="0.21"/><circle cx="0.624" cy="1.559" r="0.037" fill="#f4f3ee" opacity="0.46"/><circle cx="1.599" cy="1.213" r="0.053" fill="#f4f3ee" opacity="0.27"/><circle cx="0.971" cy="1.925" r="0.069" fill="#f4f3ee" opacity="0.40"/><circle cx="0.888" cy="1.962" r="0.050" fill="#f4f3ee" opacity="0.48"/><circle cx="0.166" cy="0.531" r="0.062" fill="#f4f3ee" opacity="0.39"/><circle cx="1.565" cy="0.871" r="0.066" fill="#f4f3ee" opacity="0.21"/><circle cx="0.530" cy="1.289" r="0.048" fill="#f4f3ee" opacity="0.44"/><circle cx="0.944" cy="1.416" r="0.061" fill="#f4f3ee" opacity="0.31"/><circle cx="0.044" cy="0.486" r="0.041" fill="#f4f3ee" opacity="0.55"/><circle cx="1.916" cy="1.384" r="0.033" fill="#f4f3ee" opacity="0.52"/><circle cx="0.256" cy="0.273" r="0.060" fill="#f4f3ee" opacity="0.32"/></pattern>';
  svg.prepend(defs);
  const echo = svg.querySelector('.intro-pencil').cloneNode(true);
  echo.setAttribute('class', 'intro-stage intro-pencil-echo');
  echo.setAttribute('transform', 'translate(.22 -.18)');
  svg.querySelector('.intro-pencil').after(echo);
  const root = document.documentElement;
  const listeners = new AbortController(), timers = [], animations = [];
  const behind = [...document.body.children].filter(el => el !== overlay && !['SCRIPT','STYLE'].includes(el.tagName));
  const previous = behind.map(el => el.inert);
  let complete = false, travelling = false;
  const center = () => {
    const width = Math.min(innerWidth * .86, 1080), height = width * 42 / 231;
    const x = (innerWidth - width) / 2, y = (innerHeight - height) / 2;
    flight.style.width = width + 'px';
    flight.style.transform = `translate(${x}px,${y}px)`;
    return { width, x, y };
  };
  const finish = () => {
    if (complete) return;
    complete = true;
    timers.forEach(clearTimeout);
    listeners.abort();
    // The flying lockup and the real header swap in the same rendering frame.
    overlay.hidden = true;
    root.classList.remove('brand-revealing','intro-running','intro-travelling');
    behind.forEach((el,i) => { el.inert = previous[i]; });
    animations.forEach(animation => animation.cancel());
  };
  const land = () => {
    if (complete) return;
    travelling = true;
    const start = center(), box = target.getBoundingClientRect();
    const scale = (box.width * 231 / 422) / start.width;
    const parsed = new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg">' + "<g class=\"intro-descriptor\" transform=\"translate(245 0)\" stroke=\"#FFFFFF\" stroke-width=\"2.6\"><path d=\"M0 3V37\"/><path d=\"M10 37V15L23 15Q27 15 27 19V37\"/><path d=\"M39 7V33Q39 37 43 37H46 M33 15H46\"/><path d=\"M53 26H71V20Q71 15 66 15H58Q53 15 53 20V32Q53 37 58 37H70\"/><path d=\"M79 37V15m0 7q4-7 12-7\"/><path d=\"M98 15V37 M98 5V7\"/><path d=\"M111 15H120Q125 15 125 20V32Q125 37 120 37H111Q106 37 106 32V20Q106 15 111 15Z\"/><path d=\"M133 37V15m0 7q4-7 12-7\"/><path d=\"M169 15H157Q152 15 152 20Q152 26 157 26H164Q169 26 169 31V32Q169 37 164 37H152\"/></g>" + '</svg>', 'image/svg+xml');
    const descriptor = document.importNode(parsed.documentElement.firstElementChild, true);
    svg.append(descriptor);
    root.classList.add('intro-travelling');
    const duration = 1000, easing = 'cubic-bezier(.45,0,.2,1)';
    const movement = flight.animate([
      { transform: `translate(${start.x}px,${start.y}px) scale(1)` },
      { transform: `translate(${box.left}px,${box.top}px) scale(${scale})` }
    ], { duration, easing, fill: 'forwards' });
    const lettering = descriptor.animate([
      { opacity: 0, offset: 0 }, { opacity: 0, offset: .15 },
      { opacity: 1, offset: .75 }, { opacity: 1, offset: 1 }
    ], { duration, easing, fill: 'forwards' });
    animations.push(movement, lettering);
    movement.finished.then(finish).catch(() => {});
  };
  behind.forEach(el => { el.inert = true; });
  root.classList.add('brand-revealing','intro-running');
  overlay.hidden = false;
  center();
  requestAnimationFrame(() => overlay.classList.add('opening-active'));
  timers.push(setTimeout(land, 3200), setTimeout(finish, 6000));
  overlay.querySelector('.opening-skip').addEventListener('click', finish, { signal: listeners.signal });
  addEventListener('keydown', event => { if (event.key === 'Escape') finish(); }, { signal: listeners.signal });
  addEventListener('resize', () => { if (travelling) finish(); else center(); }, { signal: listeners.signal });
  addEventListener('pagehide', finish, { once: true, signal: listeners.signal });
  reduced.addEventListener('change', event => { if (event.matches) finish(); }, { signal: listeners.signal });
})();
