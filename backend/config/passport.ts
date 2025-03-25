import {
  Strategy as JwtStrategy,
  ExtractJwt,
  VerifiedCallback,
  StrategyOptionsWithoutRequest,
} from 'passport-jwt';
import passport from 'passport';
import { config } from 'dotenv';
import User from '../models/User';

config();

// Проверяем и получаем секрет
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('Переменная окружения JWT_SECRET не определена.');
}

// Тип для полезной нагрузки JWT
interface JwtPayload {
  id: number;
  [key: string]: unknown;
}

const configurePassport = (passportInstance: passport.PassportStatic): void => {
  const options: StrategyOptionsWithoutRequest = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: jwtSecret,
    passReqToCallback: false, // Явно указываем false
  };

  const verifyCallback = async (
    payload: JwtPayload,
    done: VerifiedCallback,
  ) => {
    try {
      const user = await User.findByPk(payload.id);
      return user ? done(null, user) : done(null, false);
    } catch (error) {
      return done(
        error instanceof Error ? error : new Error('Unknown error'),
        false,
      );
    }
  };

  passportInstance.use(new JwtStrategy(options, verifyCallback));
};

export { passport, configurePassport };
