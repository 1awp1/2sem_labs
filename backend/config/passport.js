import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import User from '../models/User.js'; 
import dotenv from 'dotenv';
import passport from 'passport';

dotenv.config();

// Функция для настройки Passport
const configurePassport = () => {
  const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  };

  // Инициализация стратегии
  const jwtStrategy = new JwtStrategy(options, async (payload, done) => {
    try {
      const user = await User.findByPk(payload.id); // Используйте findByPk для поиска по первичному ключу
      if (user) {
        return done(null, user); // пользователь найден
      }
      return done(null, false); // пользователь не найден
    } catch (error) {
      return done(error, false); // ошибка при поиске пользователя
    }
  });

  // Используйте стратегию
  passport.use(jwtStrategy);
};

// Экспортируйте passport и функцию настройки
export { passport, configurePassport } ;
