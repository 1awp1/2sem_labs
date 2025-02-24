// index.js
const express = require('express'); // Express для создания сервера
const dotenv = require('dotenv');   // Dotenv для загрузки переменных окружения из .env
const cors = require('cors');     // Cors для обработки запросов с других доменов.
const { sequelize, authenticate } = require('./config/db'); // Импортируем sequelize и authenticate
const User = require('./models/User'); // Импортируем модель User
const Event = require('./models/Event'); // Импортируем модель Event
const eventRoutes = require('./routes/events'); // Импортируем маршруты для мероприятий
const userRoutes = require('./routes/users');   // Импортируем маршруты для пользователей
const swaggerUi = require('swagger-ui-express'); // Импортируем swagger-ui-express
const swaggerSpec = require('./swaggerOptions'); // Импортируем swaggerSpec
const morgan = require('morgan');
const fs = require('fs'); // Для записи в файл
const path = require('path');
console.log("Path module loaded:", typeof path); // добавил для  const logStream
const rateLimiter = require('./middleware/rateLimet');
const errorHandler = require('./middleware/errorHandler');

dotenv.config(); // Загружаем переменные окружения из .env (если он есть)

const app = express(); // Создаем экземпляр приложения Express
const port = process.env.PORT || 3000; // Используем порт из .env или 3000 по умолчанию

app.use(rateLimiter);
app.use(cors());         // Middleware для разрешения кросс-доменных запросов

// Middleware для обработки входящих JSON-запросов С ОБРАБОТКОЙ ОШИБОК
app.use(express.json({
  strict: true, // Важно:  строгий режим JSON, отбрасывает все, что не JSON
  limit: '1mb' // Ограничение размера тела запроса
}));


// Подключаем Swagger UI
app.use('/api-docs', swaggerUi.serve,
  swaggerUi.setup(swaggerSpec));

// Подключаем маршруты
app.use('/events', eventRoutes); // Все маршруты для мероприятий начинаются с /events
app.use('/users', userRoutes);   // Все маршруты для пользователей начинаются с /users

app.get('/', (req, res) => {
  res.json({ message: 'Hello from Express!' });
});

//...
app.use(morgan('dev')); // 'dev' - компактный формат
const logStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: logStream }));
//..

// Синхронизация моделей с базой данных
sequelize.sync({ force: false }) // { force: true } - удалит все таблицы и создаст их заново!
  .then(() => {
    console.log('Database synced successfully.');
  })
  .catch(err => {
    console.error('Error syncing database:', err);
  });

// Проверка подключения к базе данных
authenticate(); // Вызываем функцию проверки подключения

// Обработчик ошибок JSON-парсинга
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error("Bad JSON:", err);
    return res.status(400).send({ error: "Invalid JSON format" });
  }
  next(); // Передаем обработку ошибки дальше, если это не ошибка JSON
});

// ВАЖНО:  Установите errorHandler *ПОСЛЕ* всех ваших маршрутов и других middleware.
app.use(errorHandler); // Добавили middleware для централизованной обработки ошибок


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use.`);
  }
});