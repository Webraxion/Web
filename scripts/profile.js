import { getCurrentAccount, logout as appwriteLogout } from './appwrite.js';

const profileInfo = document.getElementById('profile-info');
const profileStatus = document.getElementById('profile-status');
const logoutBtn = document.getElementById('logout-btn');

function setStatus(message) {
  if (profileStatus) profileStatus.textContent = message;
}

function renderProfile(user) {
  if (!profileInfo) return;
  profileInfo.innerHTML = `
    <p><strong>Имя:</strong> ${user.name}</p>
    <p><strong>Email:</strong> ${user.email}</p>
    <p><strong>Профиль:</strong> полный доступ</p>
  `;
}

async function logout() {
  await appwriteLogout();
  window.location.href = 'login.html';
}

async function initProfile() {
  try {
    const account = await getCurrentAccount();
    renderProfile({ name: account.name || account.email.split('@')[0], email: account.email });
    setStatus('Успешная авторизация');
  } catch (error) {
    profileInfo.innerHTML = '<p>Пожалуйста, войдите в систему.</p>';
    setStatus('Не авторизован');
  }
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}

document.addEventListener('DOMContentLoaded', initProfile);
