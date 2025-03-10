// config/db.js
import { Sequelize } from 'sequelize';
import { config } from 'dotenv';

config(); // Загружаем переменные окружения из .env

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: process.env.DB_DIALECT || 'postgres',
        logging: false // Отключаем логирование SQL-запросов в консоль 
    }
);

async function authenticate() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

// Экспортируем sequelize и authenticate как именованные экспорты
export { sequelize, authenticate };
