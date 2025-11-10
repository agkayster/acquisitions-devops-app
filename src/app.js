import express from 'express';
import logger from '#config/logger.js';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from '#routes/auth.routes.js';
import usersRoutes from '#routes/users.routes.js';
import { aj, ajHealth } from '#config/arcjet.js';
import { arcjetMiddleware } from '#middleware/arcjet.middleware.js';
import { error } from 'winston';

const app = express();

app.use(helmet());

app.use(cors());

app.use(
  express.json()
); /* parses json objects through its requests for use in req.body */

app.use(
  express.urlencoded({ extended: true })
); /* allows you to parse incoming requests with url encoded payloads based on body parser */

app.use(
  cookieParser()
); /* parse Cookie header and populate req.cookies with an object keyed by the cookie names */

app.use(
  morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } })
); /* combined means for both dev and production */

app.get('/', arcjetMiddleware(aj), (req, res) => {
  logger.info('Root endpoint accessed and Hello from Acquisitions');
  res.status(200).send('Hello from Acquisitions API!');
});

/* adding a health check */
app.get('/health', arcjetMiddleware(ajHealth), (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString() /* gives human readable format */,
    uptime: process.uptime() /* determines how long has the server been up */,
  });
});

app.get('/api', arcjetMiddleware(aj), (req, res) => {
  res.status(200).json({
    message: 'Welcome to the Acquisitions API',
    version: '1.0.0',
    endpoints: {
      auth: {
        signUp: '/api/auth/sign-up',
        signIn: '/api/auth/sign-in',
        signOut: '/api/auth/sign-out',
      },
      healthCheck: '/health',
    },
  });
});

app.use('/api/auth', authRoutes);
app.use(
  '/api/users',
  /* protect users routes later with auth middleware */ usersRoutes
);

app.use((req, res) => {
  res.status(404).json({ error: 'Route/Endpoint not found' });
});

export default app;
