const resetPasswordForm = document.getElementById('resetPasswordForm');
const email = document.querySelector('[data-email]').getAttribute('data-email');

resetPasswordForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = new FormData(resetPasswordForm);
  const obj = {};
  obj.email = email;
  data.forEach((value, key) => (obj[key] = value));
  await fetch('/api/sessions/resetpassword', {
    method: 'POST',
    body: JSON.stringify(obj),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(async (response) => {
    const errorElement = document.getElementById('error');
    if (response.status === 200) {
      resetPasswordForm.reset();
      window.location.replace('/');
      errorElement.textContent = '';
    } else {
      const errorData = await response.json();
      errorElement.textContent = errorData.message;
    }
  });
});
