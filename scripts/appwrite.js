import { Client, Account, Databases, ID, Query } from "https://cdn.jsdelivr.net/npm/appwrite@8.1.0/dist/appwrite.min.js";

const client = new Client();
client
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("69d64e50001a12cb1240");

const account = new Account(client);
const databases = new Databases(client);

const DATABASE_ID = "69d64eb3002e5d21f507";
const COLLECTION_FORUM = "forum";
const COLLECTION_NEWS = "news";
const COLLECTION_PRIVATE = "private_chat";

export async function register(email, password, name) {
  return account.create(ID.unique(), email, password, name);
}

export async function login(email, password) {
  return account.createEmailSession(email, password);
}

export async function logout() {
  return account.deleteSession('current');
}

export async function getCurrentAccount() {
  return account.get();
}

export async function getPosts() {
  return databases.listDocuments(DATABASE_ID, COLLECTION_FORUM);
}

export async function createPost(title, content, author, category, tags = []) {
  return databases.createDocument(
    DATABASE_ID,
    COLLECTION_FORUM,
    {
      заголовок: title,
      содержание: content,
      авторИмя: author,
      дата_публикации: new Date().toISOString(),
      категория: category,
      просмотры: 0,
      теги: tags
    },
    ["*"],
    ["*"]
  );
}

export async function getNewsPosts() {
  return databases.listDocuments(DATABASE_ID, COLLECTION_NEWS);
}

export async function createNewsPost(title, body, author) {
  return databases.createDocument(
    DATABASE_ID,
    COLLECTION_NEWS,
    {
      заголовок: title,
      содержание: body,
      автор: author,
      дата: new Date().toISOString()
    },
    ["*"],
    ["*"]
  );
}

export async function getPrivateMessages(chatId) {
  return databases.listDocuments(
    DATABASE_ID,
    COLLECTION_PRIVATE,
    [Query.equal('chatId', chatId)]
  );
}

export async function sendPrivateMessage(chatId, text, author) {
  return databases.createDocument(
    DATABASE_ID,
    COLLECTION_PRIVATE,
    {
      chatId,
      text,
      author,
      время: new Date().toISOString()
    },
    ["*"],
    ["*"]
  );
}
