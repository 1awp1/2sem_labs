import swaggerJsdoc from 'swagger-jsdoc';
import { type SwaggerDefinition } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Events API Documentation',
    version: '1.0.0',
    description: 'Документация для API управления мероприятиями',
    contact: {
      name: 'Ваше имя',
      email: 'ваш@email.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000/api-docs',
      description: 'Локальный сервер разработки',
    },
  ],
  tags: [
    {
      name: 'Events',
      description: 'Операции с мероприятиями',
    },
    {
      name: 'Users',
      description: 'Операции с пользователями',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Event: {
        type: 'object',
        properties: {
          id: { type: 'integer', readOnly: true },
          title: { type: 'string', minLength: 3, maxLength: 100 },
          description: { type: 'string', nullable: true },
          date: { type: 'string', format: 'date-time' },
          createdBy: { type: 'integer' },
          category: {
            type: 'string',
            enum: [
              'концерт',
              'лекция',
              'выставка',
              'семинар',
              'мастер-класс',
              'другое',
            ],
            default: 'другое',
          },
          creator: {
            $ref: '#/components/schemas/User',
          },
        },
        required: ['title', 'date', 'createdBy', 'category'],
      },
      EventCreate: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 3, maxLength: 100 },
          description: { type: 'string', nullable: true },
          date: { type: 'string', format: 'date-time' },
          createdBy: { type: 'integer' },
          category: {
            type: 'string',
            enum: [
              'концерт',
              'лекция',
              'выставка',
              'семинар',
              'мастер-класс',
              'другое',
            ],
          },
        },
        required: ['title', 'date', 'createdBy', 'category'],
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', readOnly: true },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          username: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time', readOnly: true },
        },
        required: ['name', 'email', 'password', 'username'],
      },
      Error: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
    },
    responses: {
      UnauthorizedError: {
        description: 'Неверные или отсутствующие учетные данные',
      },
      NotFoundError: {
        description: 'Ресурс не найден',
      },
      ValidationError: {
        description: 'Ошибка валидации входных данных',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./routes/*.ts'], // Убедитесь, что путь соответствует расположению ваших файлов
};

export default swaggerJsdoc(options);
