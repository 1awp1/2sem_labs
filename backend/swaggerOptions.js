// swaggerOptions.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'Документация для API вашего приложения',
    },
    components: {
      schemas: {
        Event: {  // Описание модели Event
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID мероприятия'
            },
            title: {
              type: 'string',
              description: 'Название мероприятия'
            },
            description: {
              type: 'string',
              description: 'Описание мероприятия'
            },
            date: {
              type: 'string',
              format: 'date-time',
              description: 'Дата и время мероприятия'
            },
            category: {
              type: 'string',
              description: 'Категория мероприятия'
            },
            creatorId: {
              type: 'integer',
              description: 'ID создателя мероприятия'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Время создания'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Время обновления'
            },
             creator: {  // Описание связанной модели User
               type: 'object',
               properties: {
                 id: {
                   type: 'integer',
                   description: 'ID пользователя'
                 },
                 name: {
                   type: 'string',
                   description: 'Имя пользователя'
                 },
                 email: {
                   type: 'string',
                   description: 'Email пользователя'
                 }
               }
             }
          },
          required: [  // Список обязательных полей
            'title',
            'description',
            'date',
            'category',
            'creatorId'
          ]
        }
      }
    }
  },
  apis: ['./routes/*.js', './models/*.js'], // Пути к файлам с API endpoints и моделями
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;