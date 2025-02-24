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
        Event: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID мероприятия',
              readOnly: true
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
              description: 'Категория мероприятия',
              enum: ['концерт', 'лекция', 'выставка', 'семинар', 'мастер-класс', 'другое']
            },
            creatorId: {
              type: 'integer',
              description: 'ID создателя мероприятия'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Время создания',
              readOnly: true
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Время обновления',
              readOnly: true
            },
             creator: {
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
          required: [
            'title',
            'description',
            'date',
            'category',
            'creatorId'
          ]
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID пользователя',
              readOnly: true
            },
            name: {
              type: 'string',
              description: 'Имя пользователя'
            },
            email: {
              type: 'string',
              description: 'Email пользователя'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Время создания',
              readOnly: true
            }
          },
          required: [
            'name',
            'email'
          ]
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Сообщение об ошибке'
            }
          }
        }
      }
    },
    // Security Definitions (optional)
    securityDefinitions: {
      bearerAuth: {
        type: 'apiKey',
        name: 'Authorization',
        scheme: 'bearer',
        in: 'header',
        description: 'Enter JWT Bearer token **_only_**'
      }
    },
    security: [{
      bearerAuth: []
    }],
  },
  apis: ['./routes/*.js', './models/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;