import logger from '#config/logger.js';
import { getAllUsers } from '#services/users.service.js';

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
