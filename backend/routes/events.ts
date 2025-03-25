import express, { type Request, type Response, type Router } from 'express';
import passport from 'passport';
import { type WhereOptions } from 'sequelize';
import Event from '../models/Event';
import User from '../models/User';
import Category from '../models/Category';
import { getEvents } from '../controllers/eventController';

const router: Router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

// Определение типов
type EventCategory =
  | 'концерт'
  | 'лекция'
  | 'выставка'
  | 'семинар'
  | 'мастер-класс'
  | 'другое';

interface EventModelAttributes {
  id: number;
  title: string;
  description?: string;
  date: Date;
  createdBy: number;
  category: EventCategory;
}

interface EventRequestQuery {
  category?: EventCategory;
}

interface EventRequestParams {
  id: string;
}

interface EventRequestBody {
  title: string;
  description?: string;
  date: Date;
  createdBy: number;
  category: EventCategory;
}

interface EventResponse {
  id: number;
  title: string;
  description?: string;
  date: string; // Изменено на string для API
  createdBy: number;
  category: EventCategory;
  creator?: {
    id: number;
    name: string;
    email: string;
  };
}

interface ErrorResponse {
  message: string;
}

type EmptyParams = Record<string, never>;

// Функция преобразования модели в ответ API
function formatEventResponse(event: Event): EventResponse {
  return {
    id: event.id,
    title: event.title,
    description: event.description || undefined,
    date: event.date.toISOString(), // Преобразуем Date в string
    createdBy: event.createdBy,
    category: event.category,
    creator: event.creator
      ? {
          id: event.creator.id,
          name: event.creator.name,
          email: event.creator.email,
        }
      : undefined,
  };
}

router.get('/events', getEvents);

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Получить список мероприятий
 *     description: Возвращает список всех мероприятий с возможностью фильтрации по категории
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [концерт, лекция, выставка, семинар, мастер-класс, другое]
 *         description: Категория для фильтрации мероприятий
 *     responses:
 *       200:
 *         description: Успешный запрос
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get<
  EmptyParams,
  EventResponse[] | ErrorResponse,
  unknown,
  EventRequestQuery
>(
  '/',
  async (
    req: Request<
      EmptyParams,
      EventResponse[] | ErrorResponse,
      unknown,
      EventRequestQuery
    >,
    res: Response<EventResponse[] | ErrorResponse>,
  ) => {
    try {
      console.log(
        `[GET /events] Начало обработки запроса. Query params: ${JSON.stringify(req.query)}`,
      );

      const whereClause: WhereOptions<EventModelAttributes> = {};
      if (req.query.category) {
        whereClause.category = req.query.category;
      }

      const events = await Event.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name', 'email'],
          },
        ],
      });

      const formattedEvents = events.map(formatEventResponse);
      console.log(
        `[GET /events] Успешно получено ${events.length} мероприятий.`,
      );
      res.status(200).json(formattedEvents);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  },
);

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Получает мероприятие по ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Успешный ответ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Неверный ID
 *       404:
 *         description: Мероприятие не найдено
 *       500:
 *         description: Ошибка сервера
 */
router.get<EventRequestParams, EventResponse | ErrorResponse>(
  '/:id',
  async (
    req: Request<EventRequestParams>,
    res: Response<EventResponse | ErrorResponse>,
  ) => {
    try {
      const eventId = parseInt(req.params.id, 10);
      if (isNaN(eventId)) {
        res.status(400).json({ message: 'Invalid event ID' });
        return;
      }

      const event = await Event.findByPk(eventId, {
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name', 'email'],
          },
        ],
      });

      if (!event) {
        res.status(404).json({ message: 'Event not found' });
        return;
      }

      res.status(200).json(formatEventResponse(event));
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  },
);

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Создает новое мероприятие
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventCreate'
 *     responses:
 *       201:
 *         description: Успешно создано
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Неверные данные
 *       500:
 *         description: Ошибка сервера
 */
router.post<EmptyParams, EventResponse | ErrorResponse, EventRequestBody>(
  '/',
  async (
    req: Request<EmptyParams, EventResponse | ErrorResponse, EventRequestBody>,
    res: Response<EventResponse | ErrorResponse>,
  ) => {
    try {
      console.log(
        `[POST /events] Начало обработки запроса. Body: ${JSON.stringify(req.body)}`,
      );

      const { title, description, date, createdBy, category } = req.body;

      if (!title || !date || !createdBy || !category) {
        res.status(400).json({
          message: 'Please provide title, date, createdBy and category',
        });
        return;
      }

      const user = await User.findByPk(createdBy);
      if (!user) {
        res.status(400).json({ message: 'User not found' });
        return;
      }

      const existingCategory = await Category.findAll({
        where: { name: category },
      });

      if (!existingCategory) {
        res.status(400).json({ message: 'Invalid category' });
        return;
      }

      const event = await Event.create({
        title,
        description,
        date,
        createdBy,
        category,
      });

      console.log(
        `[POST /events] Мероприятие успешно создано. ID: ${event.id}`,
      );
      res.status(201).json(formatEventResponse(event));
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  },
);

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Обновляет мероприятие
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventUpdate'
 *     responses:
 *       200:
 *         description: Успешно обновлено
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Неверные данные
 *       404:
 *         description: Мероприятие не найдено
 *       500:
 *         description: Ошибка сервера
 */
router.put<EventRequestParams, EventResponse | ErrorResponse, EventRequestBody>(
  '/:id',
  async (
    req: Request<
      EventRequestParams,
      EventResponse | ErrorResponse,
      EventRequestBody
    >,
    res: Response<EventResponse | ErrorResponse>,
  ) => {
    try {
      const { title, description, date, createdBy, category } = req.body;
      const event = await Event.findByPk(req.params.id);

      if (!event) {
        res.status(404).json({ message: 'Event not found' });
        return;
      }

      if (createdBy) {
        const user = await User.findByPk(createdBy);
        if (!user) {
          res.status(400).json({ message: 'User not found' });
          return;
        }
      }

      if (category) {
        const existingCategory = await Category.findAll({
          where: { name: category },
        });

        if (!existingCategory) {
          res.status(400).json({ message: 'Invalid category' });
          return;
        }
      }

      await event.update({
        title: title || event.title,
        description: description || event.description,
        date: date || event.date,
        createdBy: createdBy || event.createdBy,
        category: category || event.category,
      });

      res.status(200).json(formatEventResponse(event));
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  },
);

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Удаляет мероприятие
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Успешно удалено
 *       404:
 *         description: Мероприятие не найдено
 *       500:
 *         description: Ошибка сервера
 */
router.delete<EventRequestParams, void | ErrorResponse>(
  '/:id',
  async (
    req: Request<EventRequestParams>,
    res: Response<void | ErrorResponse>,
  ) => {
    try {
      const event = await Event.findByPk(req.params.id);
      if (!event) {
        res.status(404).json({ message: 'Event not found' });
        return;
      }
      await event.destroy();
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  },
);

export default router;
