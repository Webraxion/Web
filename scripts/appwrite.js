const { Client, Account, Databases, ID } = Appwrite;

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('69d65bfa00283e8d6a6d');

const account = new Account(client);
const databases = new Databases(client);

const DATABASE_ID = 'main'; // You may need to create this in Appwrite Console
const FORUM_COLLECTION_ID = 'forum_posts';
const NEWS_COLLECTION_ID = 'news_posts';
const CHAT_COLLECTION_ID = 'chat_messages';

export async function register(email, password, name) {
  try {
    const response = await account.create(ID.unique(), email, password, name);
    return response;
  } catch (error) {
    throw new Error(`Регистрация не удалась: ${error.message}`);
  }
}

export async function login(email, password) {
  try {
    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (error) {
    throw new Error(`Вход не удался: ${error.message}`);
  }
}

export async function logout() {
  try {
    await account.deleteSession('current');
  } catch (error) {
    console.warn('Ошибка выхода:', error);
  }
}

export async function getCurrentAccount() {
  try {
    return await account.get();
  } catch (error) {
    return null;
  }
}

export async function getPosts() {
  try {
    const response = await databases.listDocuments(DATABASE_ID, FORUM_COLLECTION_ID);
    return response.documents.map(doc => ({
      id: doc.$id,
      title: doc.title,
      content: doc.content,
      author: doc.authorName,
      category: doc.category,
      views: doc.views || 0,
      createdAt: doc.$createdAt
    }));
  } catch (error) {
    console.warn('Ошибка загрузки постов форума:', error);
    return [];
  }
}

export async function createPost(title, content, category = 'Общие') {
  try {
    const user = await getCurrentAccount();
    if (!user) throw new Error('Не авторизован');

    const response = await databases.createDocument(DATABASE_ID, FORUM_COLLECTION_ID, ID.unique(), {
      title,
      content,
      authorName: user.name || user.email,
      category,
      views: 0
    });
    return response;
  } catch (error) {
    throw new Error(`Ошибка создания поста: ${error.message}`);
  }
}

export async function getNewsPosts() {
  try {
    const response = await databases.listDocuments(DATABASE_ID, NEWS_COLLECTION_ID);
    return response.documents.map(doc => ({
      id: doc.$id,
      title: doc.title,
      body: doc.body,
      author: doc.authorName,
      date: new Date(doc.$createdAt).toLocaleDateString('ru-RU')
    }));
  } catch (error) {
    console.warn('Ошибка загрузки новостей:', error);
    return [];
  }
}

export async function createNewsPost(title, body) {
  try {
    const user = await getCurrentAccount();
    if (!user) throw new Error('Не авторизован');

    const response = await databases.createDocument(DATABASE_ID, NEWS_COLLECTION_ID, ID.unique(), {
      title,
      body,
      authorName: user.name || user.email
    });
    return response;
  } catch (error) {
    throw new Error(`Ошибка создания новости: ${error.message}`);
  }
}

export async function getChatMessages() {
  try {
    const response = await databases.listDocuments(DATABASE_ID, CHAT_COLLECTION_ID);
    return response.documents.map(doc => ({
      id: doc.$id,
      message: doc.message,
      author: doc.authorName,
      timestamp: new Date(doc.$createdAt).toLocaleTimeString('ru-RU')
    })).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  } catch (error) {
    console.warn('Ошибка загрузки сообщений чата:', error);
    return [];
  }
}

export async function sendChatMessage(message) {
  try {
    const user = await getCurrentAccount();
    if (!user) throw new Error('Не авторизован');

    const response = await databases.createDocument(DATABASE_ID, CHAT_COLLECTION_ID, ID.unique(), {
      message,
      authorName: user.name || user.email
    });
    return response;
  } catch (error) {
    throw new Error(`Ошибка отправки сообщения: ${error.message}`);
  }
}
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
