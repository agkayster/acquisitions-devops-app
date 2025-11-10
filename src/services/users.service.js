import logger from '#config/logger.js';
import { db } from '#config/database.js';
import { users } from '#models/user.model.js';
import { eq } from 'drizzle-orm';

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

// Get user by ID
export const getUserById = async userId => {
  try {
    const user = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || user.length === 0) {
      return null;
    }

    return user[0];
  } catch (error) {
    logger.error(`Error fetching user ${userId}:`, error);
    throw new Error('Error fetching user');
  }
};

// Update user by ID
export const updateUserById = async (userId, updateData) => {
  try {
    // Build update object dynamically (only include provided fields)
    const fieldsToUpdate = {};
    
    if (updateData.name !== undefined) fieldsToUpdate.name = updateData.name;
    if (updateData.email !== undefined) fieldsToUpdate.email = updateData.email;
    if (updateData.role !== undefined) fieldsToUpdate.role = updateData.role;
    if (updateData.password !== undefined) fieldsToUpdate.password = updateData.password;
    
    // Always update the updated_at timestamp
    fieldsToUpdate.updated_at = new Date();

    // Check if there are fields to update
    if (Object.keys(fieldsToUpdate).length === 1) {
      // Only updated_at, nothing else to update
      throw new Error('No valid fields provided for update');
    }

    const updatedUser = await db
      .update(users)
      .set(fieldsToUpdate)
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      });

    if (!updatedUser || updatedUser.length === 0) {
      return null;
    }

    return updatedUser[0];
  } catch (error) {
    logger.error(`Error updating user ${userId}:`, error);
    throw error;
  }
};

// Delete user by ID
export const deleteUserById = async (userId) => {
  try {
    const deletedUser = await db
      .delete(users)
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
      });

    if (!deletedUser || deletedUser.length === 0) {
      return null;
    }

    return deletedUser[0];
  } catch (error) {
    logger.error(`Error deleting user ${userId}:`, error);
    throw new Error('Error deleting user');
  }
};
