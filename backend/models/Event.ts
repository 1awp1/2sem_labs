import { DataTypes, Model } from 'sequelize';
import { sequelize } from '@config/db';
import User from './User';

const categories = [
  'концерт',
  'лекция',
  'выставка',
  'семинар',
  'мастер-класс',
  'другое',
] as const;

export type EventCategory = (typeof categories)[number];

interface EventAttributes {
  id: number;
  title: string;
  description?: string;
  date: Date;
  createdBy: number;
  category: EventCategory;
}

// Используем Omit вместо пустого интерфейса
type EventCreationAttributes = Omit<EventAttributes, 'id'>;

class Event
  extends Model<EventAttributes, EventCreationAttributes>
  implements EventAttributes
{
  declare id: number;
  declare title: string;
  declare description?: string;
  declare date: Date;
  declare createdBy: number;
  declare category: EventCategory;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare creator?: User;
}

Event.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
      },
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    category: {
      type: DataTypes.ENUM(...categories),
      allowNull: false,
      defaultValue: 'другое',
      validate: {
        isIn: [categories],
      },
    },
  },
  {
    sequelize,
    tableName: 'events',
    timestamps: false,
    underscored: true,
  },
);

User.hasMany(Event, {
  foreignKey: 'createdBy',
  as: 'events',
});

Event.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator',
});

export default Event;
