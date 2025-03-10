//routes/auth.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Импортируйте модель User
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// Эндпоинт для регистрации
router.post('/register', async (req, res) => {
    const { email, username, password, name } = req.body;

    // Проверка на заполнение всех полей
    if (!email || !username || !password || !name) {
        return res.status(400).json({ message: 'Заполните все поля' });
    }

    try {
        // Проверка, существует ли пользователь с таким email
        const existingUser  = await User.findOne({ where: { email } });
        if (existingUser ) {
            return res.status(400).json({ message: 'Email уже используется' });
        }

        // Создание нового пользователя с инициализацией полей failed_attempts, is_locked и lock_until
        const user = await User.create({
            email,
            username,
            password,
            name,
            failed_attempts: 0, // Инициализация счетчика неудачных попыток
            is_locked: false,    // Инициализация состояния блокировки
            lock_until: null     // Инициализация времени блокировки
        });

        res.status(201).json({ message: 'Регистрация успешна' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Эндпоинт для авторизации
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Проверка на заполнение всех полей
    if (!email || !password) {
        return res.status(400).json({ message: 'Заполните все поля' });
    }
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    try {
        // Поиск пользователя по email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Неверный email или пароль' });
        }

        console.log('Создан пользователь с ID:', user.id);
        console.log('Пользователь найден:', user.name);
        console.log('Состояние блокировки:', user.is_locked);
        
        // Проверка блокировки аккаунта
        const now = new Date();
        if (user.is_locked && now < user.lock_until) {
            return res.status(403).json({ message: 'Аккаунт заблокирован. Попробуйте позже.' });
        }

        // Сброс блокировки, если время блокировки истекло
        if (user.is_locked && now >= user.lock_until) {
            user.is_locked = false;
            user.failed_attempts = 0;
            user.lock_until = null;
            await user.save();
        }

        // Проверка пароля
        console.log('Введенный пароль:', trimmedPassword);
        console.log('Хэш пароля из БД:', user.password);

        // Проверка пароля
        const isMatch = await user.validPassword(trimmedPassword);
        if (!isMatch) {
            user.failed_attempts += 1;

            // Проверка, превышает ли количество неудачных попыток лимит
            if (user.failed_attempts >= 5) { // Изменено на >= чтобы учитывать 5 попыток
                user.is_locked = true;
                user.lock_until = new Date(Date.now() + 30 * 60 * 1000); // Блокируем на 30 минут
                await user.save();
                return res.status(403).json({ message: 'Аккаунт заблокирован. Попробуйте позже.' });
            }

            await user.save();
            return res.status(401).json({ message: 'Неверный email или пароль' });
        }
        
        // Успешная аутентификация
        user.failed_attempts = 0; // Сбрасываем счетчик неудачных попыток
        await user.save();

        // Генерация JWT
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Авторизация успешна', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

export default router;
