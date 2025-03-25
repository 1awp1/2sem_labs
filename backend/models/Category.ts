import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db';

interface CategoryAttributes {
  id: number;
  name: string;
}

type CategoryCreationAttributes = Omit<CategoryAttributes, 'id'>;

class Category
  extends Model<CategoryAttributes, CategoryCreationAttributes>
  implements CategoryAttributes
{
  declare id: number;
  declare name: string;

  public static associate(): void {
    // Реализация ассоциаций будет добавлена позже
  }
}

Category.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [2, 50], // Минимальная и максимальная длина названия
      },
    },
  },
  {
    sequelize,
    tableName: 'categories',
    timestamps: false,
    underscored: true, // Использовать snake_case для названий полей
  },
);

export default Category;
