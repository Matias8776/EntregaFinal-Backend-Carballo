/* eslint-disable no-undef */
const socket = io();
const usersContainer = document.getElementById('usersContainer');
const changeRoleUserForm = document.getElementById('changeRoleUserForm');
const deleteUserForm = document.getElementById('deleteUserForm');

socket.on('server:updatedUsers', async () => {
  await fetch('/api/users', {
    method: 'GET'
  })
    .then((response) => response.json())
    .then((response) => {
      let users = response;
      users = users.payload;
      usersContainer.innerHTML = '';
      users.forEach((a) => {
        const newLiUser = document.createElement('li');
        newLiUser.innerHTML = `
            <div><strong>Id:</strong> ${a.id}</div>
            <div><strong>Nombre:</strong> ${a.name}</div>
            <div><strong>Email:</strong> ${a.email}</div>
            <div><strong>Rol:</strong> ${a.role}</div>
            `;
        usersContainer.appendChild(newLiUser);
      });
    });
});

changeRoleUserForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(changeRoleUserForm);
  const uid = formData.get('id');
  const response = await fetch(`/api/users/premium/${uid}`, {
    method: 'GET'
  });
  const data = await response.json();

  const errorElement = document.getElementById('errorChange');
  if (response.status === 200) {
    changeRoleUserForm.reset();
    socket.emit('client:updateUser');
    errorElement.textContent = '';
  } else if (data.status === 'error') {
    if (errorElement) {
      errorElement.textContent = data.message;
    }
  }
});

deleteUserForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(deleteUserForm);
  const uid = formData.get('id');
  const response = await fetch(`/api/users/${uid}`, {
    method: 'DELETE',
    body: formData
  });
  const data = await response.json();

  const errorElement = document.getElementById('errorDelete');
  if (response.status === 200) {
    deleteUserForm.reset();
    socket.emit('client:updateUser');
    errorElement.textContent = '';
  } else if (data.status === 'error') {
    if (errorElement) {
      errorElement.textContent = data.message;
    }
  }
});
