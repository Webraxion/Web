const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());

async function ensureDataFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(DATA_FILE);
  } catch {
    const initialData = {
      users: [],
      forumPosts: [
        {
          id: '1',
          title: 'Добро пожаловать на платформу',
          content: 'Это начало вашего форума. Создавайте темы, обсуждайте новости и общайтесь в личных чатах.',
          author: 'Админ',
          category: 'Общие',
          tags: ['Appwrite', 'Сообщество'],
          views: 120,
          createdAt: new Date().toISOString()
        }
      ],
      newsPosts: [
        {
          id: '1',
          title: 'Первое объявление',
          body: 'Платформа готова. Вы можете зарегистрироваться и публиковать новости.',
          author: 'Админ',
          date: new Date().toLocaleDateString('ru-RU')
        }
      ],
      privateChats: {
        'Алексей': [
          { from: 'Алексей', text: 'Привет! Как дела?', time: '10:15' }
        ],
        'Мария': [
          { from: 'Мария', text: 'Привет! Готов обсудить проект.', time: '11:00' }
        ]
      }
    };
    await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf8');
  }
}

async function readData() {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, 'utf8');
  return JSON.parse(raw);
}

async function writeData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '12h' });
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Требуется токен авторизации' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Неверный токен' });
  }
}

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Имя, email и пароль обязательны' });
  }

  const data = await readData();
  const exists = data.users.find(user => user.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
  }

  const hash = bcrypt.hashSync(password, 8);
  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    password: hash,
    createdAt: new Date().toISOString()
  };
  data.users.push(newUser);
  await writeData(data);
  const token = generateToken(newUser);
  return res.json({ user: { id: newUser.id, name: newUser.name, email: newUser.email }, token });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email и пароль обязательны' });
  }

  const data = await readData();
  const user = data.users.find(user => user.email.toLowerCase() === email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(400).json({ message: 'Неверный email или пароль' });
  }

  const token = generateToken(user);
  return res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  const data = await readData();
  const user = data.users.find(user => user.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'Пользователь не найден' });
  }
  return res.json({ id: user.id, name: user.name, email: user.email });
});

app.get('/api/forum', async (req, res) => {
  const data = await readData();
  return res.json(data.forumPosts || []);
});

app.post('/api/forum', authMiddleware, async (req, res) => {
  const { title, content, category, tags } = req.body;
  if (!title || !content) {
    return res.status(400).json({ message: 'Заголовок и текст темы обязательны' });
  }

  const data = await readData();
  const post = {
    id: Date.now().toString(),
    title,
    content,
    author: req.user.name,
    category: category || 'Общие',
    tags: Array.isArray(tags) ? tags : [],
    views: 0,
    createdAt: new Date().toISOString()
  };
  data.forumPosts.unshift(post);
  await writeData(data);
  return res.json(post);
});

app.get('/api/news', async (req, res) => {
  const data = await readData();
  return res.json(data.newsPosts || []);
});

app.post('/api/news', authMiddleware, async (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) {
    return res.status(400).json({ message: 'Заголовок и текст новости обязательны' });
  }

  const data = await readData();
  const news = {
    id: Date.now().toString(),
    title,
    body,
    author: req.user.name,
    date: new Date().toLocaleDateString('ru-RU')
  };
  data.newsPosts.unshift(news);
  await writeData(data);
  return res.json(news);
});

app.get('/api/private/:contact', authMiddleware, async (req, res) => {
  const { contact } = req.params;
  const data = await readData();
  const thread = data.privateChats[contact] || [];
  return res.json(thread);
});

app.post('/api/private/:contact', authMiddleware, async (req, res) => {
  const { contact } = req.params;
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ message: 'Сообщение не может быть пустым' });
  }

  const data = await readData();
  data.privateChats[contact] = data.privateChats[contact] || [];
  const message = {
    from: req.user.name,
    text,
    time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  };
  data.privateChats[contact].push(message);
  await writeData(data);
  return res.json(message);
});

app.use(express.static(path.join(__dirname)));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
