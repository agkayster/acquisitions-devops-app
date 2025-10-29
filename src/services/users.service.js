import logger from '#config/logger.js';
import { db } from '#config/database.js';
import { users } from '#models/user.model.js';

// function to get all users
export const getAllUsers = async () => {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users);

    return allUsers;
  } catch (error) {
    logger.error('Error fetching all users:', error);
    throw new Error('Error fetching all users');
  }
};
