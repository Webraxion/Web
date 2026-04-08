import { login, register, getCurrentAccount } from './appwrite.js';

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const authStatus = document.getElementById('auth-status');

function setStatus(message) {
  if (authStatus) {
    authStatus.textContent = message;
    authStatus.style.display = 'block';
  }
}

async function initAuth() {
  try {
    const account = await getCurrentAccount();
    if (account && authStatus) {
      setStatus(`Вы уже вошли как ${account.name || account.email}`);
    }
  } catch {
    if (authStatus) {
      authStatus.textContent = 'Для доступа к функциям войдите в систему.';
    }
  }
}

if (loginForm) {
  loginForm.addEventListener('submit', async event => {
    event.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();
    if (!email || !password) {
      setStatus('Заполните email и пароль.');
      return;
    }
    try {
      await login(email, password);
      window.location.href = 'profile.html';
    } catch (error) {
      setStatus(`Ошибка входа: ${error.message}`);
    }
  });
}

if (registerForm) {
  registerForm.addEventListener('submit', async event => {
    event.preventDefault();
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value.trim();
    if (!name || !email || !password) {
      setStatus('Заполните все поля.');
      return;
    }
    try {
      await register(email, password, name);
      window.location.href = 'profile.html';
    } catch (error) {
      setStatus(`Ошибка регистрации: ${error.message}`);
    }
  });
}

document.addEventListener('DOMContentLoaded', initAuth);
