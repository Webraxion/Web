import { getPosts, createPost, getCurrentAccount } from './appwrite.js';

const forumList = document.getElementById('forum-list');
const forumStatus = document.getElementById('forum-status');
const forumForm = document.getElementById('forum-form');

function setStatus(message) {
  if (forumStatus) {
    forumStatus.textContent = message;
  }
}

function renderForum(posts) {
  if (!forumList) return;
  forumList.innerHTML = posts.map(post => `
    <article class="card">
      <h3>${post.title}</h3>
      <p>${post.content}</p>
      <p class="meta">Автор: ${post.author} · ${post.category || 'Общие'}</p>
    </article>
  `).join('');
}

async function loadForum() {
  try {
    const posts = await getPosts();
    renderForum(posts);
  } catch (error) {
    setStatus(`Не удалось загрузить темы: ${error.message}`);
  }
}

async function initForum() {
  try {
    const account = await getCurrentAccount();
    setStatus(`Вы вошли как ${account.name || account.email}`);
  } catch {
    setStatus('Войдите для публикации тем.');
  }
  await loadForum();
}

if (forumForm) {
  forumForm.addEventListener('submit', async event => {
    event.preventDefault();
    const title = document.getElementById('forum-title').value.trim();
    const content = document.getElementById('forum-content').value.trim();
    const category = document.getElementById('forum-category').value.trim();
    const tags = document.getElementById('forum-tags').value.split(',').map(tag => tag.trim()).filter(Boolean);
    if (!title || !content) {
      setStatus('Заполните заголовок и содержание темы.');
      return;
    }

    try {
      const post = await createPost(title, content, 'Пользователь', category, tags);
      setStatus('Тема опубликована.');
      if (post) {
        const current = await getPosts();
        renderForum(current);
      }
      forumForm.reset();
    } catch (error) {
      setStatus(`Ошибка публикации: ${error.message}`);
    }
  });
}

document.addEventListener('DOMContentLoaded', initForum);
