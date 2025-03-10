// routes/public.js
import express from "express";
const router = express.Router();

// Импортируйте контроллер для событий
import { getEvents } from "../controllers/eventController.js"; 

// Публичный маршрут для получения событий
router.get("/events", getEvents);

export default router;
