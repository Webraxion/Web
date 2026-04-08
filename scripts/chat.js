// Конфигурация
const REPO = "username/repo"; // <--- замените на ваш user/repo
const ISSUE_TITLE = "Chat Room";
const TOKEN = "ghp_yourPersonalAccessToken"; // <--- ваш токен GitHub
const API_BASE = "https://api.github.com";

const messagesDiv = document.getElementById("messages");
const input = document.getElementById("chat-input");
const btn = document.getElementById("send-btn");

// Получение issue ID по названию
async function getIssueId() {
  const res = await fetch(`${API_BASE}/repos/${REPO}/issues`, {
    headers: { Authorization: `token ${TOKEN}` }
  });
  const issues = await res.json();
  const issue = issues.find(i => i.title === ISSUE_TITLE);
  return issue.number;
}

// Получение комментариев
async function loadMessages() {
  const issueId = await getIssueId();
  const res = await fetch(`${API_BASE}/repos/${REPO}/issues/${issueId}/comments`, {
    headers: { Authorization: `token ${TOKEN}` }
  });
  const comments = await res.json();
  messagesDiv.innerHTML = "";
  comments.forEach(c => {
    const div = document.createElement("div");
    div.className = "message";
    div.textContent = `${c.user.login}: ${c.body}`;
    messagesDiv.appendChild(div);
  });
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Отправка нового сообщения
async function sendMessage(text) {
  const issueId = await getIssueId();
  await fetch(`${API_BASE}/repos/${REPO}/issues/${issueId}/comments`, {
    method: "POST",
    headers: {
      "Authorization": `token ${TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ body: text })
  });
  await loadMessages();
}

// Обработчики
btn.addEventListener("click", async () => {
  const text = input.value.trim();
  if(!text) return;
  input.value = "";
  await sendMessage(text);
});

input.addEventListener("keypress", async e => {
  if(e.key === "Enter") btn.click();
});

// Инициализация
loadMessages();
console.log("Чат через GitHub загружен!");