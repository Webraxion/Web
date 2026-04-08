import { register as appwriteRegister, login as appwriteLogin, logout as appwriteLogout } from './appwrite.js';

const STORAGE_STATE = 'webPlatformState';
const STORAGE_USER = 'webPlatformUser';

const DEFAULT_STATE = {
  user: null,
  forumPosts: [
    {
      title: 'Добро пожаловать на платформу',
      content: 'Это начало вашего форума. Создавайте темы, обсуждайте новости и общайтесь в личных чатах.',
      author: 'Админ',
      category: 'Общие',
      tags: ['Appwrite', 'Сообщество'],
      views: 120
    },
    {
      title: 'Новое обновление',
      content: 'Теперь вы можете добавлять личные чаты, публиковать новости и зарегистрироваться на сайте.',
      author: 'Редакция',
      category: 'Обновления',
      tags: ['Новости', 'Чаты'],
      views: 75
    }
  ],
  newsPosts: [
    {
      title: 'Общая новостная лента',
      body: 'Здесь публикуются важные объявления и новости проекта.',
      author: 'Редакция',
      date: '2026-04-08'
    }
  ],
  privateChats: {
    'Алексей': [
      { from: 'Алексей', text: 'Привет! Как идут дела?', time: '10:15' }
    ],
    'Мария': [
      { from: 'Мария', text: 'Готовься к новой встрече команды.', time: '11:00' }
    ]
  }
};

let state = loadState();
let currentContact = 'Алексей';

const navButtons = document.querySelectorAll('[data-page]');
const sections = document.querySelectorAll('.page');

const elements = {
  authStatus: document.getElementById('auth-status'),
  homeForum: document.getElementById('home-forum'),
  homeNews: document.getElementById('home-news'),
  newsFeed: document.getElementById('news-feed'),
  newsForm: document.getElementById('news-form'),
  newsTitle: document.getElementById('news-title'),
  newsBody: document.getElementById('news-body'),
  privateChatArea: document.getElementById('private-chat-area'),
  chatUserName: document.getElementById('chat-user-name'),
  privateMessages: document.getElementById('private-messages'),
  privateContactSelect: document.getElementById('private-contact'),
  privateMessageText: document.getElementById('private-message-text'),
  profileName: document.getElementById('profile-name'),
  profileEmail: document.getElementById('profile-email'),
  logoutButton: document.getElementById('logout-btn'),
  registerForm: document.getElementById('register-form'),
  loginForm: document.getElementById('login-form')
};

function loadState() {
  const saved = localStorage.getItem(STORAGE_STATE);
  if (!saved) {
    localStorage.setItem(STORAGE_STATE, JSON.stringify(DEFAULT_STATE));
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }
  try {
    return JSON.parse(saved);
  } catch (err) {
    console.warn('Не удалось загрузить состояние, использую стандартное.', err);
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }
}

function saveState() {
  localStorage.setItem(STORAGE_STATE, JSON.stringify(state));
}

function loadUser() {
  const user = localStorage.getItem(STORAGE_USER);
  if (!user) return null;
  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
}

function saveUser(user) {
  if (user) {
    localStorage.setItem(STORAGE_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_USER);
  }
}

async function handleRegister(event) {
  event.preventDefault();
  const name = document.getElementById('register-name').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value.trim();
  if (!name || !email || !password) {
    alert('Заполните все поля регистрации.');
    return;
  }

  try {
    await appwriteRegister(email, password, name);
    const user = { name, email };
    state.user = user;
    saveUser(user);
    renderAll();
    alert('Регистрация прошла успешно. Вы вошли в систему.');
    event.target.reset();
  } catch (error) {
    console.warn('Appwrite регистрация не удалась, использую локальный режим.', error);
    const user = { name, email };
    state.user = user;
    saveUser(user);
    renderAll();
    alert('Регистрация выполнена локально.');
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value.trim();
  if (!email || !password) {
    alert('Заполните email и пароль.');
    return;
  }

  try {
    await appwriteLogin(email, password);
    const user = { name: email.split('@')[0], email };
    state.user = user;
    saveUser(user);
    renderAll();
    alert('Вход выполнен.');
    event.target.reset();
  } catch (error) {
    console.warn('Appwrite вход не удался, использую локальный режим.', error);
    const user = { name: email.split('@')[0], email };
    state.user = user;
    saveUser(user);
    renderAll();
    alert('Вход выполнен локально.');
  }
}

async function handleLogout() {
  try {
    await appwriteLogout();
  } catch (error) {
    console.warn('Appwrite logout не удался, продолжаю локально.', error);
  }
  state.user = null;
  saveUser(null);
  renderAll();
}

function renderSection(pageId) {
  sections.forEach(section => section.classList.toggle('active', section.id === `${pageId}-section`));
  navButtons.forEach(button => button.classList.toggle('active', button.dataset.page === pageId));
}

function renderHome() {
  elements.homeForum.innerHTML = state.forumPosts.map(post => `
    <article class="card">
      <h3>${post.title}</h3>
      <p>${post.content}</p>
      <p class="meta">Автор: ${post.author} · Категория: ${post.category} · Просмотров: ${post.views}</p>
      <p class="tags">${post.tags.map(tag => `<span>${tag}</span>`).join('')}</p>
    </article>
  `).join('');

  elements.homeNews.innerHTML = state.newsPosts.map(post => `
    <article class="card small-card">
      <h4>${post.title}</h4>
      <p>${post.body}</p>
      <p class="meta">${post.author}, ${post.date}</p>
    </article>
  `).join('');
}

function renderNews() {
  elements.newsFeed.innerHTML = state.newsPosts.map(post => `
    <article class="card">
      <h3>${post.title}</h3>
      <p>${post.body}</p>
      <p class="meta">${post.author} · ${post.date}</p>
    </article>
  `).join('');
  elements.newsForm.querySelector('button').disabled = !state.user;
}

function renderAuthStatus() {
  if (state.user) {
    elements.authStatus.textContent = `Вы вошли как ${state.user.name} (${state.user.email})`;
  } else {
    elements.authStatus.textContent = 'Вы не авторизованы. Зарегистрируйтесь или войдите.';
  }
}

function renderProfile() {
  if (state.user) {
    elements.profileName.textContent = state.user.name;
    elements.profileEmail.textContent = state.user.email;
    elements.logoutButton.disabled = false;
  } else {
    elements.profileName.textContent = 'Гость';
    elements.profileEmail.textContent = 'Пожалуйста, войдите в систему.';
    elements.logoutButton.disabled = true;
  }
}

function renderPrivateChats() {
  elements.privateContactSelect.innerHTML = Object.keys(state.privateChats).map(name => `
    <option value="${name}">${name}</option>
  `).join('');
  currentContact = elements.privateContactSelect.value || currentContact;
  elements.chatUserName.textContent = currentContact;
  const chatMessages = state.privateChats[currentContact] || [];
  elements.privateMessages.innerHTML = chatMessages.map(message => `
    <div class="chat-message ${message.from === 'Вы' ? 'my-message' : 'other-message'}">
      <div class="chat-from">${message.from}</div>
      <div class="chat-text">${message.text}</div>
      <div class="chat-time">${message.time}</div>
    </div>
  `).join('');
  elements.privateChatArea.classList.toggle('disabled', !state.user);
}

function renderAll() {
  state.user = state.user || loadUser();
  renderSection('home');
  renderHome();
  renderNews();
  renderAuthStatus();
  renderProfile();
  renderPrivateChats();
}

function handleNewsSubmit(event) {
  event.preventDefault();
  if (!state.user) {
    alert('Только авторизованные пользователи могут публиковать новости.');
    return;
  }
  const title = elements.newsTitle.value.trim();
  const body = elements.newsBody.value.trim();
  if (!title || !body) {
    alert('Заполните заголовок и текст новости.');
    return;
  }
  state.newsPosts.unshift({
    title,
    body,
    author: state.user.name,
    date: new Date().toLocaleDateString('ru-RU')
  });
  saveState();
  elements.newsTitle.value = '';
  elements.newsBody.value = '';
  renderNews();
}

function handlePrivateSubmit(event) {
  event.preventDefault();
  if (!state.user) {
    alert('Войдите в систему, чтобы отправлять личные сообщения.');
    return;
  }
  const text = elements.privateMessageText.value.trim();
  if (!text) {
    return;
  }
  const now = new Date();
  const message = {
    from: 'Вы',
    text,
    time: now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  };
  state.privateChats[currentContact] = state.privateChats[currentContact] || [];
  state.privateChats[currentContact].push(message);
  saveState();
  elements.privateMessageText.value = '';
  renderPrivateChats();
}

function handleContactChange() {
  currentContact = elements.privateContactSelect.value;
  renderPrivateChats();
}

function setupNavigation() {
  navButtons.forEach(button => {
    button.addEventListener('click', () => renderSection(button.dataset.page));
  });
}

function setupForms() {
  elements.registerForm.addEventListener('submit', handleRegister);
  elements.loginForm.addEventListener('submit', handleLogin);
  elements.newsForm.addEventListener('submit', handleNewsSubmit);
  elements.privateContactSelect.addEventListener('change', handleContactChange);
  document.getElementById('private-form').addEventListener('submit', handlePrivateSubmit);
  elements.logoutButton.addEventListener('click', handleLogout);
}

function init() {
  const storedUser = loadUser();
  if (storedUser) {
    state.user = storedUser;
  }
  setupNavigation();
  setupForms();
  renderAll();
}

document.addEventListener('DOMContentLoaded', init);
