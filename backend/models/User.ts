import { Model, DataTypes } from 'sequelize';
import { sequelize } from '@config/db';
import bcrypt from 'bcryptjs';

interface UserAttributes {
  id: number;
  name: string;
  lastName: string;
  middleName?: string | null;
  email: string;
  username: string;
  password: string;
  gender?: 'male' | 'female' | 'other' | null;
  birthDate?: string | null;
  failed_attempts?: number;
  is_locked?: boolean;
  lock_until?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

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
  declare lastName: string;
  declare middleName?: string | null;
  declare email: string;
  declare username: string;
  declare password: string;
  declare gender?: 'male' | 'female' | 'other' | null;
  declare birthDate?: string | null;
  declare failed_attempts: number;
  declare is_locked: boolean;
  declare lock_until: Date | null;
  declare createdAt: Date;
  declare updatedAt: Date;

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
        len: [1, 100],
      },
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100],
      },
    },
    middleName: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        notEmpty: true,
        len: [0, 100],
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
     gender: {
      type: DataTypes.ENUM('male', 'female', 'other'),
      allowNull: true,
      validate: {
        isIn: [['male', 'female', 'other']],
      },
    },
    birthDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isDate: true,
        isBefore: new Date().toISOString(), // Дата должна быть в прошлом
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
    sequelize,
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
