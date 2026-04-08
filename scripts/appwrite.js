<script type="module">
  import { Client, Databases } from "https://cdn.jsdelivr.net/npm/appwrite@8.1.0/dist/appwrite.min.js";

  // Настройка клиента
  const client = new Client();
  client
    .setEndpoint("https://[YOUR_APPWRITE_DOMAIN]/v1") // адрес Appwrite
    .setProject("[YOUR_PROJECT_ID]"); // ID проекта

  const databases = new Databases(client);

  const DATABASE_ID = "69d64eb3002e5d21f507"; // твой ID базы данных

  // Функция получения всех сообщений
  export async function getPosts() {
    const response = await databases.listDocuments(DATABASE_ID);
    return response.documents;
  }

  // Функция добавления нового сообщения
  export async function createPost(title, content, author, category, tags=[]) {
    const response = await databases.createDocument(DATABASE_ID, {
      заголовок: title,
      содержание: content,
      авторИмя: author,
      дата_публикации: new Date().toISOString(),
      категория: category,
      просмотры: 0,
      теги: tags
    }, ["*"], ["*"]); // разрешения: все могут читать и писать
    return response;
  }

  // Функция увеличения просмотров
  export async function incrementViews(documentId, currentViews) {
    await databases.updateDocument(DATABASE_ID, documentId, {
      просмотры: currentViews + 1
    });
  }
</script>