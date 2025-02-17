    // index.js
    const express = require('express'); // Express для создания сервера
    const dotenv = require('dotenv');   // Dotenv для загрузки переменных окружения из .env
    const cors = require('cors');     // Cors для обработки запросов с других доменов.
    const { sequelize, authenticate } = require('./config/db'); // Импортируем sequelize и authenticate
    const User = require('./models/User'); // Импортируем модель User
    const Event = require('./models/Event'); // Импортируем модель Event
    const eventRoutes = require('./routes/events'); // Импортируем маршруты для мероприятий
    const userRoutes = require('./routes/users');   // Импортируем маршруты для пользователей

    dotenv.config(); // Загружаем переменные окружения из .env (если он есть)

    const app = express(); // Создаем экземпляр приложения Express
    const port = process.env.PORT || 3000; // Используем порт из .env или 3000 по умолчанию

    app.use(express.json()); // Middleware для обработки входящих JSON-запросов
    app.use(cors());         // Middleware для разрешения кросс-доменных запросов

    // Подключаем маршруты
    app.use('/events', eventRoutes); // Все маршруты для мероприятий начинаются с /events
    app.use('/users', userRoutes);   // Все маршруты для пользователей начинаются с /users

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
    authenticate(); // Вызываем функцию проверки подключения

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.error(`Port ${port} is already in use.`);
        } else {
          console.error('Error starting server:', err);
        }
      });