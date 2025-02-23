    // models/Event.js
    const { DataTypes } = require('sequelize');
    const { sequelize } = require('../config/db'); // Импортируем sequelize
    const User = require('./User'); // Импортируем модель User

    const Event = sequelize.define('Event', {  // Имя таблицы будет 'Events'
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false // Название обязательно
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true // Описание не обязательно
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false // Дата обязательна
        },
        createdBy: {
            type: DataTypes.INTEGER,
            allowNull: false, // ID пользователя обязателен
            references: {
                model: User, // Связь с моделью User
                key: 'id'    // Поле, на которое ссылаемся (id пользователя)
            }
        },
        category: {
            type: DataTypes.ENUM('концерт', 'лекция', 'выставка', 'семинар', 'мастер-класс', 'другое'),
            allowNull: false, // Категория обязательна
            defaultValue: 'другое' // Значение по умолчанию
        }
    }, {
      tableName: 'events', // Явное указание имени таблицы (опционально)
      timestamps: false // Отключаем автоматическое добавление полей createdAt и updatedAt
    });

    // Определение связи: Одному пользователю принадлежит много мероприятий
    User.hasMany(Event, {
        foreignKey: 'createdBy', // Внешний ключ в таблице Event
        as: 'events'           // Псевдоним для связи (опционально)
    });

    Event.belongsTo(User, {
        foreignKey: 'createdBy', // Внешний ключ в таблице Event
        as: 'creator'           // Псевдоним для связи (опционально)
    });

    module.exports = Event;