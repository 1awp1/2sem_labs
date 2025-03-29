import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { sequelize, authenticate } from '@config/db';
import eventRoutes from '@routes/events';
import userRoutes from '@routes/users';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from 'swaggerOptions';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import rateLimit from 'express-rate-limit';
import errorHandler from '@middleware/errorHandler';
import passport from 'passport';
import { configurePassport } from '@config/passport';
import authRoutes from '@routes/auth';
import publicRoutes from '@routes/public';
import protectedRoutes from '@routes/index';
import session from 'express-session';
import { Request, Response } from 'express';
import { ErrorRequestHandler } from 'express-serve-static-core';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

// Кастомный интерфейс для ошибок парсинга JSON
interface SyntaxErrorWithStatus extends SyntaxError {
  status?: number;
  body?: string;
}

const app = express();
const port = process.env.PORT || 3000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Слишком много запросов с вашего IP, попробуйте позже.',
});

// Middlewares
app.use(limiter);
app.use(cors());
app.use(
  express.json({
    strict: true,
    limit: '1mb',
  }),
);

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || '1234',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  }),
);

// Passport configuration
configurePassport(passport);
app.use(passport.initialize());
app.use(passport.session());

// Swagger documentation
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Events API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
    explorer: true,
  }),
);

// Routes
app.use('/public', publicRoutes);
app.use('/auth', authRoutes);
app.use('/events', eventRoutes);
app.use('/users', userRoutes);
app.use('/', publicRoutes);
app.use('/protected', protectedRoutes);

const jsonErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const syntaxError = err as SyntaxErrorWithStatus;

  if (
    syntaxError instanceof SyntaxError &&
    syntaxError.status === 400 &&
    'body' in syntaxError
  ) {
    console.error('Bad JSON:', syntaxError);
    res.status(400).send({ error: 'Invalid JSON format' });
    return;
  }

  next(err);
};
app.use(jsonErrorHandler);

// Logging
const logStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {
  flags: 'a',
});
app.use(morgan('combined', { stream: logStream }));
app.use(morgan('dev'));

// Central error handling
app.use(errorHandler);

// Protected route
app.get(
  '/protected',
  passport.authenticate('jwt', { session: false }),
  (req: Request, res: Response) => {
    res.send('Вы получили доступ к защищенному ресурсу!');
  },
);

// Health check
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello from Express!' });
});

// Database synchronization
sequelize
  .sync({ force: false })
  .then(() => console.log('Database synced successfully.'))
  .catch((err: Error) => console.error('Error syncing database:', err));

// Database authentication
authenticate()
  .then(() => console.log('Database connection successful.'))
  .catch((err: Error) =>
    console.error('Error connecting to the database:', err),
  );

// Server startup
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use.`);
  } else {
    console.error('Error starting server:', err);
  }
  process.exit(1);
});

export default app;
