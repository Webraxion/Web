// Чат с сохранением сообщений в localStorage
const messagesDiv = document.getElementById("messages");
const input = document.getElementById("chat-input");
const btn = document.getElementById("send-btn");

// Загружаем сообщения из localStorage
let messages = JSON.parse(localStorage.getItem("chatMessages")) || [];

// Функция отображения сообщений
function renderMessages() {
  messagesDiv.innerHTML = "";
  messages.forEach(msg => {
    const div = document.createElement("div");
    div.className = "message";
    div.textContent = msg;
    messagesDiv.appendChild(div);
  });
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Добавление нового сообщения
btn.addEventListener("click", () => {
  const text = input.value.trim();
  if(!text) return;
  messages.push(text);
  localStorage.setItem("chatMessages", JSON.stringify(messages));
  input.value = "";
  renderMessages();
});

// Отправка по Enter
input.addEventListener("keypress", e => {
  if(e.key === "Enter") btn.click();
});

// Инициализация
renderMessages();
console.log("Чат загружен и готов к работе!");
