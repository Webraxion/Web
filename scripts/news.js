import { getNewsPosts, createNewsPost, getCurrentAccount } from './appwrite.js';

const newsList = document.getElementById('news-list');
const newsStatus = document.getElementById('news-status');
const newsForm = document.getElementById('news-form');

function setStatus(message) {
  if (newsStatus) newsStatus.textContent = message;
}

function renderNews(posts) {
  if (!newsList) return;
  newsList.innerHTML = posts.map(post => `
    <article class="card">
      <h3>${post.title}</h3>
      <p>${post.body}</p>
      <p class="meta">${post.author} · ${post.date}</p>
    </article>
  `).join('');
}

async function loadNews() {
  try {
    const news = await getNewsPosts();
    renderNews(news);
  } catch (error) {
    setStatus(`Не удалось загрузить новости: ${error.message}`);
  }
}

async function initNews() {
  try {
    const account = await getCurrentAccount();
    setStatus(`Вы вошли как ${account.name || account.email}`);
  } catch {
    setStatus('Войдите для публикации новостей.');
  }
  await loadNews();
}

if (newsForm) {
  newsForm.addEventListener('submit', async event => {
    event.preventDefault();
    const title = document.getElementById('news-title').value.trim();
    const body = document.getElementById('news-body').value.trim();
    if (!title || !body) {
      setStatus('Заполните заголовок и текст новости.');
      return;
    }
    try {
      const result = await createNewsPost(title, body);
      setStatus('Новость опубликована.');
      if (result) {
        const news = await getNewsPosts();
        renderNews(news);
      }
      newsForm.reset();
    } catch (error) {
      setStatus(`Ошибка публикации: ${error.message}`);
    }
  });
}

document.addEventListener('DOMContentLoaded', initNews);
