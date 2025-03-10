// models/Category.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js'; 

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
  timestamps: false // Или true,если нужно отслеживать время создания/изменения
});

// Используем именованный экспорт
export default Category;
