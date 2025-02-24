// models/Category.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true // Желательно, чтобы названия категорий были уникальными
  }
}, {
  tableName: 'categories',
  timestamps: false // Или true, если вам нужно отслеживать время создания/изменения
});

module.exports = Category;
