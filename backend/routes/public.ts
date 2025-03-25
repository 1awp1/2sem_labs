import express, { Request, Response } from 'express';
import { getEvents } from '../controllers/eventController';

const router = express.Router();

// Публичный маршрут для получения событий
router.get('/events', async (req: Request, res: Response) => {
  try {
    const events = await getEvents(req, res);
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении событий', error });
  }
});

export default router;
