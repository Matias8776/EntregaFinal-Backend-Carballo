/* eslint-disable no-undef */
const sendResetEmailForm = document.getElementById('sendResetEmailForm');

sendResetEmailForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = new FormData(sendResetEmailForm);
  const obj = {};
  data.forEach((value, key) => (obj[key] = value));
  await fetch('api/sessions/sendresetemail', {
    method: 'POST',
    body: JSON.stringify(obj),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(async (response) => {
    const errorElement = document.getElementById('error');
    if (response.status === 200) {
      sendResetEmailForm.reset();
      errorElement.textContent = '';
      Toastify({
        text: 'Email enviado correctamente',
        duration: 3000,
        gravity: 'bottom',
        position: 'center',
        style: {
          background: '#808080'
        }
      }).showToast();
    } else {
      const errorData = await response.json();
      errorElement.textContent = errorData.message;
    }
  });
});
