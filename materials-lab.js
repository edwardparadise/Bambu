
'use strict';
// The submission is intentionally composed locally in a mail client;
// BAMBU's public website has no form-processing backend.
(() => {
  const form = document.getElementById('material-suggestion');
  if (!form) return;
  const status = document.getElementById('ml-submission-status');
  const copy = document.getElementById('ml-copy');
  const address = 'ed@bambuinteriors.co.uk';
  const details = () => {
    const values = new FormData(form);
    const get = k => String(values.get(k) || '').trim();
    const subject = 'Materials Lab product suggestion' + (get('product') ? ': ' + get('product') : '');
    const body = [
      'Hello BAMBU Materials Lab,', '',
      'I would like to suggest a workplace product for editorial consideration.', '',
      'Name: ' + get('name'),
      'Email: ' + get('email'),
      'I am a: ' + get('role'),
      'Product or system: ' + get('product'),
      'Manufacturer / brand: ' + (get('manufacturer') || 'Not specified'),
      'Product category: ' + (get('category') || 'Not specified'),
      'Public information / product URL: ' + (get('url') || 'Not provided'),
      'Why this is worth reviewing:', get('reason') || 'Not provided', '',
      'I understand editorial coverage is independent and not guaranteed.', '',
      'Kind regards,', get('name')
    ].join('\n');
    return { subject, body };
  };
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const {subject,body}=details();
    if(status) status.textContent = 'Your email app should open with the information prepared. Please review and send the email; the website has not submitted it.';
    window.location.href = 'mailto:' + address + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  });
  copy?.addEventListener('click', async () => {
    if (!form.reportValidity()) return;
    const {subject,body}=details();
    const message = 'To: ' + address + '\nSubject: ' + subject + '\n\n' + body;
    try {
      await navigator.clipboard.writeText(message);
      if(status) status.textContent = 'Copied. Paste this into an email to ' + address + ' and send it to BAMBU.';
    } catch {
      if(status) status.textContent = 'Your browser could not copy the text. Please email ' + address + ' directly.';
    }
  });
})();
