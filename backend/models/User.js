    // models/User.js
    const { DataTypes } = require('sequelize');
    const { sequelize } = require('../config/db'); // Импортируем sequelize

    const User = sequelize.define('User', { // Имя таблицы будет 'Users'
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
            }
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW // Дата создания по умолчанию
        }
    }, {
        tableName: 'users', // Явное указание имени таблицы (опционально)
        timestamps: false // Отключаем автоматическое добавление полей createdAt и updatedAt
    });

    module.exports = User;