// middleware/errorHandler.js
// Сделано на будущее для оптимизации выдачи ошибок при запросах
function errorHandler(err, req, res, next) {
    console.error(err.stack);

    let statusCode = err.statusCode || 500;
    let message = err.message || 'Внутренняя ошибка сервера';
    let errors = [];

    // Обработка ошибок валидации (пример, если используете express-validator или что-то подобное)
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Ошибка валидации данных';
        errors = Object.values(err.errors).map(val => val.message); // Соберите сообщения об ошибках
    }

    // Обработка ошибок Sequelize (если вы используете Sequelize)
    if (err.name === 'SequelizeValidationError') {
        statusCode = 400;
        message = 'Ошибка валидации данных (Sequelize)';
        errors = err.errors.map(e => e.message); // Sequelize выдает массив ошибок
    }

    if (err.name === 'SequelizeUniqueConstraintError') {
        statusCode = 409; // Conflict
        message = 'Конфликт данных (нарушение уникальности)';
        errors = err.errors.map(e => e.message);
    }

    // Обработка ошибок MongoDB (пример)
    if (err.name === 'MongoError' && err.code === 11000) {
        statusCode = 409; // Conflict
        message = 'Дублирующиеся данные';
        errors.push('Запись с такими данными уже существует.');
    }

    // Пример: Обработка ошибок авторизации
    if (err.name === 'UnauthorizedError') {
        statusCode = 401;
        message = 'Не авторизован';
    }

    // Отлавливаем ошибку "слишком много запросов"
    if (err.message === 'Слишком много запросов с вашего IP, пожалуйста, попробуйте позже.') {
        statusCode = 429; // Too Many Requests
    }

    // Отлавливаем ошибку, если поле отсутствует (особенно актуально для required полей в моделях)
    if (err.name === 'SequelizeDatabaseError' && err.message.includes('column cannot be null')) {
        statusCode = 400;
        message = 'Отсутствуют необходимые данные.'; // Более информативное сообщение
        // Можно извлечь имя поля из err.message, если нужно более точное сообщение
    }

    res.status(statusCode).json({
        error: {
            message: message,
            errors: errors, // Отправляем массив ошибок (если есть)
        },
    });
}

// Используем именованный экспорт
export default errorHandler;
