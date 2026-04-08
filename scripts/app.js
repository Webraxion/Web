import { getPosts, getNewsPosts, getCurrentAccount } from './appwrite.js';

const homeForum = document.getElementById('home-forum');
const homeNews = document.getElementById('home-news');
const heroStatus = document.getElementById('home-status');

function renderForum(posts) {
  if (!homeForum) return;
  homeForum.innerHTML = posts.map(post => `
    <article class="card">
      <h3>${post.title}</h3>
      <p>${post.content}</p>
      <p class="meta">Автор: ${post.author} · ${post.category || 'Общие'}</p>
    </article>
  `).join('');
}

function renderNews(posts) {
  if (!homeNews) return;
  homeNews.innerHTML = posts.map(post => `
    <article class="card small-card">
      <h3>${post.title}</h3>
      <p>${post.body}</p>
      <p class="meta">${post.author} · ${post.date}</p>
    </article>
  `).join('');
}

async function init() {
  try {
    const [forum, news] = await Promise.all([getPosts(), getNewsPosts()]);
    renderForum(forum);
    renderNews(news);
    const account = await getCurrentAccount();
    if (account && heroStatus) {
      heroStatus.textContent = `Вы вошли как ${account.name || account.email}`;
      heroStatus.style.display = 'block';
    }
  } catch (error) {
    console.warn('Ошибка загрузки данных:', error);
  }
}

document.addEventListener('DOMContentLoaded', init);
