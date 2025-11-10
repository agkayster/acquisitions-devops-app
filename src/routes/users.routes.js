import express from 'express';
import {
  fetchAllUsers,
  fetchUserById,
  updateUser,
  deleteUser,
} from '#controllers/users.controller.js';
import {
  authenticate,
  isAdmin,
  isOwnerOrAdmin,
} from '#middleware/auth.middleware.js';

const router = express.Router();

/* GET /users/ */
router.get('/', authenticate, isAdmin, fetchAllUsers);

/* GET /users/:id - Get details of specific user */
router.get('/:id', authenticate, isOwnerOrAdmin, fetchUserById);

/* PUT /users/:id - Modify a user */
router.put('/:id', authenticate, isOwnerOrAdmin, updateUser);

/* DELETE /users/:id - Delete a user */
router.delete('/:id', authenticate, isOwnerOrAdmin, deleteUser);

/* GET /users/ - Fetch all users (admin only) */
// router.get('/', authenticate, isAdmin, fetchAllUsers);

/* GET /users/:id - Get details of specific user (owner or admin) */
// router.get('/:id', authenticate, isOwnerOrAdmin, fetchUserById);

/* PUT /users/:id - Modify a user (owner can update own details, admin can update roles) */
// router.put('/:id', authenticate, isOwnerOrAdmin, updateUser);

/* DELETE /users/:id - Delete a user (owner or admin) */
// router.delete('/:id', authenticate, isOwnerOrAdmin, deleteUser);

export default router;
