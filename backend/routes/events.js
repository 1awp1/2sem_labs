    // routes/events.js
    const express = require('express');
    const router = express.Router();
    const Event = require('../models/Event');
    const User = require('../models/User'); // Необходимо для связи с пользователем

    // Получение списка всех мероприятий (GET /events)
    router.get('/', async (req, res) => {
        try {
            const events = await Event.findAll({
                include: [{ // Подключаем информацию о создателе
                    model: User,
                    as: 'creator', // Псевдоним, указанный в Event.belongsTo
                    attributes: ['id', 'name', 'email'] // Только нужные поля
                }]
            });
            res.status(200).json(events);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    });

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

    // Создание мероприятия (POST /events)
    router.post('/', async (req, res) => {
        try {
            const { title, description, date, createdBy } = req.body;

            if (!title || !date || !createdBy) {
                return res.status(400).json({ message: 'Please provide title, date, and createdBy' });
            }

            // Проверяем, существует ли пользователь с таким ID
            const user = await User.findByPk(createdBy);
            if (!user) {
                return res.status(400).json({ message: 'User not found' });
            }

            const event = await Event.create({
                title,
                description,
                date,
                createdBy
            });
            res.status(201).json(event);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    });

    // Обновление мероприятия (PUT /events/:id)
    router.put('/:id', async (req, res) => {
        try {
            const { title, description, date, createdBy } = req.body;
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

            await event.update({
                title: title || event.title,
                description: description || event.description,
                date: date || event.date,
                createdBy: createdBy || event.createdBy
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