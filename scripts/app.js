import { register as appwriteRegister, login as appwriteLogin, logout as appwriteLogout, getCurrentAccount, getPosts, createPost, getNewsPosts, createNewsPost, getPrivateMessages, sendPrivateMessage } from './appwrite.js';

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
    }
  ],
  newsPosts: [
    {
      title: 'Первое объявление',
      body: 'Платформа готова. Вы можете зарегистрироваться и публиковать новости.',
      author: 'Админ',
      date: '2026-04-08'
    }
  ],
  privateChats: {
    'Алексей': [
      { from: 'Алексей', text: 'Привет! Как дела?', time: '10:15' }
    ],
    'Мария': [
      { from: 'Мария', text: 'Привет! Готов обсудить проект.', time: '11:00' }
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
  forumForm: document.getElementById('forum-form'),
  forumTitle: document.getElementById('forum-title'),
  forumContent: document.getElementById('forum-content'),
  forumCategory: document.getElementById('forum-category'),
  forumTags: document.getElementById('forum-tags'),
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
  profileStatus: document.getElementById('profile-status'),
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
    console.warn('Ошибка загрузки состояния:', err);
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }
}

function saveState() {
  localStorage.setItem(STORAGE_STATE, JSON.stringify(state));
}

function loadUser() {
  const saved = localStorage.getItem(STORAGE_USER);
  if (!saved) return null;
  try {
    return JSON.parse(saved);
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

function saveToken(token) {
  if (token) {
    localStorage.setItem('apiToken', token);
  } else {
    localStorage.removeItem('apiToken');
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
    const result = await appwriteRegister(email, password, name);
    saveToken(result.token);
    const user = result.user;
    state.user = user;
    saveUser(user);
    renderAll();
    alert('Регистрация прошла успешно. Вы вошли в систему.');
    event.target.reset();
  } catch (error) {
    console.warn('Ошибка регистрации:', error);
    alert(`Регистрация не удалась: ${error.message}`);
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
    const result = await appwriteLogin(email, password);
    saveToken(result.token);
    const user = result.user;
    state.user = user;
    saveUser(user);
    renderAll();
    alert('Вход выполнен.');
    event.target.reset();
  } catch (error) {
    console.warn('Ошибка входа:', error);
    alert(`Вход не удался: ${error.message}`);
  }
}

async function handleLogout() {
  try {
    await appwriteLogout();
  } catch (error) {
    console.warn('Ошибка выхода:', error);
  }
  saveToken(null);
  state.user = null;
  saveUser(null);
  renderAll();
}

async function handleForumSubmit(event) {
  event.preventDefault();
  if (!state.user) {
    alert('Войдите, чтобы публиковать темы.');
    return;
  }

  const title = elements.forumTitle.value.trim();
  const content = elements.forumContent.value.trim();
  const category = elements.forumCategory.value.trim();
  const tags = elements.forumTags.value.split(',').map(tag => tag.trim()).filter(Boolean);

  if (!title || !content) {
    alert('Заполните заголовок и текст темы.');
    return;
  }

  try {
    const post = await createPost(title, content, state.user.name, category, tags);
    if (post) {
      state.forumPosts.unshift(post);
    }
  } catch (error) {
    console.warn('Сервер недоступен, сохраняю тему локально:', error);
    state.forumPosts.unshift({ title, content, author: state.user.name, category, tags, views: 0 });
  }

  saveState();
  renderHome();
  elements.forumForm.reset();
  alert('Тема опубликована.');
}

async function handleNewsSubmit(event) {
  event.preventDefault();
  if (!state.user) {
    alert('Войдите, чтобы публиковать новости.');
    return;
  }

  const title = elements.newsTitle.value.trim();
  const body = elements.newsBody.value.trim();
  if (!title || !body) {
    alert('Заполните заголовок и текст новости.');
    return;
  }

  try {
    const news = await createNewsPost(title, body);
    if (news) {
      state.newsPosts.unshift(news);
    }
  } catch (error) {
    console.warn('Сервер недоступен, сохраняю новость локально:', error);
    state.newsPosts.unshift({ title, body, author: state.user.name, date: new Date().toLocaleDateString('ru-RU') });
  }

  saveState();
  renderNews();
  elements.newsForm.reset();
  alert('Новость опубликована.');
}

async function loadPrivateChat(contact) {
  if (!state.user) {
    return;
  }
  try {
    const messages = await getPrivateMessages(contact);
    state.privateChats[contact] = messages;
  } catch (error) {
    console.warn('Не удалось загрузить личный чат:', error);
  }
}

function renderSection(pageId) {
  sections.forEach(section => section.classList.toggle('active', section.id === `${pageId}-section`));
  navButtons.forEach(button => button.classList.toggle('active', button.dataset.page === pageId));
}

function renderHome() {
  elements.homeForum.innerHTML = state.forumPosts.map(post => `
    <article class="card">
      <h4>${post.title}</h4>
      <p>${post.content}</p>
      <p class="meta">Автор: ${post.author} · Категория: ${post.category || 'Общие'} · Просмотров: ${post.views || 0}</p>
      <p class="tags">${(post.tags || []).map(tag => `<span>${tag}</span>`).join('')}</p>
    </article>
  `).join('');

  elements.homeNews.innerHTML = state.newsPosts.map(post => `
    <article class="card small-card">
      <h4>${post.title}</h4>
      <p>${post.body}</p>
      <p class="meta">${post.author} · ${post.date}</p>
    </article>
  `).join('');

  if (elements.forumForm) {
    elements.forumForm.querySelector('button').disabled = !state.user;
  }
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
    elements.profileStatus.textContent = 'Авторизован';
    elements.logoutButton.disabled = false;
  } else {
    elements.profileName.textContent = 'Гость';
    elements.profileEmail.textContent = 'Пожалуйста, войдите в систему.';
    elements.profileStatus.textContent = 'Не авторизован';
    elements.logoutButton.disabled = true;
  }
}

function renderPrivateChats() {
  const contactNames = Object.keys(state.privateChats);
  elements.privateContactSelect.innerHTML = contactNames.map(name => `
    <option value="${name}">${name}</option>
  `).join('');

  currentContact = elements.privateContactSelect.value || currentContact;
  elements.chatUserName.textContent = currentContact;
  const messages = state.privateChats[currentContact] || [];

  if (!state.user) {
    elements.privateMessages.innerHTML = '<div class="chat-notice">Войдите на сайт, чтобы начать личный чат.</div>';
  } else {
    elements.privateMessages.innerHTML = messages.map(message => `
      <div class="chat-message ${message.from === 'Вы' ? 'my-message' : 'other-message'}">
        <div class="chat-from">${message.from}</div>
        <div class="chat-text">${message.text}</div>
        <div class="chat-time">${message.time}</div>
      </div>
    `).join('');
  }

  elements.privateChatArea.classList.toggle('disabled', !state.user);
}

function renderAll() {
  renderSection('home');
  renderHome();
  renderNews();
  renderAuthStatus();
  renderProfile();
  renderPrivateChats();
}

async function handleContactChange() {
  currentContact = elements.privateContactSelect.value;
  await loadPrivateChat(currentContact);
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
  elements.forumForm.addEventListener('submit', handleForumSubmit);
  elements.privateContactSelect.addEventListener('change', handleContactChange);
  document.getElementById('private-form').addEventListener('submit', handlePrivateSubmit);
  elements.logoutButton.addEventListener('click', handleLogout);
}

async function handlePrivateSubmit(event) {
  event.preventDefault();
  if (!state.user) {
    alert('Войдите, чтобы отправлять личные сообщения.');
    return;
  }

  const text = elements.privateMessageText.value.trim();
  if (!text) return;

  const now = new Date();
  const message = {
    from: 'Вы',
    text,
    time: now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  };

  try {
    const serverMessage = await sendPrivateMessage(currentContact, text);
    state.privateChats[currentContact] = state.privateChats[currentContact] || [];
    state.privateChats[currentContact].push(serverMessage || message);
  } catch (error) {
    console.warn('Сервер недоступен, сохраняю сообщение локально:', error);
    state.privateChats[currentContact] = state.privateChats[currentContact] || [];
    state.privateChats[currentContact].push(message);
  }

  saveState();
  elements.privateMessageText.value = '';
  renderPrivateChats();
}

async function init() {
  const savedUser = loadUser();
  if (savedUser) {
    state.user = savedUser;
  }

  try {
    const account = await getCurrentAccount();
    if (account && account.email) {
      state.user = { name: account.name || account.email.split('@')[0], email: account.email };
      saveUser(state.user);
    }
  } catch (err) {
    console.warn('Нет активной сессии Appwrite:', err);
    saveToken(null);
  }

  try {
    const [forum, news] = await Promise.all([getPosts(), getNewsPosts()]);
    if (Array.isArray(forum) && forum.length) {
      state.forumPosts = forum;
    }
    if (Array.isArray(news) && news.length) {
      state.newsPosts = news;
    }
    await loadPrivateChat(currentContact);
  } catch (error) {
    console.warn('Не удалось загрузить данные с сервера:', error);
  }

  setupNavigation();
  setupForms();
  renderAll();
}

document.addEventListener('DOMContentLoaded', init);
