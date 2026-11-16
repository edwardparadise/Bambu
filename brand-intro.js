'use strict';

const brandIntro = document.querySelector('.brand-intro');
const brandReveal = brandIntro.querySelector('input');

function updateBrandReveal() {
  const value = brandReveal.value;
  brandIntro.style.setProperty('--brand-reveal', value + '%');
  brandReveal.setAttribute('aria-valuetext', value + '% finished logo');
}

brandReveal.addEventListener('input', updateBrandReveal);
updateBrandReveal();

let introSeen = false;
try {
  introSeen = sessionStorage.getItem('bambu-intro-seen') === 'yes';
} catch {
  // Browsers can restrict session storage.
}

if (!introSeen && typeof brandIntro.showModal === 'function') {
  brandIntro.showModal();
  try {
    sessionStorage.setItem('bambu-intro-seen', 'yes');
  } catch {
    // The intro still works with storage disabled.
  }
}
