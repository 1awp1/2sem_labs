import { Sequelize } from 'sequelize';
import { config } from 'dotenv';

config(); // Загружаем переменные окружения из .env

// Проверяем, что все необходимые переменные окружения определены
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT
  ? parseInt(process.env.DB_PORT, 10)
  : undefined;

// Убедимся, что dialect соответствует одному из допустимых значений
const dbDialect =
  (process.env.DB_DIALECT as
    | 'mysql'
    | 'postgres'
    | 'sqlite'
    | 'mariadb'
    | 'mssql') || 'postgres';

if (!dbName || !dbUser || !dbPassword || !dbHost) {
  throw new Error(
    'Необходимые переменные окружения для базы данных не определены.',
  );
}

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: dbDialect, // Теперь dbDialect имеет тип Dialect
  logging: false, // Отключаем логирование SQL-запросов в консоль
});

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
