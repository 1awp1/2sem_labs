import express from 'express'; // Express для создания сервера
import dotenv from 'dotenv';   // Dotenv для загрузки переменных окружения из .env
import cors from 'cors';       // Cors для обработки запросов с других доменов
import { sequelize, authenticate } from './config/db.js'; // Импортируем sequelize и authenticate
import User from './models/User.js'; 
import Event from './models/Event.js'; 
import eventRoutes from './routes/events.js'; 
import userRoutes from './routes/users.js';   
import swaggerUi from 'swagger-ui-express'; 
import swaggerSpec from './swaggerOptions.js'; 
import morgan from 'morgan'; // Логирование запросов
import fs from 'fs'; // Для записи в файл
import path from 'path';
import rateLimit from 'express-rate-limit';
import errorHandler from './middleware/errorHandler.js'; 
import passport from 'passport'; 
import { configurePassport } from './config/passport.js'; 
import authRoutes from './routes/auth.js'; 
import { fileURLToPath } from 'url';
import publicRoutes from "./routes/public.js"; 
import protectedRoutes from "./routes/index.js";
import session from 'express-session'; 

dotenv.config(); // Загружаем переменные окружения из .env (если он есть)

const app = express(); // Создаем экземпляр приложения Express
const port = process.env.PORT || 3000; // Используем порт из .env или 3000 по умолчанию

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // ограничение до 100 запросов за 15 минут
  message: 'Слишком много запросов с вашего IP, попробуйте позже.'
});

app.use(limiter);
app.use(cors()); // Middleware для разрешения кросс-доменных запросов

// Middleware для обработки входящих JSON-запросов с обработкой ошибок
app.use(express.json({
  strict: true, // Важно: строгий режим JSON, отбрасывает все, что не JSON
  limit: '1mb' // Ограничение размера тела запроса
}));

// Middleware для обработки сессий
app.use(session({
  secret: process.env.SESSION_SECRET || '1234', // Замените на ваш секрет
  resave: false,
  saveUninitialized: true,
}));

configurePassport(passport); 
app.use(passport.initialize());
app.use(passport.session());


// Подключаем Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Подключаем маршруты
app.use('/public', publicRoutes);
app.use('/auth', authRoutes); // Используем маршруты аутентификации
app.use('/events', eventRoutes); // Все маршруты для мероприятий начинаются с /events
app.use('/users', userRoutes);   // Все маршруты для пользователей начинаются с /users
app.use("/", publicRoutes); // Добавляем публичные маршруты
app.use('/protected', protectedRoutes); // Защищенные маршруты

// Обработчик ошибок JSON-парсинга
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error("Bad JSON:", err);
    return res.status(400).send({ error: "Invalid JSON format" });
  }
  next(); // Передаем обработку ошибки дальше, если это не ошибка JSON
});

const __filename = fileURLToPath(import.meta.url); // Преобразуем в путь
const __dirname = path.dirname(__filename); // Получаем директорию
// Логирование запросов
const logStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: logStream }));
app.use(morgan('dev')); // 'dev' - компактный формат


app.use(errorHandler); // Добавили middleware для централизованной обработки ошибок

app.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.send('Вы получили доступ к защищенному ресурсу!');
});

app.get('/', (req, res) => {
  res.json({ message: 'Hello from Express!' });
});

// Синхронизация моделей с базой данных
sequelize.sync({ force: false }) // { force: true } - удалит все таблицы и создаст их заново!
.then(() => {
  console.log('Database synced successfully.');
})
.catch(err => {
  console.error('Error syncing database:', err);
});

// Проверка подключения к базе данных
authenticate() // Вызываем функцию проверки подключения
.then(() => {
  console.log('Database connection successful.');
})
.catch(err => {
  console.error('Error connecting to the database:', err);
});

// Запуск сервера
app.listen(port, () => {
console.log(`Server is running on port ${port}`);
}).on('error', (err) => {
if (err.code === 'EADDRINUSE') {
  console.error(`Port ${port} is already in use.`);
} else {
  console.error('Error starting server:', err);
}
});

