import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '@models/User';
import dotenv from 'dotenv';
import { ValidationError } from 'sequelize';

dotenv.config();
const router = Router();

interface RegisterRequestBody {
  email: string;
  username: string;
  password: string;
  name: string;
  lastName: string;
  middleName?: string;
  gender: 'male' | 'female' | 'other';
  birthDate: string;
}

interface LoginRequestBody {
  email: string;
  password: string;
}

// Используем Record<string, never> вместо пустых интерфейсов
type EmptyRequestParams = Record<string, never>;

interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: number;
    name: string;
    lastName: string;
    middleName?: string | null;
    email: string;
    password: string;
    username: string;
    gender?: 'male' | 'female' | 'other' | null;
    birthDate?: string | null;
  };
}

interface ErrorResponse {
  message: string;
}

router.post(
  '/register',
  async (
    req: Request<Record<string, never>, LoginResponse | ErrorResponse, RegisterRequestBody>,
    res: Response<LoginResponse | ErrorResponse>,
  ): Promise<void> => {
    const { email, username, password, name, lastName, middleName, gender, birthDate } = req.body;

    if (!email || !username || !password || !name || !lastName || !gender || !birthDate) {
      res.status(400).json({ message: 'Заполните все поля' });
      return;
    }
    try {
      const existingUserByEmail = await User.findOne({ where: { email } });
      if (existingUserByEmail) {
        res.status(400).json({ message: 'Email уже используется' });
        return;
      }

      const existingUserByUsername = await User.findOne({
        where: { username },
      });
      if (existingUserByUsername) {
        res.status(400).json({ message: 'Username пользователя уже занято' });
        return;
      }

      const user = await User.create({
        email,
        username,
        password,
        name,
        lastName,
        middleName: middleName || null,
        gender,
        birthDate,
        failed_attempts: 0,
        is_locked: false,
        lock_until: null,
      });

      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET не настроен');
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });

      res.status(201).json({
        message: 'Регистрация успешна',
        token,
        user: {
          id: user.id,
          name: user.name,
          lastName: user.lastName,
          middleName: user.middleName,
          gender:user.gender,
          birthDate:user.birthDate,
          email: user.email,
          password: user.password,
          username: user.username,
        },
      });
    } catch (error) {
      console.error('Ошибка регистрации:', error);

      if (error instanceof ValidationError) {
        const messages = error.errors.map((err) => err.message);
        res.status(400).json({
          message: messages.join(', '),
        });
        return;
      }

      res.status(500).json({ message: 'Ошибка сервера' });
    }
  },
);

router.post<
  EmptyRequestParams,
  LoginResponse | ErrorResponse,
  LoginRequestBody
>(
  '/login',
  async (
    req: Request<
      EmptyRequestParams,
      LoginResponse | ErrorResponse,
      LoginRequestBody
    >,
    res: Response<LoginResponse | ErrorResponse>,
  ): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Заполните все поля' });
      return;
    }

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    try {
      const user = await User.findOne({ where: { email: trimmedEmail } });
      if (!user) {
        res.status(401).json({ message: 'Неверный email или пароль' });
        return;
      }

      const now = new Date();
      if (user.is_locked && now < user.lock_until!) {
        res
          .status(403)
          .json({ message: 'Аккаунт заблокирован. Попробуйте позже.' });
        return;
      }

      if (user.is_locked && now >= user.lock_until!) {
        user.is_locked = false;
        user.failed_attempts = 0;
        user.lock_until = null;
        await user.save();
      }

      const isMatch = await bcrypt.compare(trimmedPassword, user.password);
      if (!isMatch) {
        user.failed_attempts = (user.failed_attempts ?? 0) + 1;

        if (user.failed_attempts >= 5) {
          user.is_locked = true;
          user.lock_until = new Date(Date.now() + 30 * 60 * 1000);
          await user.save();
          res
            .status(403)
            .json({ message: 'Аккаунт заблокирован. Попробуйте позже.' });
          return;
        }

        await user.save();
        res.status(401).json({ message: 'Неверный email или пароль' });
        return;
      }

      user.failed_attempts = 0;
      await user.save();

      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET не настроен');
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });

      res.json({
        message: 'Авторизация успешна',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          password: user.password,
          lastName: user.lastName,
          middleName: user.middleName,
          username: user.username,
          gender: user.gender,
          birthDate: user.birthDate,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  },
);

export default router;
