// models/User.ts
import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db'; // Убедитесь, что импорт правильный
import bcrypt from 'bcryptjs';

interface UserAttributes {
  id: number;
  name: string;
  email: string;
  username: string;
  password: string;
  failed_attempts?: number;
  is_locked?: boolean;
  lock_until?: Date | null;
  createdAt?: Date;
  updatedAt?: Date; // Добавьте это поле
}

// Заменяем пустой интерфейс на тип с Omit
type UserCreationAttributes = Omit<
  UserAttributes,
  'id' | 'createdAt' | 'updatedAt'
> & {
  failed_attempts?: number;
  is_locked?: boolean;
  lock_until?: Date | null;
};

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  declare id: number;
  declare name: string;
  declare email: string;
  declare username: string;
  declare password: string;
  declare failed_attempts: number;
  declare is_locked: boolean;
  declare lock_until: Date | null;
  declare createdAt: Date;
  declare updatedAt: Date; // Добавьте это

  public validPassword = async (password: string): Promise<boolean> => {
    return await bcrypt.compare(password, this.password);
  };
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100],
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true,
      },
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [3, 50],
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [8, 100],
        notEmpty: true,
      },
    },
    failed_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    is_locked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    lock_until: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize, // Добавьте этот обязательный параметр
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: async (user: User) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
    },
  },
);

export default User;
