import logger from '#config/logger.js';
import {
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
} from '#services/users.service.js';

// import { validate as isUUID } from 'uuid';

export const fetchAllUsers = async (req, res, next) => {
  try {
    logger.info('Fetching all users...');

    const allUsers = await getAllUsers();

    res.status(200).json({
      message: 'All users fetched successfully',
      users: allUsers,
      count: allUsers.length,
    });
  } catch (error) {
    logger.error('Error getting all users:', error);
    next(error);
  }
};

// Fetch specific user by ID
export const fetchUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    //Validate UUID format
    // if (!isUUID(id)) {
    //   return res.status(400).json({
    //     message: 'Invalid user ID format',
    //     error: 'User ID must be a valid UUID',
    //   });
    // }

    logger.info(`Fetching user with ID: ${id}`);

    const user = await getUserById(id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        error: `No user exists with ID: ${id}`,
      });
    }

    res.status(200).json({
      message: 'User fetched successfully',
      user,
    });
  } catch (error) {
    logger.error(`Error getting user ${req.params.id}:`, error);
    next(error);
  }
};

// Update specific user by ID
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const requestingUser = req.user; // From authenticate middleware. User that has just signed in and authenticated

    console.log('get type of id =>', typeof id);
    console.log('get type of userId =>', typeof requestingUser.userId);

    const authenticatedId = +id;
    const requestingUserId = +requestingUser.userId;

    // Validate UUID format
    // if (!isUUID(id)) {
    //   return res.status(400).json({
    //     message: 'Invalid user ID format',
    //     error: 'User ID must be a valid UUID',
    //   });
    // }

    // Validate that at least one field is provided
    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message: 'No update data provided',
        error: 'Request body must contain at least one field to update',
      });
    }

    // Check if user exists first
    const existingUser = await getUserById(authenticatedId);
    if (!existingUser) {
      return res.status(404).json({
        message: 'User not found',
        error: `No user exists with ID: ${authenticatedId}`,
      });
    }

    // AUTHORIZATION LOGIC: Role changes restricted to admins
    if (updateData.role !== undefined) {
      if (requestingUser.role !== 'admin') {
        return res.status(403).json({
          message: 'Access denied',
          error: 'Only administrators can change user roles',
        });
      }
      logger.info(
        `Admin ${requestingUser.email} changing role for user ${authenticatedId}`
      );
    }

    // Regular users can only update their own non-role fields
    if (
      requestingUser.role !== 'admin' &&
      requestingUserId !== authenticatedId
    ) {
      return res.status(403).json({
        message: 'Access denied',
        error: 'You can only update your own account',
      });
    }

    logger.info(`Updating user with ID: ${id} by ${requestingUser.email}`);

    const updatedUser = await updateUserById(id, updateData);

    res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    logger.error(`Error updating user ${req.params.id}:`, error);

    if (error.message === 'No valid fields provided for update') {
      return res.status(400).json({
        message: 'Invalid update data',
        error: error.message,
      });
    }

    next(error);
  }
};

// Delete specific user by ID
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate UUID format
    // if (!isUUID(id)) {
    //   return res.status(400).json({
    //     message: 'Invalid user ID format',
    //     error: 'User ID must be a valid UUID',
    //   });
    // }

    logger.info(`Deleting user with ID: ${id}`);

    const deletedUser = await deleteUserById(id);

    if (!deletedUser) {
      return res.status(404).json({
        message: 'User not found',
        error: `No user exists with ID: ${id}`,
      });
    }

    res.status(200).json({
      message: 'User deleted successfully',
      user: deletedUser,
    });
  } catch (error) {
    logger.error(`Error deleting user ${req.params.id}:`, error);
    next(error);
  }
};
