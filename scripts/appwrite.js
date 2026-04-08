const API_BASE = '/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('apiToken');
  const headers = options.headers || {};

  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body: options.body || undefined
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.message || response.statusText;
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function register(email, password, name) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name })
  });
}

export async function login(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

export async function logout() {
  localStorage.removeItem('apiToken');
  return Promise.resolve();
}

export async function getCurrentAccount() {
  return request('/auth/me');
}

export async function getPosts() {
  return request('/forum');
}

export async function createPost(title, content, author, category, tags = []) {
  return request('/forum', {
    method: 'POST',
    body: JSON.stringify({ title, content, category, tags })
  });
}

export async function getNewsPosts() {
  return request('/news');
}

export async function createNewsPost(title, body) {
  return request('/news', {
    method: 'POST',
    body: JSON.stringify({ title, body })
  });
}

export async function getPrivateMessages(contact) {
  return request(`/private/${encodeURIComponent(contact)}`);
}

export async function sendPrivateMessage(contact, text) {
  return request(`/private/${encodeURIComponent(contact)}`, {
    method: 'POST',
    body: JSON.stringify({ text })
  });
}
