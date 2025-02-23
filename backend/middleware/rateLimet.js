const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 минута
  max: 100, // Максимальное количество запросов с одного IP за минуту
  message: 'Слишком много запросов с вашего IP, пожалуйста, попробуйте позже.',
  headers: true, // Включить заголовки X-RateLimit-*
});

module.exports = limiter;