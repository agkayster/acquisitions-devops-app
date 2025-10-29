import express from 'express';
import { fetchAllUsers } from '#controllers/users.controller.js';

const router = express.Router();

/* GET /users/ */
router.get('/', fetchAllUsers);

/* GET /users/:id details of specific user */
router.get('/:id', (req, res) => res.send('GET /users/:id'));

/* PUT /users/ modify a user */
router.put('/:id', (req, res) => res.send('UPDATE/PUT /users/:id'));

/* DELETE /users/ delete a user */
router.delete('/:id', (req, res) => res.send('DELETE /users/:id'));

export default router;
