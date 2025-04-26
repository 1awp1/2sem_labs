//routes/users.js
import { Request, Response, Router } from 'express';
import User from '@models/User';
import Event from '@models/Event';
import { ValidationError, UniqueConstraintError } from 'sequelize';
import { passport } from '@config/passport';

// Интерфейс для типизации тела запроса
interface CreateUserRequestBody {
  name: string;
  email: string;
  password: string;
  username: string;
}

interface UpdateUserRequestBody {
  name?: string;
  email?: string;
  username?: string;
}

// Типизация для обработки ошибок
interface ErrorWithStatus extends Error {
  status?: number;
}

interface ErrorResponse {
  message: string;
}
interface UserResponse {
  id: number;
  name: string;
  email: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}
// Объявляем расширение типа Request для Express
declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: number;
    };
  }
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
      attributes: ['id', 'name', 'email', 'username', 'password'],
    });
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Получает данные пользователя по ID (без пароля)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Успешный ответ с данными пользователя
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Пользователь не найден
 *       500:
 *         description: Ошибка сервера
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }, // Исключаем пароль из ответа
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /users/{id}/events:
 *   get:
 *     summary: Получает список мероприятий пользователя
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Успешный ответ с массивом мероприятий
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 *       500:
 *         description: Ошибка сервера
 */
router.get('/me/events', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = parseInt(id, 10);
   
    console.log('Получен ID пользователя:', id); // Добавляем логирование
    const events = await Event.findAll({
      where: { createdBy: userId },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'username'], // Указываем только нужные поля пользователя
        },
        // Можно добавить другие ассоциации, если они есть
      ],
    });
    console.log('Получены события:', events); // Добавляем логирование
    res.status(200).json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Получает данные текущего пользователя (без пароля)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Успешный ответ с данными пользователя
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Пользователь не авторизован
 *       500:
 *         description: Ошибка сервера
 */
router.get('/me', async (req: Request, res: Response): Promise<void> => {
  try {
    // Предполагаем, что пользователь добавлен в req через middleware аутентификации
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }, // Исключаем пароль из ответа
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


/**
 * @swagger
 * /users/me:
 *   patch:
 *     summary: Обновляет данные текущего пользователя
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               username:
 *                 type: string
 *     responses:
 *       200:
 *         description: Данные пользователя обновлены
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Неверный запрос
 *       401:
 *         description: Не авторизован
 *       500:
 *         description: Ошибка сервера
 */
// Обновление пользователя
router.put<{id: string}, UserResponse | ErrorResponse, UpdateUserRequestBody>(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  async (
    req: Request<{id: string}, UserResponse | ErrorResponse, UpdateUserRequestBody>,
    res: Response<UserResponse | ErrorResponse>
  ): Promise<void> => {
    try {
      // Теперь req.user точно будет существовать после passport.authenticate
      if (!req.user) {
        throw new Error('Пользователь не найден в запросе');
      }

      const { name, email, username } = req.body;
      const { id } = req.params;
      const userId = parseInt(id, 10);

      // Проверка ID из токена и из URL
      if (req.user.id !== userId) {
        res.status(403).json({ message: 'Нет прав на обновление этого пользователя' });
        return;
      }

      // Проверка наличия хотя бы одного поля для обновления
      if (!name && !email && !username) {
        res.status(400).json({ message: 'Необходимо указать хотя бы одно поле для обновления' });
        return;
      }

      const user = await User.findByPk(userId);
      
      if (!user) {
        res.status(404).json({ message: 'Пользователь не найден' });
        return;
      }

      // Проверка уникальности email
      if (email && email !== user.email) {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          res.status(400).json({ message: 'Email уже используется' });
          return;
        }
      }

      // Проверка уникальности username
      if (username && username !== user.username) {
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
          res.status(400).json({ message: 'Username уже используется' });
          return;
        }
      }

      // Обновляем только указанные поля
      if (name) user.name = name;
      if (email) user.email = email;
      if (username) user.username = username;

      await user.save();

      // Формируем ответ
      const response: UserResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Ошибка при обновлении пользователя:', error);

      if (error instanceof ValidationError) {
        const messages = error.errors.map(err => err.message).join(', ');
        res.status(400).json({ message: `Ошибка валидации: ${messages}` });
        return;
      }

      if (error instanceof UniqueConstraintError) {
        res.status(400).json({ message: 'Email или username уже используются' });
        return;
      }

      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }
);



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
