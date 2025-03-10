// routes/auth.js
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

        // Хеширование пароля
        const hashedPassword = await bcrypt.hash(password, 10);

        // Создание нового пользователя
        const user = await User.create({ email, username, password: hashedPassword, name });

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

    try {
        // Поиск пользователя по email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Неверный email или пароль' });
        }

        // Проверка пароля
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Неверный email или пароль' });
        }

        // Генерация JWT
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Авторизация успешна', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

export default router;
