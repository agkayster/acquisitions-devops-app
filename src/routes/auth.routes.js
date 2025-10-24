import { signup, signin, signout } from '#controllers/auth.controller.js';
import express from 'express';
import { ajAuth } from '#config/arcjet.js';
import { arcjetMiddleware } from '#middleware/arcjet.middleware.js';

/* router allows you to create routes */
const router = express.Router();

// Apply strict Arcjet protection to authentication routes
router.post('/sign-up', arcjetMiddleware(ajAuth), signup);
router.post('/sign-in', arcjetMiddleware(ajAuth), signin);
router.post('/sign-out', arcjetMiddleware(ajAuth), signout);

export default router;
