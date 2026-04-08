// Пример скрипта для динамического добавления тем на главную страницу

const generalTopics = [
  "Приветствие новых участников",
  "Новости форума",
  "Предложения и идеи"
];

const techTopics = [
  "Веб-разработка",
  "Программирование",
  "Секреты и лайфхаки"
];

const funTopics = [
  "Игры и гейминг",
  "Фильмы и сериалы",
  "Музыка"
];

// Функция для добавления карточек
function renderTopics(topics, containerId) {
  const container = document.getElementById(containerId);
  topics.forEach(topic => {
    const card = document.createElement("div");
    card.classList.add("topic-card");
    card.innerHTML = `<a href="#">${topic}</a>`;
    container.appendChild(card);
  });
}

// Загружаем темы
renderTopics(generalTopics, "general-topics");
renderTopics(techTopics, "tech-topics");
renderTopics(funTopics, "fun-topics");

console.log("Главная страница форума загружена и темы отображены!");
