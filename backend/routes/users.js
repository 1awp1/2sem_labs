    // routes/users.js
    const express = require('express');
    const router = express.Router();
    const User = require('../models/User');

    // Создание нового пользователя (POST /users)
    router.post('/', async (req, res) => {
        try {
            const { name, email } = req.body;

            if (!name || !email) {
                return res.status(400).json({ message: 'Please provide name and email' });
            }

            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already exists' });
            }

            const user = await User.create({ name, email });
            res.status(201).json(user);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    });

    // Получение списка пользователей (GET /users)
    router.get('/', async (req, res) => {
        try {
            const users = await User.findAll();
            res.status(200).json(users);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    });

    module.exports = router;