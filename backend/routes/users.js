const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 • @swagger
 • /users:
 •   post:
 •     summary: Создает нового пользователя
 •     tags: [Users]
 •     requestBody:
 •       required: true
 •       content:
 •         application/json:
 •           schema:
 •             type: object
 •             properties:
 •               name:
 •                 type: string
 •                 description: Имя пользователя
 •               email:
 •                 type: string
 •                 description: Email пользователя
 •             required:
 •               - name
 •               - email
 •     responses:
 •       201:
 •         description: Успешное создание пользователя
 •         content:
 •           application/json:
 •             schema:
 •               $ref: '#/components/schemas/User'
 •       400:
 •         description: Неверный запрос (отсутствуют обязательные поля или email уже существует)
 •         content:
 •           application/json:
 •             schema:
 •               $ref: '#/components/schemas/Error'
 •       500:
 •         description: Ошибка сервера
 •         content:
 •           application/json:
 •             schema:
 •               $ref: '#/components/schemas/Error'
 */
router.post('/', async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({ message: 'Please provide name and email' });
        }

        // Validate email format (basic check)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const user = await User.create({ name, email });
        res.status(201).json(user);
    } catch (error) {
        console.error(error);

        if (error.name === 'SequelizeValidationError') {
            // Sequelize validation errors (e.g., too long name)
            const messages = error.errors.map(err => err.message).join(', ');
            return res.status(400).json({ message: `Validation error: ${messages}` });
        }

        if (error.name === 'SequelizeUniqueConstraintError') {
             // Handle unique constraint errors (e.g., duplicate email - although we already check)
            return res.status(400).json({ message: 'Email already exists' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 • @swagger
 • /users:
 •   get:
 •     summary: Получает список всех пользователей
 •     tags: [Users]
 •     responses:
 •       200:
 •         description: Успешный ответ с массивом пользователей
 •         content:
 •           application/json:
 •             schema:
 •               type: array
 •               items:
 •                 $ref: '#/components/schemas/User'
 •       500:
 •         description: Ошибка сервера
 •         content:
 •           application/json:
 •             schema:
 •               $ref: '#/components/schemas/Error'
 */
router.get('/', async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Error handling middleware (place after all routes)
router.use((err, req, res, next) => {
  console.error(err.stack);  // Log the stack trace for debugging
  if (err instanceof SyntaxError && err.status === 400 && 'body' in req) {
      return res.status(400).json({ message: 'Invalid JSON format' });
  }
  next(err);  // Pass the error to the next error handling middleware
});

module.exports = router;