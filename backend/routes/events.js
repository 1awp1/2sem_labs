// routes/events.js
import express from 'express';
import passport from "passport";
import Event from '../models/Event.js';
import User from '../models/User.js'; // Необходимо для связи с пользователем
import Category from '../models/Category.js'; // Импортируйте вашу модель Category
import { Op } from 'sequelize'; // Для фильтрации
import { getEvents } from '../controllers/eventController.js';

const router = express.Router();

// Применяем аутентификацию ко всем маршрутам внутри этого файла
router.use(passport.authenticate("jwt", { session: false }));

// Защищенный маршрут для создания событий
router.get('/events', getEvents);
/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Операции с мероприятиями
 */

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Получает список всех мероприятий
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: category
 *         required: false
 *         schema:
 *           type: string
 *           enum: ['концерт', 'лекция', 'выставка', 'семинар', 'мастер-класс', 'другое']
 *         description: Фильтр по категории мероприятия. Если не указано, возвращает все мероприятия.
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// Получение списка всех мероприятий (GET /events)
router.get('/', async (req, res) => {
        try {
//....      
            console.log(`[GET /events] Начало обработки запроса. Query params: ${JSON.stringify(req.query)}`);
            const { category } = req.query;  // Получаем параметр category из query params
            const whereClause = {}; // Объект для условий WHERE
    
            if (category) {
                whereClause.category = category;  // Добавляем условие по категории
            }
//....
            const events = await Event.findAll({
                //...
                where: whereClause, // Передаем объект с условиями в findAll
                include: [{ // Подключаем информацию о создателе
                //...
                    model: User,
                    as: 'creator', // Псевдоним, указанный в Event.belongsTo
                    attributes: ['id', 'name', 'email'] // Только нужные поля
                }]
            });
            console.log(`[GET /events] Успешно получено ${events.length} мероприятий.`);
            res.status(200).json(events);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    });

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
 *         description: ID мероприятия (должен быть целым числом)
 *     responses:
 *       200:
 *         description: Успешный ответ с информацией о мероприятии
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Неверный ID мероприятия
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Мероприятие не найдено
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
   // Получение одного мероприятия по ID (GET /events/:id)
router.get('/:id', async (req, res) => {
    try {
        const eventId = parseInt(req.params.id, 10); // Извлекаем ID и преобразуем в число
        if (isNaN(eventId)) {
            return res.status(400).json({ message: 'Invalid event ID' }); // Проверка на валидность ID
        }

        const event = await Event.findByPk(eventId, {
            include: [{ // Подключаем информацию о создателе
                model: User,
                as: 'creator', // Псевдоним, указанный в Event.belongsTo
                attributes: ['id', 'name', 'email'] // Только нужные поля
            }]
        });
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.status(200).json(event);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

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
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Название мероприятия
 *               description:
 *                 type: string
 *                 description: Описание мероприятия
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Дата и время мероприятия (в формате ISO 8601)
 *               createdBy:
 *                 type: integer
 *                 description: ID создателя мероприятия (должен соответствовать существующему пользователю)
 *               category:
 *                 type: string
 *                 enum: ['концерт', 'лекция', 'выставка', 'семинар', 'мастер-класс', 'другое']
 *                 description: Категория мероприятия
 *             required:
 *               - title
 *               - description
 *               - date
 *               - createdBy
 *               - category
 *     responses:
 *       201:
 *         description: Успешное создание мероприятия
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Неверный ввод данных
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

// Создание мероприятия (POST /events)
router.post('/', async (req, res) => {
        try {
            console.log(`[POST /events] Начало обработки запроса. Body: ${JSON.stringify(req.body)}`);
            //.. category в условие поставил
            const { title, description, date, createdBy, category } = req.body;
            //.. category в условие поставил
            if (!title || !date || !createdBy || !category) {
                return res.status(400).json({ message: 'Please provide title, date, createdBy and category' });//.. Добавил сообщение category
            }

            // Проверяем, существует ли пользователь с таким ID
            const user = await User.findByPk(createdBy);
            if (!user) {
                return res.status(400).json({ message: 'User not found' });
            }
            
            //..
            const existingCategory = await Category.findAll({
                where: { name: category.toLowerCase() } // Приводим к нижнему регистру
            });
            

            if (!existingCategory) {
                return res.status(400).json({ message: 'Invalid category' });
            }
            //..

            const event = await Event.create({
                title,
                description,
                date,
                createdBy,
                category // добавил к созданию
            });
            console.log(`[POST /events] Мероприятие успешно создано. ID: ${event.id}`);
            res.status(201).json(event);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    });

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Обновляет мероприятие по ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID мероприятия (должен быть целым числом)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Название мероприятия
 *               description:
 *                 type: string
 *                 description: Описание мероприятия
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Дата и время мероприятия (в формате ISO 8601)
 *               createdBy:
 *                 type: integer
 *                 description: ID создателя мероприятия (должен соответствовать существующему пользователю)
 *               category:
 *                 type: string
 *                 enum: ['концерт', 'лекция', 'выставка', 'семинар', 'мастер-класс', 'другое']
 *                 description: Категория мероприятия
 *             required: []
 *     responses:
 *       200:
 *         description: Успешное обновление мероприятия
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Неверный ввод данных или пользователь/категория не найдены
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Мероприятие не найдено
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
// Обновление мероприятия (PUT /events/:id)
router.put('/:id', async (req, res) => {
        try {
            //..Добавил category
            const { title, description, date, createdBy, category } = req.body;
            const event = await Event.findByPk(req.params.id);

            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }

            // Проверяем, существует ли пользователь с таким ID
            if (createdBy) {
                const user = await User.findByPk(createdBy);
                if (!user) {
                    return res.status(400).json({ message: 'User not found' });
                }
            }

            //..
            
            const existingCategory = await Category.findAll({
                where: { name: category }
            });

            if (!existingCategory) {
                return res.status(400).json({ message: 'Invalid category' });
            }
            //..

            await event.update({
                title: title || event.title,
                description: description || event.description,
                date: date || event.date,
                createdBy: createdBy || event.createdBy,
                category: category || event.category // добавил в условие корректироваку
            });
            res.status(200).json(event);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    });

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Удаляет мероприятие по ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID мероприятия (должен быть целым числом)
 *     responses:
 *       204:
 *         description: Успешное удаление мероприятия (нет содержимого)
 *       404:
 *         description: Мероприятие не найдено
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
// Удаление мероприятия (DELETE /events/:id)
router.delete('/:id', async (req, res) => {
        try {
            const event = await Event.findByPk(req.params.id);
            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }
            await event.destroy();
            res.status(204).send(); // 204 No Content - успешное удаление
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    });

    export default router;