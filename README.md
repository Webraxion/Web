# Web-платформа

Многостраничная веб-платформа с аутентификацией, форумом, новостями и чатом, использующая Appwrite.

## Настройка

1. **Appwrite проект**: Убедитесь, что у вас есть проект в Appwrite с ID `69d65bfa00283e8d6a6d` и endpoint `https://fra.cloud.appwrite.io/v1`.

2. **Отключите email verification**: В Appwrite Console → Project Settings → Auth → Email Verification → Disable, чтобы регистрация происходила автоматически без подтверждения email.

3. **Создайте базу данных**:
   - В Appwrite Console → Database → Create Database с ID `main`.

4. **Создайте коллекции**:
   - **forum_posts** (ID: `forum_posts`):
     - Поля: `title` (string), `content` (string), `authorName` (string), `category` (string), `views` (number)
     - Разрешения: Read: `role:all`, Write: `role:member`
   - **news_posts** (ID: `news_posts`):
     - Поля: `title` (string), `body` (string), `authorName` (string)
     - Разрешения: Read: `role:all`, Write: `role:member`
   - **chat_messages** (ID: `chat_messages`):
     - Поля: `message` (string), `authorName` (string)
     - Разрешения: Read: `role:all`, Write: `role:member`

5. **Развертывание**: Проект настроен для GitHub Pages. Убедитесь, что репозиторий подключен к GitHub Pages.

## Запуск локально

```bash
npm install
npm run dev
```

Откройте `http://localhost:3000` в браузере.

## Структура проекта

- `index.html` - Главная страница
- `login.html` - Страница входа
- `register.html` - Страница регистрации
- `forum.html` - Форум
- `news.html` - Новости
- `chat.html` - Чат
- `profile.html` - Профиль пользователя
- `about.html` - О нас
- `css/styles.css` - Стили
- `scripts/` - JavaScript модули
- `server.js` - Локальный backend (для разработки)</content>
<parameter name="filePath">/workspaces/Web/README.md