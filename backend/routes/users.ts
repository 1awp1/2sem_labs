//routes/users.js
import { Request, Response, Router } from 'express';
import User from '../models/User';
import { ValidationError, UniqueConstraintError } from 'sequelize';

// Интерфейс для типизации тела запроса
interface CreateUserRequestBody {
  name: string;
  email: string;
  password: string;
  username: string;
}
// Типизация для обработки ошибок
interface ErrorWithStatus extends Error {
  status?: number;
}
const router = Router();
/**
 * @swagger
 * /users:
 *   post:
 *     summary: Создает нового пользователя
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Имя пользователя
 *               email:
 *                 type: string
 *                 description: Email пользователя
 *                 format: email
 *               password:
 *                 type: string
 *                 description: Пароль пользователя
 *                 format: password
 *             required:
 *               - name
 *               - email
 *               - password
 *     responses:
 *       201:
 *         description: Успешное создание пользователя
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Неверный запрос (отсутствуют обязательные поля или email уже существует)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Обработчик POST-запроса для создания нового пользователя
router.post<Record<string, never>, unknown, CreateUserRequestBody>(
  '/',
  async (
    req: Request<Record<string, never>, unknown, CreateUserRequestBody>,
    res: Response,
  ): Promise<void> => {
    try {
      const { name, email, password, username } = req.body;

      if (!name || !email || !password || !username) {
        res.status(400).json({
          message: 'Please provide name, email, and password',
        });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({ message: 'Invalid email format' });
        return;
      }

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        res.status(400).json({ message: 'Email already exists' });
        return;
      }

      const user = await User.create({
        name,
        email,
        password,
        username,
      });

      res.status(201).json(user);
    } catch (error) {
      console.error(error);

      if (error instanceof ValidationError) {
        const messages = error.errors.map((err) => err.message).join(', ');
        res.status(400).json({
          message: `Validation error: ${messages}`,
        });
        return;
      }

      if (error instanceof UniqueConstraintError) {
        res.status(400).json({
          message: 'Email already exists',
        });
        return;
      }

      res.status(500).json({ message: 'Server error' });
    }
  },
);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Получает список всех пользователей
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Успешный ответ с массивом пользователей
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Получение списка пользователей
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'username'],
    });
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Middleware обработки ошибок
router.use((err: ErrorWithStatus, req: Request, res: Response): void => {
  console.error(err.stack);

  // Обработка ошибки парсинга JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in req) {
    res.status(400).json({ message: 'Invalid JSON format' });
    return;
  }
  // Обработка других ошибок
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal Server Error',
  });
});

export default router;
