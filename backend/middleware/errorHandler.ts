import { Request, Response, NextFunction } from 'express';

interface ErrorWithStatus extends Error {
  statusCode?: number;
  message: string;
  stack?: string;
  name: string;
  errors?: Array<{ message: string }>;
  code?: number;
}

interface ValidationError {
  message: string;
  [key: string]: unknown;
}

/**
 * Обработчик ошибок для Express.
 * @param err - Ошибка
 * @param req - Запрос
 * @param res - Ответ
 */
function errorHandler(
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  // Указываем, что параметр намеренно не используется
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
): void {
  console.error(err.stack);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Внутренняя ошибка сервера';
  let errors: string[] = [];

  // Обработка ошибок валидации
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Ошибка валидации данных';
    if (err.errors) {
      errors = Object.values(
        err.errors as unknown as Record<string, ValidationError>,
      ).map((val) => val.message);
    }
  }

  // Обработка ошибок Sequelize
  if (
    err.name === 'SequelizeValidationError' ||
    err.name === 'SequelizeUniqueConstraintError'
  ) {
    statusCode = err.name === 'SequelizeUniqueConstraintError' ? 409 : 400;
    message =
      err.name === 'SequelizeUniqueConstraintError'
        ? 'Конфликт данных (нарушение уникальности)'
        : 'Ошибка валидации данных (Sequelize)';

    if (err.errors) {
      errors = err.errors.map((e) => e.message);
    }
  }

  // Обработка ошибок MongoDB
  if (err.name === 'MongoError' && err.code === 11000) {
    statusCode = 409;
    message = 'Дублирующиеся данные';
    errors.push('Запись с такими данными уже существует.');
  }

  // Обработка ошибок авторизации
  if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Не авторизован';
  }

  // Обработка ошибки "слишком много запросов"
  if (err.message.includes('Слишком много запросов')) {
    statusCode = 429;
  }

  // Обработка ошибок null-полей
  if (
    err.name === 'SequelizeDatabaseError' &&
    err.message.includes('column cannot be null')
  ) {
    statusCode = 400;
    message = 'Отсутствуют необходимые данные.';
  }

  res.status(statusCode).json({
    error: {
      message,
      errors: errors.length > 0 ? errors : undefined,
    },
  });
}

export default errorHandler;
