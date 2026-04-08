import { getPrivateMessages, sendPrivateMessage, getCurrentAccount } from './appwrite.js';

const chatStatus = document.getElementById('chat-status');
const contactSelect = document.getElementById('private-contact');
const messagesWindow = document.getElementById('private-messages');
const chatForm = document.getElementById('private-form');
const messageInput = document.getElementById('private-message-text');

const contacts = ['Алексей', 'Мария', 'Никита'];
let currentContact = contacts[0];

function setStatus(message) {
  if (chatStatus) chatStatus.textContent = message;
}

function renderMessages(messages) {
  if (!messagesWindow) return;
  if (!messages?.length) {
    messagesWindow.innerHTML = '<div class="chat-notice">Нет сообщений в этом чате.</div>';
    return;
  }
  messagesWindow.innerHTML = messages.map(msg => `
    <div class="chat-message ${msg.from === 'Вы' ? 'my-message' : 'other-message'}">
      <div class="chat-from">${msg.from}</div>
      <div class="chat-text">${msg.text}</div>
      <div class="chat-time">${msg.time}</div>
    </div>
  `).join('');
}

async function loadChat(contact) {
  try {
    const messages = await getPrivateMessages(contact);
    renderMessages(messages);
  } catch (error) {
    setStatus(`Не удалось загрузить чат: ${error.message}`);
  }
}

function fillContacts() {
  if (!contactSelect) return;
  contactSelect.innerHTML = contacts.map(contact => `
    <option value="${contact}">${contact}</option>
  `).join('');
}

async function initChat() {
  fillContacts();
  if (!contactSelect) return;
  currentContact = contactSelect.value || currentContact;
  try {
    const account = await getCurrentAccount();
    setStatus(`Вы вошли как ${account.name || account.email}`);
    await loadChat(currentContact);
  } catch {
    setStatus('Войдите в систему, чтобы использовать чат.');
    renderMessages([]);
  }
}

if (contactSelect) {
  contactSelect.addEventListener('change', async event => {
    currentContact = event.target.value;
    await loadChat(currentContact);
  });
}

if (chatForm) {
  chatForm.addEventListener('submit', async event => {
    event.preventDefault();
    const text = messageInput.value.trim();
    if (!text) return;
    try {
      await sendPrivateMessage(currentContact, text);
      await loadChat(currentContact);
      messageInput.value = '';
    } catch (error) {
      setStatus(`Ошибка отправки сообщения: ${error.message}`);
    }
  });
}

document.addEventListener('DOMContentLoaded', initChat);
