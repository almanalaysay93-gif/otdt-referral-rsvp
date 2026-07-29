// Paste your deployed Apps Script web app URL here (see SETUP.md).
const SUBMIT_ENDPOINT = "https://script.google.com/macros/s/AKfycbzL5T4gqDS7uH8BZzGi7mJzBh85KnPiJFMcP0TMgPOO3kcTgb17U-_5Qzj1z6wmnPzTlw/exec";

const form = document.getElementById('rsvpForm');
const submitBtn = document.getElementById('submitBtn');
const submitLabel = document.getElementById('submitLabel');
const formStatus = document.getElementById('formStatus');
const successPanel = document.getElementById('successPanel');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  formStatus.textContent = '';
  formStatus.className = 'form-status';

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  if (SUBMIT_ENDPOINT.indexOf('PASTE_YOUR') === 0) {
    formStatus.textContent = 'Form backend not configured yet — see SETUP.md.';
    formStatus.className = 'form-status err';
    return;
  }

  submitBtn.disabled = true;
  submitLabel.textContent = 'Submitting…';

  const data = new FormData(form);
  const body = new URLSearchParams();
  for (const [key, value] of data.entries()) body.append(key, value);

  try {
    // no-cors: Apps Script web apps don't return CORS headers, so the
    // response is opaque. We treat the fetch not throwing as success.
    await fetch(SUBMIT_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      body
    });
    form.style.display = 'none';
    successPanel.classList.add('show');
  } catch (err) {
    formStatus.textContent = 'Something went wrong. Please try again or email us.';
    formStatus.className = 'form-status err';
    submitBtn.disabled = false;
    submitLabel.textContent = 'Submit RSVP';
  }
});
