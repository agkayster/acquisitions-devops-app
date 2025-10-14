import express from 'express';
import logger from '#config/logger.js';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';

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

export default app;
