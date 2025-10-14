import express from 'express';
import logger from '#config/logger.js';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from '#routes/auth.routes.js';

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

app.get('/', (req, res) => {
  logger.info('Root endpoint accessed and Hello from Acquisitions');
  res.status(200).send('Hello from Acquisitions API!');
});

/* adding a health check */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString() /* gives human readable format */,
    uptime: process.uptime() /* determines how long has the server been up */,
  });
});

app.get('/api', (req, res) => {
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

export default app;
