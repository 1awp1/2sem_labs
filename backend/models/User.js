// models/User.js
import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js'; 
import bcrypt from 'bcryptjs';

const User = sequelize.define('User ', { 
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false // Имя обязательно
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false, // Email обязателен
        unique: true, // Email должен быть уникальным
        validate: {
            isEmail: true // Проверка формата email
        },
    },
    password: { // Добавляем поле password
        type: DataTypes.STRING,
        allowNull: false // Пароль обязателен
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW // Дата создания по умолчанию
    }
}, {
    tableName: 'users', // Явное указание имени таблицы
    timestamps: true, // Включаем автоматическое добавление полей createdAt и updatedAt
});

// Хеширование пароля перед сохранением
User .beforeCreate(async (user) => {
    console.log('User  data before creation:', user);
    if (user.password && typeof user.password === 'string') { // Проверяем, что пароль существует и является строкой
        user.password = await bcrypt.hash(user.password, 10); // Хешируем пароль
    } else {
        throw new Error('Password is required and must be a string'); // Выбрасываем ошибку, если пароль отсутствует или не строка
    }
});

// Метод для проверки пароля
User .prototype.validPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

export default User; // Экспортируем User по умолчанию
