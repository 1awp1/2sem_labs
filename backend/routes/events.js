    // routes/events.js
    const express = require('express');
    const router = express.Router();
    const Event = require('../models/Event');
    const User = require('../models/User'); // Необходимо для связи с пользователем
//...
    const { Op } = require('sequelize'); // Для фильтрации
//...

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Получает список всех мероприятий
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: ['концерт', 'лекция', 'выставка', 'семинар', 'мастер-класс', 'другое']
 *         description: Фильтр по категории мероприятия
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
 *         description: Server error
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
 *         description: ID мероприятия
 *     responses:
 *       200:
 *         description: Успешный ответ с информацией о мероприятии
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Invalid event ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
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
 *                 description: Дата и время мероприятия
 *               createdBy:
 *                 type: integer
 *                 description: ID создателя мероприятия
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
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
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
             // Проверяем, является ли категория допустимым значением ENUM
            const allowedCategories = ['концерт', 'лекция', 'выставка', 'семинар', 'мастер-класс', 'другое'];
            if (!allowedCategories.includes(category)) {
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
              // Проверяем, является ли категория допустимым значением ENUM
              if (category) {
                const allowedCategories = ['концерт', 'лекция', 'выставка', 'семинар', 'мастер-класс', 'другое'];
                if (!allowedCategories.includes(category)) {
                    return res.status(400).json({ message: 'Invalid category' });
                }
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

    module.exports = router;