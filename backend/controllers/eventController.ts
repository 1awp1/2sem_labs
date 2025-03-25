import { Request, Response } from 'express';

/**
 * Получить список событий
 * @param req - Запрос от клиента
 * @param res - Ответ сервера
 */
export const getEvents = (req: Request, res: Response): void => {
  // Логика для получения событий
  res.send('Это публичный маршрут для событий');
};

export default getEvents;
